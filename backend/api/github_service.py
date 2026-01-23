import requests
from datetime import datetime, timedelta
from django.utils import timezone
from .models import GitHubRepository, GitHubCommit, GitHubContribution


class GitHubService:
    BASE_URL = "https://api.github.com"
    
    def __init__(self, username, access_token=None):
        self.username = username
        self.access_token = access_token
        self.headers = {
            'Accept': 'application/vnd.github.v3+json'
        }
        if access_token:
            self.headers['Authorization'] = f'token {access_token}'
    
    def fetch_user_repos(self):
        """Fetch all repositories for the user"""
        url = f"{self.BASE_URL}/users/{self.username}/repos"
        params = {
            'per_page': 100,
            'sort': 'updated',
            'type': 'all'
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching repos: {e}")
            return []
    
    def fetch_user_commits(self, days=30):
        """Fetch commits from the last N days"""
        since = (datetime.now() - timedelta(days=days)).isoformat()
        url = f"{self.BASE_URL}/search/commits"
        params = {
            'q': f'author:{self.username} committer-date:>={since}',
            'per_page': 100,
            'sort': 'committer-date',
            'order': 'desc'
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json().get('items', [])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching commits: {e}")
            return []
    
    def fetch_user_events(self):
        """Fetch recent user events for contribution graph"""
        url = f"{self.BASE_URL}/users/{self.username}/events"
        params = {'per_page': 100}
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error fetching events: {e}")
            return []
    
    def get_contribution_calendar(self, days=365):
        """Generate contribution calendar data"""
        events = self.fetch_user_events()
        
        # Initialize calendar with zeros
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        contributions = {}
        
        current_date = start_date
        while current_date <= end_date:
            contributions[current_date.isoformat()] = 0
            current_date += timedelta(days=1)
        
        # Count events by date
        for event in events:
            if event.get('type') in ['PushEvent', 'CreateEvent', 'PullRequestEvent']:
                event_date = datetime.strptime(
                    event['created_at'], '%Y-%m-%dT%H:%M:%SZ'
                ).date()
                
                date_key = event_date.isoformat()
                if date_key in contributions:
                    if event['type'] == 'PushEvent':
                        # Count commits in push event
                        commits = event.get('payload', {}).get('size', 1)
                        contributions[date_key] += commits
                    else:
                        contributions[date_key] += 1
        
        return contributions
    
    def get_language_stats(self, repos):
        """Calculate language statistics from repositories"""
        languages = {}
        
        for repo in repos:
            lang = repo.get('language')
            if lang:
                languages[lang] = languages.get(lang, 0) + 1
        
        return languages


def sync_github_data(user, username, access_token=None):
    """Sync GitHub data for a user"""
    service = GitHubService(username, access_token)
    
    # Fetch and save repositories
    repos_data = service.fetch_user_repos()
    repo_count = 0
    
    for repo_data in repos_data:
        try:
            GitHubRepository.objects.update_or_create(
                user=user,
                full_name=repo_data['full_name'],
                defaults={
                    'name': repo_data['name'],
                    'description': repo_data.get('description', ''),
                    'html_url': repo_data['html_url'],
                    'language': repo_data.get('language'),
                    'stargazers_count': repo_data['stargazers_count'],
                    'forks_count': repo_data['forks_count'],
                    'open_issues_count': repo_data['open_issues_count'],
                    'created_at': repo_data['created_at'],
                    'updated_at': repo_data['updated_at'],
                    'pushed_at': repo_data.get('pushed_at'),
                    'size': repo_data['size'],
                    'is_private': repo_data['private'],
                    'is_fork': repo_data['fork'],
                }
            )
            repo_count += 1
        except Exception as e:
            print(f"Error saving repo {repo_data.get('name')}: {e}")
    
    # Fetch and save commits
    commits_data = service.fetch_user_commits(days=90)
    commit_count = 0
    
    for commit_data in commits_data:
        try:
            commit_info = commit_data.get('commit', {})
            repo_name = commit_data.get('repository', {}).get('full_name', 'Unknown')
            
            GitHubCommit.objects.update_or_create(
                sha=commit_data['sha'],
                defaults={
                    'user': user,
                    'message': commit_info.get('message', ''),
                    'repository': repo_name,
                    'commit_date': commit_info.get('author', {}).get('date'),
                    'total_changes': 0,  # Would need additional API call for stats
                }
            )
            commit_count += 1
        except Exception as e:
            print(f"Error saving commit: {e}")
    
    # Fetch and save contribution calendar
    contributions = service.get_contribution_calendar(days=365)
    contrib_count = 0
    
    for date_str, count in contributions.items():
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            GitHubContribution.objects.update_or_create(
                user=user,
                date=date_obj,
                defaults={'count': count}
            )
            contrib_count += 1
        except Exception as e:
            print(f"Error saving contribution: {e}")
    
    # Update last sync time
    from .models import Profile
    profile = Profile.objects.get(user=user)
    profile.last_github_sync = timezone.now()
    profile.save()
    
    return {
        'repos': repo_count,
        'commits': commit_count,
        'contributions': contrib_count,
        'language_stats': service.get_language_stats(repos_data)
    }