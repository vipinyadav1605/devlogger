from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
from .models import (
    Profile, Skill, JournalEntry, Project,
    LearningResource, CodeSnippet, Goal, CodingActivity
)
from .serializers import (
    UserSerializer, RegisterSerializer, ProfileSerializer,
    SkillSerializer, JournalEntrySerializer, ProjectSerializer,
    LearningResourceSerializer, CodeSnippetSerializer,
    GoalSerializer, CodingActivitySerializer, DashboardStatsSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    
    # Calculate current streak
    activities = CodingActivity.objects.filter(user=user).order_by('-date')
    streak = 0
    if activities.exists():
        current_date = datetime.now().date()
        for activity in activities:
            if activity.date == current_date - timedelta(days=streak):
                streak += 1
            else:
                break
    
    stats = {
        'total_journal_entries': JournalEntry.objects.filter(user=user).count(),
        'total_projects': Project.objects.filter(user=user).count(),
        'total_skills': Skill.objects.filter(user=user).count(),
        'total_resources': LearningResource.objects.filter(user=user).count(),
        'total_snippets': CodeSnippet.objects.filter(user=user).count(),
        'total_goals': Goal.objects.filter(user=user).count(),
        'active_goals': Goal.objects.filter(user=user, status='active').count(),
        'completed_projects': Project.objects.filter(user=user, status='completed').count(),
        'total_coding_hours': CodingActivity.objects.filter(user=user).aggregate(
            total=Sum('hours_coded')
        )['total'] or 0,
        'current_streak': streak,
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'proficiency']
    search_fields = ['name', 'notes']
    ordering_fields = ['proficiency', 'name', 'created_at']

    def get_queryset(self):
        return Skill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class JournalEntryViewSet(viewsets.ModelViewSet):
    serializer_class = JournalEntrySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['date', 'mood', 'is_public']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['date', 'created_at']

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'is_featured']
    search_fields = ['name', 'description', 'technologies']
    ordering_fields = ['created_at', 'start_date']

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LearningResourceViewSet(viewsets.ModelViewSet):
    serializer_class = LearningResourceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['resource_type', 'is_completed', 'is_favorite']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return LearningResource.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CodeSnippetViewSet(viewsets.ModelViewSet):
    serializer_class = CodeSnippetSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['language', 'is_favorite']
    search_fields = ['title', 'description', 'code', 'tags']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return CodeSnippet.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'target_date', 'progress']

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CodingActivityViewSet(viewsets.ModelViewSet):
    serializer_class = CodingActivitySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['date']
    ordering_fields = ['date']

    def get_queryset(self):
        return CodingActivity.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def weekly_stats(self, request):
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=7)
        
        activities = CodingActivity.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        ).order_by('date')
        
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def monthly_stats(self, request):
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=30)
        
        activities = CodingActivity.objects.filter(
            user=request.user,
            date__range=[start_date, end_date]
        ).order_by('date')
        
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
    





# Add these imports at the top
from .models import GitHubRepository, GitHubCommit, GitHubContribution
from .serializers import (
    GitHubRepositorySerializer, 
    GitHubCommitSerializer, 
    GitHubContributionSerializer,
    GitHubStatsSerializer
)
from .github_service import sync_github_data
from django.db.models import Sum, Count
from collections import Counter

# Add these new ViewSets

class GitHubRepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GitHubRepositorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GitHubRepository.objects.filter(user=self.request.user)


class GitHubCommitViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GitHubCommitSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GitHubCommit.objects.filter(user=self.request.user)


class GitHubContributionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GitHubContributionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GitHubContribution.objects.filter(user=self.request.user)


# Add these new API endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sync_github(request):
    """Sync GitHub data for the current user"""
    user = request.user
    profile = user.profile
    
    if not profile.github_username:
        return Response(
            {'error': 'GitHub username not set in profile'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = sync_github_data(
            user=user,
            username=profile.github_username,
            access_token=profile.github_access_token
        )
        return Response({
            'message': 'GitHub data synced successfully',
            'stats': result
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def github_stats(request):
    """Get GitHub statistics for the current user"""
    user = request.user
    # Calculate stats
    repos = GitHubRepository.objects.filter(user=user)
    commits = GitHubCommit.objects.filter(user=user)
    contributions = GitHubContribution.objects.filter(user=user)
    
    total_stars = repos.aggregate(total=Sum('stargazers_count'))['total'] or 0
    total_forks = repos.aggregate(total=Sum('forks_count'))['total'] or 0
    
    # Top languages
    languages = repos.exclude(language__isnull=True).values_list('language', flat=True)
    language_counts = Counter(languages)
    top_languages = dict(language_counts.most_common(5))
    
    # Calculate streak
    contribution_dates = contributions.filter(count__gt=0).order_by('-date').values_list('date', flat=True)
    streak = 0
    if contribution_dates:
        current_date = datetime.now().date()
        for date in contribution_dates:
            if date == current_date or date == current_date - timedelta(days=streak):
                streak += 1
                current_date = date
            else:
                break
    
    stats = {
        'total_repos': repos.count(),
        'total_commits': commits.count(),
        'total_stars': total_stars,
        'total_forks': total_forks,
        'top_languages': top_languages,
        'contribution_streak': streak,
        'last_sync': user.profile.last_github_sync
    }
    
    serializer = GitHubStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def github_contribution_graph(request):
    """Get contribution graph data for the last 365 days"""
    user = request.user
    days = int(request.query_params.get('days', 365))
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)
    
    contributions = GitHubContribution.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    ).order_by('date')
    
    serializer = GitHubContributionSerializer(contributions, many=True)
    return Response(serializer.data)