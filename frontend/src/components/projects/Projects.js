import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { projectsAPI } from '../../services/api';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    github_url: '',
    live_url: '',
    technologies: '',
    start_date: '',
    end_date: '',
    is_featured: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        technologies: project.technologies,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        is_featured: project.is_featured,
      });
    } else {
      setCurrentProject(null);
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        github_url: '',
        live_url: '',
        technologies: '',
        start_date: '',
        end_date: '',
        is_featured: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentProject(null);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProject) {
        await projectsAPI.update(currentProject.id, formData);
      } else {
        await projectsAPI.create(formData);
      }
      fetchProjects();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectsAPI.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const statusColors = {
    planning: 'info',
    in_progress: 'warning',
    completed: 'success',
    on_hold: 'secondary',
    archived: 'dark',
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
        <h2 className="fw-bold mb-0"> Projects</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + New Project
        </Button>
      </div>

      <Row className="g-4">
        {projects.map((project) => (
          <Col key={project.id} lg={4} md={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="fw-bold mb-0">{project.name}</h5>
                  {project.is_featured && <Badge bg="warning">Featured</Badge>}
                </div>
                <Badge bg={statusColors[project.status]} className="mb-3">
                  {project.status_display}
                </Badge>
                <p className="text-muted mb-3">{project.description}</p>
                <div className="mb-3">
                  <small className="text-muted">Technologies:</small>
                  <div className="mt-1">
                    {project.technologies.split(',').map((tech, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
             {(project.github_url || project.live_url) && (
  <div className="mb-3">
    {project.github_url && (
      <a
        href={project.github_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-outline-dark me-2"
      >
        GitHub
      </a>
    )}
    {project.live_url && (
      <a
        href={project.live_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-outline-primary"
      >
        Live Demo
      </a>
    )}
  </div>
)}

                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(project)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {projects.length === 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <h4 className="text-muted">No projects yet</h4>
                <p className="text-muted">Start adding your coding projects!</p>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  Create Your First Project
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentProject ? 'Edit Project' : 'New Project'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="My Awesome Project"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe your project..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={formData.status} onChange={handleChange}>
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Technologies (comma-separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="technologies"
                    value={formData.technologies}
                    onChange={handleChange}
                    required
                    placeholder="React, Node.js, MongoDB"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>GitHub URL</Form.Label>
              <Form.Control
                type="url"
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Live URL</Form.Label>
              <Form.Control
                type="url"
                name="live_url"
                value={formData.live_url}
                onChange={handleChange}
                placeholder="https://myproject.com"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_featured"
                label="Mark as featured project"
                checked={formData.is_featured}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentProject ? 'Update Project' : 'Create Project'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Projects;
