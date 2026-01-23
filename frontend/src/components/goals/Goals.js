import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { goalsAPI } from '../../services/api';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    target_date: '',
    progress: 0,
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await goalsAPI.getAll();
      setGoals(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (goal = null) => {
    if (goal) {
      setCurrentGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description,
        status: goal.status,
        target_date: goal.target_date || '',
        progress: goal.progress,
      });
    } else {
      setCurrentGoal(null);
      setFormData({
        title: '',
        description: '',
        status: 'active',
        target_date: '',
        progress: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentGoal(null);
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
      if (currentGoal) {
        await goalsAPI.update(currentGoal.id, formData);
      } else {
        await goalsAPI.create(formData);
      }
      fetchGoals();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsAPI.delete(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Failed to delete goal');
      }
    }
  };

  const updateProgress = async (goal, newProgress) => {
    try {
      const updatedGoal = {
        ...goal,
        progress: parseInt(newProgress),
        status: parseInt(newProgress) === 100 ? 'completed' : goal.status,
      };
      await goalsAPI.update(goal.id, updatedGoal);
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const statusColors = {
    active: 'primary',
    completed: 'success',
    abandoned: 'secondary',
  };

  const progressVariant = (progress) => {
    if (progress < 25) return 'danger';
    if (progress < 50) return 'warning';
    if (progress < 75) return 'info';
    if (progress < 100) return 'primary';
    return 'success';
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === 'all') return true;
    return goal.status === filter;
  });

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
        <h2 className="fw-bold mb-0">Goals</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + New Goal
        </Button>
      </div>

      <div className="mb-4">
        <Button
          variant={filter === 'active' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={filter === 'abandoned' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('abandoned')}
        >
          Abandoned
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      <Row className="g-4">
        {filteredGoals.map((goal) => (
          <Col key={goal.id} lg={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="fw-bold mb-2">{goal.title}</h5>
                    <Badge bg={statusColors[goal.status]}>
                      {goal.status_display}
                    </Badge>
                  </div>
                  {goal.target_date && (
                    <div className="text-end">
                      <small className="text-muted">Target Date</small>
                      <div className="fw-bold">{goal.target_date}</div>
                    </div>
                  )}
                </div>

                <p className="text-muted mb-3">{goal.description}</p>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Progress</span>
                    <span className="fw-bold">{goal.progress}%</span>
                  </div>
                  <ProgressBar
                    now={goal.progress}
                    variant={progressVariant(goal.progress)}
                    style={{ height: '10px' }}
                  />
                </div>

                {goal.status === 'active' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Update Progress</Form.Label>
                    <Form.Range
                      min="0"
                      max="100"
                      step="5"
                      value={goal.progress}
                      onChange={(e) => updateProgress(goal, e.target.value)}
                    />
                  </Form.Group>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(goal)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(goal.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {filteredGoals.length === 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <h4 className="text-muted">No goals found</h4>
                <p className="text-muted">Set your coding goals and track your progress!</p>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  Create Your First Goal
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentGoal ? 'Edit Goal' : 'New Goal'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Goal Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., Master React Hooks"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your goal in detail..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Date (Optional)</Form.Label>
              <Form.Control
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Progress: {formData.progress}%</Form.Label>
              <Form.Range
                name="progress"
                min="0"
                max="100"
                step="5"
                value={formData.progress}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Goals;