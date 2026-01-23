import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { githubAPI } from '../../services/api';
import ContributionGraph from './ContributionGraph';
import RepositoryList from './RepositoryList';
import LanguageChart from './LanguageChart';

function GitHub() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGitHubStats();
  }, []);

  const fetchGitHubStats = async () => {
    try {
      const response = await githubAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
      if (error.response?.status === 400) {
        setError('Please set your GitHub username in your profile first.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setError('');
    setSuccess('');
    setSyncing(true);

    try {
      const response = await githubAPI.syncGitHub();
      setSuccess(`Successfully synced! Found ${response.data.stats.repos} repos, ${response.data.stats.commits} commits.`);
      fetchGitHubStats();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error syncing GitHub:', error);
      setError(error.response?.data?.error || 'Failed to sync GitHub data. Please check your username.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          <span style={{ fontSize: '2rem' }}></span> GitHub Integration
        </h2>
        <Button 
          variant="primary" 
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Syncing...
            </>
          ) : (
            '🔄 Sync GitHub Data'
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {!stats && !error && (
        <Card>
          <Card.Body className="text-center py-5">
            <h4 className="text-muted">No GitHub data yet</h4>
            <p className="text-muted">
              Make sure you've set your GitHub username in your profile, then click "Sync GitHub Data" to import your repositories and contributions.
            </p>
          </Card.Body>
        </Card>
      )}

      {stats && (
        <>
          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <Card className="stat-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 opacity-75">Repositories</p>
                      <h3 className="mb-0 fw-bold">{stats.total_repos}</h3>
                    </div>
                    <div style={{ fontSize: '3rem', opacity: 0.8 }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="stat-card h-100" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 opacity-75">Total Commits</p>
                      <h3 className="mb-0 fw-bold">{stats.total_commits}</h3>
                    </div>
                    <div style={{ fontSize: '3rem', opacity: 0.8 }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="stat-card h-100" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 opacity-75">Total Stars</p>
                      <h3 className="mb-0 fw-bold">{stats.total_stars}</h3>
                    </div>
                    <div style={{ fontSize: '3rem', opacity: 0.8 }}></div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card className="stat-card h-100" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1 opacity-75">Contribution Streak</p>
                      <h3 className="mb-0 fw-bold">{stats.contribution_streak} days</h3>
                    </div>
                    <div style={{ fontSize: '3rem', opacity: 0.8 }}>🔥</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Last Sync Info */}
          {stats.last_sync && (
            <Alert variant="info" className="mb-4">
              <small>
                Last synced: {new Date(stats.last_sync).toLocaleString()}
              </small>
            </Alert>
          )}

          {/* Top Languages */}
          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card>
                <Card.Body>
                  <h5 className="fw-bold mb-4">Top Languages</h5>
                  {Object.keys(stats.top_languages).length > 0 ? (
                    <LanguageChart languages={stats.top_languages} />
                  ) : (
                    <p className="text-muted text-center py-4">No language data available</p>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card>
                <Card.Body>
                  <h5 className="fw-bold mb-4">Quick Stats</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Total Forks</span>
                      <strong>{stats.total_forks}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Public Repos</span>
                      <strong>{stats.total_repos}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Stars Received</span>
                      <strong>{stats.total_stars}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Active Streak</span>
                      <strong>{stats.contribution_streak} days 🔥</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Contribution Graph */}
          <Card className="mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-4">Contribution Activity</h5>
              <ContributionGraph />
            </Card.Body>
          </Card>

          {/* Repository List */}
          <Card>
            <Card.Body>
              <h5 className="fw-bold mb-4">Repositories</h5>
              <RepositoryList />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
}

export default GitHub;