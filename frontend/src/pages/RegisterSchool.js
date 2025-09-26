import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'; // Assuming you have this context
import { Card, Form, Button, Alert, Container, Row, Col, Modal } from 'react-bootstrap';

const RegisterSchool = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Yaoundé', // Default value
    region: 'Centre', // Default value
    subscription_plan: 'basic' // Default value
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { registerSchool } = useAuth(); // Use the registerSchool function from your Auth context
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await registerSchool(formData); // Use the function from context

    if (result.success) {
      setShowSuccessModal(true); // Show success modal instead of alert
      // Optionally reset form or redirect after a delay
      // setTimeout(() => navigate('/login'), 3000); // Example redirect after 3 seconds
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login'); // Redirect to login after closing modal
  };

  // Define dark mode colors (consistent with Landing page)
  const darkColors = {
    primary: '#3b82f6', // A bright blue for highlights
    primaryDark: '#2563eb', // Slightly darker blue for contrast
    secondary: '#10b981', // A bright green
    background: '#1a1a1a', // Dark background
    surface: '#2d2d2d', // Darker surface color
    surfaceLight: '#3d3d3d', // Lighter surface for cards
    textPrimary: '#f3f4f6', // Light text
    textSecondary: '#9ca3af', // Muted text
    textMuted: '#6b7280', // More muted text
    border: '#4b5563', // Border color
    error: '#ef4444', // Error color
    success: '#10b981', // Success color
  };

  return (
    <div style={{ backgroundColor: darkColors.background, minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '70px' }}>
      <Container>
        <Row className="d-flex justify-content-center">
          <Col md={8} lg={6} className="mx-auto">
            <Card 
              className="shadow-lg border-0" 
              style={{ 
                backgroundColor: darkColors.surfaceLight, 
                color: darkColors.textPrimary,
                borderRadius: '1rem',
                overflow: 'hidden'
              }}
            >
              <Card.Header 
                className="text-center py-4" 
                style={{ 
                  backgroundColor: darkColors.primary, 
                  color: 'white',
                  borderBottom: `1px solid ${darkColors.border}`
                }}
              >
                <h4 className="mb-0">Register Driving School</h4>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)' }}>Join SmartDrive Cameroon Driving School Network</p>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" style={{ backgroundColor: '#7f1d1d', borderColor: darkColors.error, color: darkColors.textPrimary }}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: darkColors.textSecondary }}>School Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter school name"
                          style={{ 
                            backgroundColor: darkColors.surface, 
                            color: darkColors.textPrimary, 
                            borderColor: darkColors.border 
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: darkColors.textSecondary }}>Email Address *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter school email"
                          style={{ 
                            backgroundColor: darkColors.surface, 
                            color: darkColors.textPrimary, 
                            borderColor: darkColors.border 
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: darkColors.textSecondary }}>Phone Number *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="Enter phone number"
                          style={{ 
                            backgroundColor: darkColors.surface, 
                            color: darkColors.textPrimary, 
                            borderColor: darkColors.border 
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: darkColors.textSecondary }}>City *</Form.Label>
                        <Form.Select
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          style={{ 
                            backgroundColor: darkColors.surface, 
                            color: darkColors.textPrimary, 
                            borderColor: darkColors.border 
                          }}
                        >
                          <option value="Yaoundé">Yaoundé</option>
                          <option value="Douala">Douala</option>
                          <option value="Garoua">Garoua</option>
                          <option value="Bamenda">Bamenda</option>
                          <option value="Bafoussam">Bafoussam</option>
                          <option value="Ngaoundéré">Ngaoundéré</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: darkColors.textSecondary }}>Address *</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter school address"
                      style={{ 
                        backgroundColor: darkColors.surface, 
                        color: darkColors.textPrimary, 
                        borderColor: darkColors.border 
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: darkColors.textSecondary }}>Subscription Plan *</Form.Label>
                    <Form.Select
                      name="subscription_plan"
                      value={formData.subscription_plan}
                      onChange={handleChange}
                      required
                      style={{ 
                        backgroundColor: darkColors.surface, 
                        color: darkColors.textPrimary, 
                        borderColor: darkColors.border 
                      }}
                    >
                      <option value="basic">Basic - Free (Up to 50 students)</option>
                      <option value="pro">Pro - $99/month (Up to 200 students)</option>
                      <option value="enterprise">Enterprise - Custom (Unlimited)</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Check
                      type="checkbox"
                      required
                      label={
                        <span style={{ color: darkColors.textSecondary }}>
                          I agree to the <a href="#" style={{ color: darkColors.primary }}>Terms and Conditions</a> and <a href="#" style={{ color: darkColors.primary }}>Privacy Policy</a>
                        </span>
                      }
                      style={{ color: darkColors.textSecondary }}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2"
                    disabled={loading}
                    style={{ 
                      backgroundColor: darkColors.primary, 
                      borderColor: darkColors.primary,
                      fontSize: '1.1rem',
                      padding: '0.75rem 0'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Registering...
                      </>
                    ) : 'Register School'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <small className="text-muted" style={{ color: darkColors.textSecondary }}>
                    Already have an account?{' '}
                    <a href="/login" style={{ color: darkColors.primary }}>Sign In</a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Success Modal */}
        <Modal show={showSuccessModal} onHide={handleModalClose} centered>
          <Modal.Header className="border-0" style={{ backgroundColor: darkColors.surface, color: darkColors.textPrimary }}>
            <Modal.Title style={{ color: darkColors.success }}>Registration Successful!</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: darkColors.surface, color: darkColors.textPrimary }}>
            <div className="text-center">
              <div className="mb-3">
                <span className="display-4 text-success">✓</span>
              </div>
              <h5>Your registration is under review</h5>
              <p className="text-muted">
                We have received your registration request. Our team will review your application 
                and send approval notification to your email within 24-48 hours.
              </p>
              <p className="text-muted">
                You will receive an email with your one-time password to access your dashboard 
                once approved.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0" style={{ backgroundColor: darkColors.surface }}>
            <Button 
              variant="primary" 
              onClick={handleModalClose}
              style={{ backgroundColor: darkColors.primary, borderColor: darkColors.primary }}
            >
              Continue to Login
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default RegisterSchool;