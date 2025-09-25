import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, Table, Button, Alert, Badge } from 'react-bootstrap';

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/schools`);
      setSchools(response.data.schools);
    } catch (error) {
      setError('Erreur lors du chargement des écoles');
      console.error('Fetch schools error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSchoolStatus = async (schoolId, status) => {
    try {
      await axios.put(`${API_URL}/api/schools/${schoolId}/status`, { status });
      fetchSchools(); // Refresh the list
    } catch (error) {
      setError('Erreur lors de la mise à jour du statut');
      console.error('Update status error:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return {
          variant: 'success',
          icon: CheckCircleIcon,
          text: 'Approuvée'
        };
      case 'pending':
        return {
          variant: 'warning',
          icon: ClockIcon,
          text: 'En attente'
        };
      case 'suspended':
        return {
          variant: 'danger',
          icon: XCircleIcon,
          text: 'Suspendue'
        };
      default:
        return {
          variant: 'secondary',
          icon: ClockIcon,
          text: status
        };
    }
  };

  const stats = {
    totalSchools: schools.length,
    pendingSchools: schools.filter(s => s.status === 'pending').length,
    approvedSchools: schools.filter(s => s.status === 'approved').length,
    suspendedSchools: schools.filter(s => s.status === 'suspended').length
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h2 text-dark">
            Dashboard Super Administrateur
          </h1>
          <p className="text-muted">
            Bienvenue {user?.firstName}! Gérez toutes les auto-écoles de la plateforme.
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <Card.Text className="text-muted text-sm mb-0">
                      Total Écoles
                    </Card.Text>
                    <Card.Title className="mb-0">
                      {stats.totalSchools}
                    </Card.Title>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-warning" />
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <Card.Text className="text-muted text-sm mb-0">
                      En Attente
                    </Card.Text>
                    <Card.Title className="mb-0">
                      {stats.pendingSchools}
                    </Card.Title>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-success" />
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <Card.Text className="text-muted text-sm mb-0">
                      Approuvées
                    </Card.Text>
                    <Card.Title className="mb-0">
                      {stats.approvedSchools}
                    </Card.Title>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-6 w-6 text-danger" />
                  </div>
                  <div className="ms-3 flex-grow-1">
                    <Card.Text className="text-muted text-sm mb-0">
                      Suspendues
                    </Card.Text>
                    <Card.Title className="mb-0">
                      {stats.suspendedSchools}
                    </Card.Title>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Schools Table */}
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title className="mb-4">
              Gestion des Auto-Écoles
            </Card.Title>
            
            {schools.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>École</th>
                      <th>Contact</th>
                      <th>Statut</th>
                      <th>Date d'inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => {
                      const statusBadge = getStatusBadge(school.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <tr key={school.id}>
                          <td>
                            <div>
                              <div className="fw-bold">
                                {school.name}
                              </div>
                              {school.address && (
                                <div className="text-muted small">
                                  {school.address}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="text-dark">{school.email}</div>
                            {school.phone && (
                              <div className="text-muted small">{school.phone}</div>
                            )}
                          </td>
                          <td>
                            <Badge bg={statusBadge.variant}>
                              <StatusIcon className="h-4 w-4 me-1" />
                              {statusBadge.text}
                            </Badge>
                          </td>
                          <td>
                            <span className="text-muted">
                              {new Date(school.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {school.status === 'pending' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => updateSchoolStatus(school.id, 'approved')}
                                  title="Approuver"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                              {school.status === 'approved' && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => updateSchoolStatus(school.id, 'suspended')}
                                  title="Suspendre"
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                              {school.status === 'suspended' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => updateSchoolStatus(school.id, 'approved')}
                                  title="Réactiver"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-muted mb-3" />
                <p className="text-muted">Aucune auto-école enregistrée.</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default SuperAdminDashboard;