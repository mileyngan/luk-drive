import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  UsersIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalUsers: 0,
    totalChapters: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/schools/stats`);
      setStats(response.data.stats);
    } catch (error) {
      setError('Erreur lors du chargement des statistiques');
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="ms-3 flex-grow-1">
            <Card.Text className="text-muted text-sm mb-0">
              {label}
            </Card.Text>
            <Card.Title className="mb-0">
              {value}
            </Card.Title>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

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
            Tableau de Bord - {user?.school?.name}
          </h1>
          <p className="text-muted">
            Bienvenue {user?.firstName}! Gérez votre auto-école efficacement.
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
            <StatCard
              icon={UsersIcon}
              label="Total Élèves"
              value={stats.totalStudents}
              color="text-primary"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={AcademicCapIcon}
              label="Instructeurs"
              value={stats.totalInstructors}
              color="text-success"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={BookOpenIcon}
              label="Chapitres"
              value={stats.totalChapters}
              color="text-purple"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={ChartBarIcon}
              label="Total Utilisateurs"
              value={stats.totalUsers}
              color="text-warning"
            />
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="g-4">
          {/* User Management */}
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <UsersIcon className="h-6 w-6 text-primary me-2" />
                  <Card.Title className="mb-0">
                    Gestion des Utilisateurs
                  </Card.Title>
                </div>
                <Card.Text className="text-muted mb-3">
                  Ajoutez, modifiez et gérez les élèves et instructeurs de votre auto-école.
                </Card.Text>
                <div className="mb-3">
                  <Link
                    to="/admin/users"
                    className="btn btn-primary w-100 mb-3"
                  >
                    Gérer les Utilisateurs
                  </Link>
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                        <div className="h5 mb-0 text-primary">{stats.totalStudents}</div>
                        <small className="text-muted">Élèves</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                        <div className="h5 mb-0 text-success">{stats.totalInstructors}</div>
                        <small className="text-muted">Instructeurs</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Course Management */}
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <BookOpenIcon className="h-6 w-6 text-purple me-2" />
                  <Card.Title className="mb-0">
                    Gestion des Cours
                  </Card.Title>
                </div>
                <Card.Text className="text-muted mb-3">
                  Créez et gérez les chapitres pour vos programmes Novice et Recyclage.
                </Card.Text>
                <div className="mb-3">
                  <Button
                    variant="primary"
                    className="w-100 mb-3"
                    onClick={() => alert('Feature coming in Phase 2!')}
                  >
                    Gérer les Chapitres
                  </Button>
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="text-center p-3 bg-purple bg-opacity-10 rounded">
                        <div className="h5 mb-0 text-purple">{stats.totalChapters}</div>
                        <small className="text-muted">Chapitres</small>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                        <div className="h5 mb-0 text-warning">2</div>
                        <small className="text-muted">Programmes</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row className="mt-4">
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-3">
                  Activité Récente
                </Card.Title>
                <div className="text-center py-5 text-muted">
                  <ChartBarIcon className="mx-auto h-12 w-12 text-muted mb-3" />
                  <p>Les données d'activité seront disponibles dans la prochaine phase.</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;