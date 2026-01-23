import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { resourcesAPI } from '../../services/api';

function Resources() {
  const [resources, setResources] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentResource, setCurrentResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    resource_type: 'article',
    description: '',
    tags: '',
    is_completed: false,
    is_favorite: false,
    notes: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await resourcesAPI.getAll();
      setResources(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (resource = null) => {
    if (resource) {
      setCurrentResource(resource);
      setFormData({
        title: resource.title,
        url: resource.url,
        resource_type: resource.resource_type,
        description: resource.description || '',
        tags: resource.tags || '',
        is_completed: resource.is_completed,
        is_favorite: resource.is_favorite,
        notes: resource.notes || '',
      });
    } else {
      setCurrentResource(null);
      setFormData({
        title: '',
        url: '',
        resource_type: 'article',
        description: '',
        tags: '',
        is_completed: false,
        is_favorite: false,
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentResource(null);
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
      if (currentResource) {
        await resourcesAPI.update(currentResource.id, formData);
      } else {
        await resourcesAPI.create(formData);
      }
      fetchResources();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await resourcesAPI.delete(id);
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource');
      }
    }
  };

  const toggleComplete = async (resource) => {
    try {
      await resourcesAPI.update(resource.id, {
        ...resource,
        is_completed: !resource.is_completed,
      });
      fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const toggleFavorite = async (resource) => {
    try {
      await resourcesAPI.update(resource.id, {
        ...resource,
        is_favorite: !resource.is_favorite,
      });
      fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const typeIcons = {
    article: '📄',
    video: '🎥',
    course: '🎓',
    book: '📚',
    documentation: '📖',
    tutorial: '🎯',
    other: '🔗',
  };

  const typeColors = {
    article: 'primary',
    video: 'danger',
    course: 'success',
    book: 'warning',
    documentation: 'info',
    tutorial: 'secondary',
    other: 'dark',
  };

  const filteredResources = resources.filter((resource) => {
    if (filter === 'completed') return resource.is_completed;
    if (filter === 'favorites') return resource.is_favorite;
    if (filter === 'pending') return !resource.is_completed;
    return true;
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
        <h2 className="fw-bold mb-0"> Learning Resources</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + Add Resource
        </Button>
      </div>

      <div className="mb-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('pending')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={filter === 'favorites' ? 'primary' : 'outline-primary'}
          onClick={() => setFilter('favorites')}
        >
           Favorites
        </Button>
      </div>

      <Row className="g-4">
        {filteredResources.map((resource) => (
          <Col key={resource.id} lg={4} md={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-start">
                    <span className="me-2" style={{ fontSize: '1.5rem' }}>
                      {typeIcons[resource.resource_type]}
                    </span>
                    <div>
                      <h6 className="fw-bold mb-1">{resource.title}</h6>
                      <Badge bg={typeColors[resource.resource_type]}>
                        {resource.resource_type_display}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => toggleFavorite(resource)}
                  >
                    {resource.is_favorite ? '⭐' : '☆'}
                  </Button>
                </div>

                {resource.description && (
                  <p className="text-muted small mb-2">{resource.description}</p>
                )}

                {resource.tags && (
                  <div className="mb-2">
                    {resource.tags.split(',').map((tag, index) => (
                      <Badge key={index} bg="light" text="dark" className="me-1">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

           <div className="d-flex gap-2 mt-3">
  <Button
    variant={resource.is_completed ? 'success' : 'outline-success'}
    size="sm"
    onClick={() => toggleComplete(resource)}
  >
    {resource.is_completed ? '✓ Completed' : 'Mark Complete'}
  </Button>

  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-sm btn-outline-primary"
  >
    Open
  </a>
</div>


                <div className="d-flex gap-2 mt-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(resource)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(resource.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {filteredResources.length === 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <h4 className="text-muted">No resources found</h4>
                <p className="text-muted">Start building your learning library!</p>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  Add Your First Resource
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentResource ? 'Edit Resource' : 'Add New Resource'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Resource title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>URL</Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                placeholder="https://example.com/resource"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Resource Type</Form.Label>
              <Form.Select
                name="resource_type"
                value={formData.resource_type}
                onChange={handleChange}
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="course">Course</option>
                <option value="book">Book</option>
                <option value="documentation">Documentation</option>
                <option value="tutorial">Tutorial</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the resource"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, javascript, tutorial"
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
                placeholder="Personal notes about this resource"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                name="is_completed"
                label="Mark as completed"
                checked={formData.is_completed}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_favorite"
                label=" Add to favorites"
                checked={formData.is_favorite}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentResource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Resources;