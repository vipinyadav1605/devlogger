import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form, Badge, Spinner } from 'react-bootstrap';
import { journalAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';

function Journal() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: '',
    tags: '',
    is_public: false,
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await journalAPI.getAll();
      setEntries(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (entry = null) => {
    if (entry) {
      setCurrentEntry(entry);
      setFormData({
        title: entry.title,
        content: entry.content,
        date: entry.date,
        mood: entry.mood || '',
        tags: entry.tags || '',
        is_public: entry.is_public,
      });
    } else {
      setCurrentEntry(null);
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
        mood: '',
        tags: '',
        is_public: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEntry(null);
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
      if (currentEntry) {
        await journalAPI.update(currentEntry.id, formData);
      } else {
        await journalAPI.create(formData);
      }
      fetchEntries();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await journalAPI.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry');
      }
    }
  };

  const moodEmojis = {
    happy: '😊',
    excited: '🎉',
    productive: '💪',
    tired: '😴',
    frustrated: '😤',
    learning: '📚',
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
        <h2 className="fw-bold mb-0"> Journal Entries</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + New Entry
        </Button>
      </div>

      <Row className="g-4">
        {entries.map((entry) => (
          <Col key={entry.id} lg={4} md={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold mb-0">{entry.title}</h5>
                  {entry.mood && (
                    <span style={{ fontSize: '1.5rem' }}>
                      {moodEmojis[entry.mood] || '😊'}
                    </span>
                  )}
                </div>
                <p className="text-muted small mb-3">{entry.date}</p>
              <div
  className="markdown-content mb-3"
  style={{ maxHeight: '150px', overflow: 'hidden' }}
>
  <ReactMarkdown>
    {String(entry.content || '').slice(0, 200)}
  </ReactMarkdown>

  {entry.content && entry.content.length > 200 && (
    <span className="text-muted">...</span>
  )}
</div>

                {entry.tags && (
                  <div className="mb-3">
                    {entry.tags.split(',').map((tag, index) => (
                      <Badge key={index} bg="secondary" className="me-1">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(entry)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {entries.length === 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <h4 className="text-muted">No journal entries yet</h4>
                <p className="text-muted">Start documenting your coding journey!</p>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  Create Your First Entry
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentEntry ? 'Edit Entry' : 'New Journal Entry'}</Modal.Title>
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
                placeholder="What did you work on today?"
              />
            </Form.Group>

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

            <Form.Group className="mb-3">
              <Form.Label>Mood</Form.Label>
              <Form.Select name="mood" value={formData.mood} onChange={handleChange}>
                <option value="">Select mood...</option>
                <option value="happy"> Happy</option>
                <option value="excited"> Excited</option>
                <option value="productive"> Productive</option>
                <option value="tired"> Tired</option>
                <option value="frustrated"> Frustrated</option>
                <option value="learning"> Learning</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Content (Markdown supported)</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="Write your thoughts here... You can use markdown formatting!"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, nodejs, learning"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_public"
                label="Make this entry public"
                checked={formData.is_public}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {currentEntry ? 'Update Entry' : 'Create Entry'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Journal;