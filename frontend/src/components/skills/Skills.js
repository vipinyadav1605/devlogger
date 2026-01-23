import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, ProgressBar, Spinner } from 'react-bootstrap';
import { skillsAPI } from '../../services/api';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: 'language',
    proficiency: 3,
    notes: '',
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.getAll();
      setSkills(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (skill = null) => {
    if (skill) {
      setCurrentSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        proficiency: skill.proficiency,
        notes: skill.notes || '',
      });
    } else {
      setCurrentSkill(null);
      setFormData({
        name: '',
        category: 'language',
        proficiency: 3,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSkill(null);
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
      if (currentSkill) {
        await skillsAPI.update(currentSkill.id, formData);
      } else {
        await skillsAPI.create(formData);
      }
      fetchSkills();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Failed to save skill');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillsAPI.delete(id);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill');
      }
    }
  };

  const categoryColors = {
    language: 'primary',
    framework: 'success',
    tool: 'info',
    database: 'warning',
    other: 'secondary',
  };

  const proficiencyColors = {
    1: 'danger',
    2: 'warning',
    3: 'info',
    4: 'primary',
    5: 'success',
  };

  const getProficiencyPercentage = (proficiency) => {
    return (proficiency / 5) * 100;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0"> Skills</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Add Skill
        </Button>
      </div>

      {Object.keys(groupedSkills).length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4 className="text-muted">No skills added yet</h4>
            <p className="text-muted">Start tracking your technical skills!</p>
            <Button variant="primary" onClick={() => handleShowModal()}>
              Add Your First Skill
            </Button>
          </Card.Body>
        </Card>
      ) : (
        Object.keys(groupedSkills).map((category) => (
          <Card key={category} className="mb-4">
            <Card.Body>
              <h5 className="fw-bold mb-3">
                <Badge bg={categoryColors[category]}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              </h5>
              <Row className="g-3">
                {groupedSkills[category].map((skill) => (
                  <Col key={skill.id} lg={6}>
                    <Card className="border">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="fw-bold mb-0">{skill.name}</h6>
                          <Badge bg={proficiencyColors[skill.proficiency]}>
                            {skill.proficiency_display}
                          </Badge>
                        </div>
                        <ProgressBar
                          now={getProficiencyPercentage(skill.proficiency)}
                          variant={proficiencyColors[skill.proficiency]}
                          className="mb-2"
                          style={{ height: '8px' }}
                        />
                        {skill.notes && (
                          <p className="text-muted small mb-2">{skill.notes}</p>
                        )}
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleShowModal(skill)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(skill.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        ))
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentSkill ? 'Edit Skill' : 'Add New Skill'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Skill Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., React, Python, Docker"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select name="category" value={formData.category} onChange={handleChange}>
                <option value="language">Programming Language</option>
                <option value="framework">Framework</option>
                <option value="tool">Tool</option>
                <option value="database">Database</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Proficiency Level</Form.Label>
              <Form.Select
                name="proficiency"
                value={formData.proficiency}
                onChange={handleChange}
              >
                <option value="1">1 - Beginner</option>
                <option value="2">2 - Elementary</option>
                <option value="3">3 - Intermediate</option>
                <option value="4">4 - Advanced</option>
                <option value="5">5 - Expert</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes about this skill..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentSkill ? 'Update Skill' : 'Add Skill'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Skills;