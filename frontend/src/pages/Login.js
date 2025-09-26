import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider'; // Assuming you have this context
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Use the login function from your Auth context
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

    const result = await login(formData.email, formData.password); // Use the function from context

    if (result.success) {
      // The useAuth context should handle redirecting based on role after successful login
      // You might navigate to a generic dashboard or let the App.js ProtectedRoute handle it
      // For example, you could navigate to the dashboard:
      // navigate('/dashboard');
      // Or let the ProtectedRoute in App.js handle the default redirect after login
    } else {
      setError(result.error || 'Login failed. Please check your credentials and try again.');
    }

    setLoading(false);
  };

  // Define dark mode colors (consistent with Landing and Register pages)
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
          <Col md={6} lg={4} className="mx-auto">
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
                <h4 className="mb-0">SmartDrive Login</h4>
                <p className="mb-0" style={{ color: 'rgba(255,255,255,0.85)' }}>Cameroon Driving School SaaS</p>
              </Card.Header>
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" style={{ backgroundColor: '#7f1d1d', borderColor: darkColors.error, color: darkColors.textPrimary }}>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: darkColors.textSecondary }}>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      style={{ 
                        backgroundColor: darkColors.surface, 
                        color: darkColors.textPrimary, 
                        borderColor: darkColors.border 
                      }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ color: darkColors.textSecondary }}>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      style={{ 
                        backgroundColor: darkColors.surface, 
                        color: darkColors.textPrimary, 
                        borderColor: darkColors.border 
                      }}
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 mb-3"
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
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <small className="text-muted" style={{ color: darkColors.textSecondary }}>
                    Don't have an account?{' '}
                    <a href="/register-school" style={{ color: darkColors.primary }}>Register School</a>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;