from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'profiles', views.ProfileViewSet, basename='profile')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'journal', views.JournalEntryViewSet, basename='journal')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'resources', views.LearningResourceViewSet, basename='resource')
router.register(r'snippets', views.CodeSnippetViewSet, basename='snippet')
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'activities', views.CodingActivityViewSet, basename='activity')
router.register(r'github/repos', views.GitHubRepositoryViewSet, basename='github-repo')
router.register(r'github/commits', views.GitHubCommitViewSet, basename='github-commit')
router.register(r'github/contributions', views.GitHubContributionViewSet, basename='github-contribution')
urlpatterns = [

    path('auth/register/', views.register, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', views.current_user, name='current_user'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('github/sync/', views.sync_github, name='github-sync'),
    path('github/stats/', views.github_stats, name='github-stats'),
    path('github/graph/', views.github_contribution_graph, name='github-graph'),
    path('', include(router.urls)),
]