from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, Skill, JournalEntry, Project, 
    LearningResource, CodeSnippet, Goal, CodingActivity
)
from .models import GitHubRepository, GitHubCommit, GitHubContribution

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = '__all__'


class SkillSerializer(serializers.ModelSerializer):
    proficiency_display = serializers.CharField(source='get_proficiency_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ProjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class LearningResourceSerializer(serializers.ModelSerializer):
    resource_type_display = serializers.CharField(source='get_resource_type_display', read_only=True)
    
    class Meta:
        model = LearningResource
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class CodeSnippetSerializer(serializers.ModelSerializer):
    language_display = serializers.CharField(source='get_language_display', read_only=True)
    
    class Meta:
        model = CodeSnippet
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class CodingActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CodingActivity
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_journal_entries = serializers.IntegerField()
    total_projects = serializers.IntegerField()
    total_skills = serializers.IntegerField()
    total_resources = serializers.IntegerField()
    total_snippets = serializers.IntegerField()
    total_goals = serializers.IntegerField()
    active_goals = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    total_coding_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    current_streak = serializers.IntegerField()


# Add these imports at the top

# Add after existing serializers

class GitHubRepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GitHubRepository
        fields = '__all__'
        read_only_fields = ['user']


class GitHubCommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = GitHubCommit
        fields = '__all__'
        read_only_fields = ['user']


class GitHubContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GitHubContribution
        fields = '__all__'
        read_only_fields = ['user']


class GitHubStatsSerializer(serializers.Serializer):
    total_repos = serializers.IntegerField()
    total_commits = serializers.IntegerField()
    total_stars = serializers.IntegerField()
    total_forks = serializers.IntegerField()
    top_languages = serializers.DictField()
    contribution_streak = serializers.IntegerField()
    last_sync = serializers.DateTimeField(allow_null=True)