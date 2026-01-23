from django.contrib import admin
from .models import (
    Profile, Skill, JournalEntry, Project,
    LearningResource, CodeSnippet, Goal, CodingActivity
)
from .models import (
    GitHubRepository, GitHubCommit, GitHubContribution  # NEW
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'github_username', 'created_at']
    search_fields = ['user__username', 'github_username']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'category', 'proficiency', 'created_at']
    list_filter = ['category', 'proficiency']
    search_fields = ['name', 'user__username']

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'date', 'mood', 'is_public']
    list_filter = ['is_public', 'mood', 'date']
    search_fields = ['title', 'content', 'user__username']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'status', 'is_featured', 'created_at']
list_filter = ['status', 'is_featured']
search_fields = ['name', 'description', 'user__username']
@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
   search_fields = ['title', 'description', 'user__username']
@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
   list_display = ['title', 'user', 'language', 'is_favorite', 'created_at']
   list_filter = ['language', 'is_favorite']
   search_fields = ['title', 'description', 'code', 'user__username']
@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
   list_display = ['title', 'user', 'status', 'progress', 'target_date']
   list_filter = ['status']
   search_fields = ['title', 'description', 'user__username']
@admin.register(CodingActivity)
class CodingActivityAdmin(admin.ModelAdmin):
   list_display = ['user', 'date', 'hours_coded', 'commits', 'lines_of_code']
   list_filter = ['date']
   search_fields = ['user__username']


# ... existing admin registrations ...

@admin.register(GitHubRepository)
class GitHubRepositoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'language', 'stargazers_count', 'forks_count', 'updated_at']
    list_filter = ['language', 'is_private', 'is_fork']
    search_fields = ['name', 'description', 'user__username']

@admin.register(GitHubCommit)
class GitHubCommitAdmin(admin.ModelAdmin):
    list_display = ['sha', 'user', 'repository', 'commit_date']
    list_filter = ['commit_date']
    search_fields = ['message', 'repository', 'user__username']

@admin.register(GitHubContribution)
class GitHubContributionAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'count']
    list_filter = ['date']
    search_fields = ['user__username']