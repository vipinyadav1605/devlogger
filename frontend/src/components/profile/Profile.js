import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { profileAPI, authAPI } from '../../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    github_username: '',
    linkedin_url: '',
    website: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, userRes] = await Promise.all([
        profileAPI.getProfile(),
        authAPI.getCurrentUser(),
      ]);
      setProfile(profileRes.data);
      setUser(userRes.data);
      setFormData({
        bio: profileRes.data.bio || '',
        github_username: profileRes.data.github_username || '',
        linkedin_url: profileRes.data.linkedin_url || '',
        website: profileRes.data.website || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      await profileAPI.updateProfile(formData);
      setSuccess(true);
      fetchProfileData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
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
      <h2 className="fw-bold mb-4">👤 Profile</h2>

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={4}>
          <Card>
            <Card.Body className="text-center">
              <div className="avatar-placeholder mx-auto mb-3">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <h4 className="fw-bold mb-1">
                {user?.first_name} {user?.last_name}
              </h4>
              <p className="text-muted mb-3">@{user?.username}</p>
              <p className="text-muted small">{user?.email}</p>
              
              {profile && (
                <div className="mt-4 text-start">
                  <h6 className="fw-bold mb-3">Quick Stats</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Member since</span>
                    <strong>{new Date(profile.created_at).toLocaleDateString()}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Last updated</span>
                    <strong>{new Date(profile.updated_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Body>
              <h5 className="fw-bold mb-4">Edit Profile</h5>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>GitHub Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="github_username"
                    value={formData.github_username}
                    onChange={handleChange}
                    placeholder="your-github-username"
                  />
                  <Form.Text className="text-muted">
                    Your GitHub username (without the @ symbol)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>LinkedIn URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://your-website.com"
                  />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

         {formData.github_username || formData.linkedin_url || formData.website ? (
  <Card className="mt-4">
    <Card.Body>
      <h5 className="fw-bold mb-3">Your Links</h5>
      <div className="d-flex gap-3">
        {formData.github_username && (
          <a
            href={`https://github.com/${formData.github_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-dark"
          >
            GitHub Profile
          </a>
        )}

        {formData.linkedin_url && (
          <a
            href={formData.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            LinkedIn
          </a>
        )}

        {formData.website && (
          <a
            href={formData.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-success"
          >
            Website
          </a>
        )}
      </div>
    </Card.Body>
  </Card>
) : null}

        </Col>
      </Row>
    </div>
  );
}

export default Profile;