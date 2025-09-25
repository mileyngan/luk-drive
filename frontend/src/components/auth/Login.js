import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <div className="text-center mb-4">
              <div className="mx-auto d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10" style={{width: '48px', height: '48px'}}>
                <span className="text-primary fs-3">🚗</span>
              </div>
              <h2 className="mt-3 h2 text-dark">
                Connexion à SmartDrive
              </h2>
              <p className="mt-2 text-muted">
                Plateforme d'apprentissage pour auto-écoles
              </p>
            </div>

            <Card className="shadow-sm">
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="danger" className="mb-3">
                      {error}
                    </Alert>
                  )}

                  <div className="mb-3">
                    <Form.Group>
                      <Form.Label>Adresse Email</Form.Label>
                      <Form.Control
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </div>

                  <div className="mb-3">
                    <Form.Group>
                      <Form.Label>Mot de Passe</Form.Label>
                      <div className="position-relative">
                        <Form.Control
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          placeholder="Votre mot de passe"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="position-absolute top-50 end-0 translate-middle-y p-2 border-0 bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-muted" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-muted" />
                          )}
                        </button>
                      </div>
                    </Form.Group>
                  </div>

                  <div className="mb-3">
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? 'Connexion...' : 'Se Connecter'}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Link
                      to="/register-school"
                      className="text-decoration-none text-primary"
                    >
                      Pas encore inscrit? Inscrivez votre auto-école
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;