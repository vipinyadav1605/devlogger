import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import { snippetsAPI } from "../../services/api";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function Snippets() {
  const [snippets, setSnippets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [viewSnippet, setViewSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: "",
    is_favorite: false,
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const response = await snippetsAPI.getAll();
      setSnippets(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching snippets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (snippet = null) => {
    if (snippet) {
      setCurrentSnippet(snippet);
      setFormData({
        title: snippet.title,
        description: snippet.description || "",
        code: snippet.code,
        language: snippet.language,
        tags: snippet.tags || "",
        is_favorite: snippet.is_favorite,
      });
    } else {
      setCurrentSnippet(null);
      setFormData({
        title: "",
        description: "",
        code: "",
        language: "javascript",
        tags: "",
        is_favorite: false,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSnippet(null);
  };

  const handleShowViewModal = (snippet) => {
    setViewSnippet(snippet);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewSnippet(null);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSnippet) {
        await snippetsAPI.update(currentSnippet.id, formData);
      } else {
        await snippetsAPI.create(formData);
      }
      fetchSnippets();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving snippet:", error);
      alert("Failed to save snippet");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this snippet?")) {
      try {
        await snippetsAPI.delete(id);
        fetchSnippets();
      } catch (error) {
        console.error("Error deleting snippet:", error);
        alert("Failed to delete snippet");
      }
    }
  };

  const toggleFavorite = async (snippet) => {
    try {
      await snippetsAPI.update(snippet.id, {
        ...snippet,
        is_favorite: !snippet.is_favorite,
      });
      fetchSnippets();
    } catch (error) {
      console.error("Error updating snippet:", error);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard!");
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
        <h2 className="fw-bold mb-0">Code Snippets</h2>
        <Button variant="primary" onClick={() => handleShowModal()}>
          + New Snippet
        </Button>
      </div>

      <Row className="g-4">
        {snippets.map((snippet) => (
          <Col key={snippet.id} lg={6}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">{snippet.title}</h5>
                    <Badge bg="dark">{snippet.language_display}</Badge>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => toggleFavorite(snippet)}
                  >
                    {snippet.is_favorite ? 'Remove favorite' : 'Add favorite'}
                  </Button>
                </div>

                {snippet.description && (
                  <p className="text-muted small mb-3">{snippet.description}</p>
                )}

                <div
                  className="snippet-code mb-3"
                  style={{ maxHeight: "150px", overflow: "hidden" }}
                >
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={vscDarkPlus}
                  >
                    {snippet.code.substring(0, 200)}...
                  </SyntaxHighlighter>
                </div>

                {snippet.tags && (
                  <div className="mb-3">
                    {snippet.tags.split(",").map((tag, index) => (
                      <Badge
                        key={index}
                        bg="light"
                        text="dark"
                        className="me-1"
                      >
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowViewModal(snippet)}
                  >
                    View Full
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => copyToClipboard(snippet.code)}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(snippet)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(snippet.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
        {snippets.length === 0 && (
          <Col xs={12}>
            <Card>
              <Card.Body className="text-center py-5">
                <h4 className="text-muted">No code snippets yet</h4>
                <p className="text-muted">
                  Start saving your useful code snippets!
                </p>
                <Button variant="primary" onClick={() => handleShowModal()}>
                  Add Your First Snippet
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSnippet ? "Edit Snippet" : "New Code Snippet"}
          </Modal.Title>
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
                placeholder="e.g., React Custom Hook for API Calls"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Language</Form.Label>
              <Form.Select
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="typescript">TypeScript</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control
                as="textarea"
                rows={12}
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What does this code do?"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, hooks, custom-hook"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="is_favorite"
                label=" Mark as favorite"
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
              {currentSnippet ? "Update Snippet" : "Save Snippet"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{viewSnippet?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewSnippet && (
            <>
              <div className="mb-3">
                <Badge bg="dark">{viewSnippet.language_display}</Badge>
                {viewSnippet.is_favorite && (
                  <Badge bg="warning" className="ms-2">
                     Favorite
                  </Badge>
                )}
              </div>
              {viewSnippet.description && (
                <p className="text-muted mb-3">{viewSnippet.description}</p>
              )}
              <SyntaxHighlighter
                language={viewSnippet.language}
                style={vscDarkPlus}
              >
                {viewSnippet.code}
              </SyntaxHighlighter>
              {viewSnippet.tags && (
                <div className="mt-3">
                  {viewSnippet.tags.split(",").map((tag, index) => (
                    <Badge key={index} bg="light" text="dark" className="me-1">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => copyToClipboard(viewSnippet.code)}
          >
            Copy Code
          </Button>
          <Button variant="primary" onClick={handleCloseViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default Snippets;
