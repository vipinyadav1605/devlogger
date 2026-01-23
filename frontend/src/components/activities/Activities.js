import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Table, Spinner } from 'react-bootstrap';
import { activitiesAPI } from '../../services/api';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours_coded: '',
    commits: '',
    lines_of_code: '',
    languages_used: '',
    notes: '',
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activitiesAPI.getAll();
      setActivities(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (activity = null) => {
    if (activity) {
      setCurrentActivity(activity);
      setFormData({
        date: activity.date,
        hours_coded: activity.hours_coded,
        commits: activity.commits,
        lines_of_code: activity.lines_of_code,
        languages_used: activity.languages_used || '',
        notes: activity.notes || '',
      });
    } else {
      setCurrentActivity(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours_coded: '',
        commits: '',
        lines_of_code: '',
        languages_used: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentActivity(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentActivity) {
        await activitiesAPI.update(currentActivity.id, formData);
      } else {
        await activitiesAPI.create(formData);
      }
      fetchActivities();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving activity:', error);
      if (error.response?.data?.date) {
        alert('Activity for this date already exists. Please edit the existing entry.');
      } else {
        alert('Failed to save activity');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activitiesAPI.delete(id);
        fetchActivities();
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity');
      }
    }
  };

  const calculateTotals = () => {
    return {
      totalHours: activities.reduce((sum, a) => sum + parseFloat(a.hours_coded || 0), 0),
      totalCommits: activities.reduce((sum, a) => sum + parseInt(a.commits || 0), 0),
      totalLOC: activities.reduce((sum, a) => sum + parseInt(a.lines_of_code || 0), 0),
    };
  };

  const totals = calculateTotals();

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
        <h2 className="fw-bold mb-0"> Coding Activities</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Log Activity
        </Button>
      </div>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="stat-card">
            <Card.Body>
              <h6 className="opacity-75">Total Hours Coded</h6>
              <h3 className="fw-bold mb-0">{totals.totalHours.toFixed(1)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Card.Body>
              <h6 className="opacity-75">Total Commits</h6>
              <h3 className="fw-bold mb-0">{totals.totalCommits}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Card.Body>
              <h6 className="opacity-75">Lines of Code</h6>
              <h3 className="fw-bold mb-0">{totals.totalLOC.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Hours Coded</th>
                  <th>Commits</th>
                  <th>Lines of Code</th>
                  <th>Languages</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td className="fw-bold">{activity.date}</td>
                    <td>{activity.hours_coded} hrs</td>
                    <td>{activity.commits}</td>
                    <td>{activity.lines_of_code.toLocaleString()}</td>
                    <td>
                      {activity.languages_used && (
                        <span className="text-muted">{activity.languages_used}</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(activity)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <h5 className="text-muted">No activities logged yet</h5>
                      <p className="text-muted">Start tracking your daily coding activities!</p>
                      <Button variant="primary" onClick={() => handleShowModal()}>
                        Log Your First Activity
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentActivity ? 'Edit Activity' : 'Log Coding Activity'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hours Coded</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    name="hours_coded"
                    value={formData.hours_coded}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 5.5"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Commits</Form.Label>
                  <Form.Control
                    type="number"
                    name="commits"
                    value={formData.commits}
                    onChange={handleChange}
                    required
                    placeholder="e.g., 12"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Lines of Code</Form.Label>
              <Form.Control
                type="number"
                name="lines_of_code"
                value={formData.lines_of_code}
                onChange={handleChange}
                required
                placeholder="e.g., 500"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Languages Used</Form.Label>
              <Form.Control
                type="text"
                name="languages_used"
                value={formData.languages_used}
                onChange={handleChange}
                placeholder="e.g., JavaScript, Python, SQL"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="What did you work on today?"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentActivity ? 'Update Activity' : 'Log Activity'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Activities;