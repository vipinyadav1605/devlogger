import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { dashboardAPI, activitiesAPI } from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, weeklyRes] = await Promise.all([
        dashboardAPI.getStats(),
        activitiesAPI.getWeeklyStats(),
      ]);
      setStats(statsRes.data);
      setWeeklyData(weeklyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Hours', value: stats?.total_coding_hours || 0, icon: '', color: '#667eea' },
    { title: 'Projects', value: stats?.total_projects || 0, icon: '', color: '#764ba2' },
    { title: 'Skills', value: stats?.total_skills || 0, icon: '', color: '#f093fb' },
    { title: 'Current Streak', value: `${stats?.current_streak || 0} days`, icon: '', color: '#4facfe' },
  ];

  return (
    <div>
      <h2 className="mb-4 fw-bold">Dashboard</h2>

      <Row className="g-4 mb-4">
        {statCards.map((card, index) => (
          <Col key={index} lg={3} md={6}>
            <Card className="stat-card h-100" style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${card.color}dd 100%)` }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 opacity-75">
                      {card.title}
                    </p>
                    <h3 className="mb-0 fw-bold">{card.value}</h3>
                  </div>
                  <div style={{ fontSize: '3rem', opacity: 0.8 }}>
                    {card.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3 fw-bold">Weekly Activity Overview</h5>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours_coded" fill="#667eea" name="Hours Coded" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>No activity data available yet. Start logging your activities!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3 fw-bold">Commits This Week</h5>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="commits" stroke="#764ba2" name="Commits" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>No commit data available yet.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-3 fw-bold">Quick Stats</h5>
              <div className="d-flex justify-content-between mb-3">
                <span>Journal Entries</span>
                <strong>{stats?.total_journal_entries || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Learning Resources</span>
                <strong>{stats?.total_resources || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Code Snippets</span>
                <strong>{stats?.total_snippets || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span>Active Goals</span>
                <strong>{stats?.active_goals || 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Completed Projects</span>
                <strong>{stats?.completed_projects || 0}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <h5 className="mb-3 fw-bold">Recent Activity Summary</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hours</th>
                      <th>Commits</th>
                      <th>Lines of Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.slice(0, 5).map((activity, index) => (
                      <tr key={index}>
                        <td>{activity.date}</td>
                        <td>{activity.hours_coded}</td>
                        <td>{activity.commits}</td>
                        <td>{activity.lines_of_code}</td>
                      </tr>
                    ))}
                    {weeklyData.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No activity recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;