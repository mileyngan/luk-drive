import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { Card, Form, Button, Alert, Container, Row, Col, Modal } from 'react-bootstrap';

const RegisterSchool = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Yaoundé',
    region: 'Centre',
    subscription_plan: 'basic'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { registerSchool } = useAuth();
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

    const result = await registerSchool(formData);
    
    if (result.success) {
      setShowSuccessModal(true);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100">
        <Col md={8} lg={6} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-success text-white text-center">
              <h4>Register Driving School</h4>
              <p className="mb-0">Join SmartDrive Cameroon Driving School Network</p>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>School Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter school name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter school email"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter phone number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      >
                        <option value="Yaoundé">Yaoundé</option>
                        <option value="Douala">Douala</option>
                        <option value="Garoua">Garoua</option>
                        <option value="Bamenda">Bamenda</option>
                        <option value="Bafoussam">Bafoussam</option>
                        <option value="Ngaoundéré">Ngaoundéré</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Enter school address"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Subscription Plan *</Form.Label>
                  <Form.Select
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleChange}
                    required
                  >
                    <option value="basic">Basic - Free (Up to 50 students)</option>
                    <option value="pro">Pro - $99/month (Up to 200 students)</option>
                    <option value="enterprise">Enterprise - Custom (Unlimited)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    required
                    label="I agree to the Terms and Conditions and Privacy Policy"
                  />
                </Form.Group>

                <Button 
                  variant="success" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : 'Register School'}
                </Button>
              </Form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary">Sign In</a>
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleModalClose} centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title>Registration Successful!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            Continue to Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RegisterSchool;