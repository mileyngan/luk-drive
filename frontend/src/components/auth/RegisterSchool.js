import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const RegisterSchool = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    adminFirstName: "",
    adminLastName: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register-school",
        formData
      );

      setSuccess(response.data.message || "✅ Registration successful");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "❌ Error during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-sm p-4">
              <h2 className="text-center mb-4">Inscription Auto-École</h2>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'auto-école *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nom de votre auto-école"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Téléphone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Numéro de téléphone"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'administrateur *</Form.Label>
                  <Form.Control
                    type="text"
                    name="adminFirstName"
                    value={formData.adminFirstName}
                    onChange={handleChange}
                    placeholder="Prénom de l'administrateur"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nom de famille de l'administrateur *</Form.Label>
                  <Form.Control
                    type="text"
                    name="adminLastName"
                    value={formData.adminLastName}
                    onChange={handleChange}
                    placeholder="Nom de famille de l'administrateur"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Téléphone de l'administrateur</Form.Label>
                  <Form.Control
                    type="text"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleChange}
                    placeholder="Téléphone de l'administrateur"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mot de passe"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le mot de passe *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmer le mot de passe"
                    required
                  />
                </Form.Group>

                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "Inscription..." : "S'inscrire"}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterSchool;
