import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BookOpenIcon,
  ChartBarIcon,
  PlayIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, ProgressBar, Button, Alert } from 'react-bootstrap';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalChapters: 0,
      completedChapters: 0,
      progressPercentage: 0,
      averageScore: 0
    },
    recentQuizzes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      setError('Erreur lors du chargement du tableau de bord');
      console.error('Fetch dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, suffix = '' }) => (
    <Card className="shadow-sm h-100">
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
              {value}{suffix}
            </Card.Title>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const getProgrammeText = (programType) => {
    return programType === 'novice' ? 'Novice' : 'Recyclage';
  };

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
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
            Bonjour {user?.firstName}!
          </h1>
          <p className="text-muted">
            Programme: <span className="fw-bold">{getProgrammeText(user?.programType)}</span> 
            • École: <span className="fw-bold">{user?.school?.name}</span>
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Progress Overview */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <StatCard
              icon={BookOpenIcon}
              label="Chapitres Total"
              value={dashboardData.stats.totalChapters}
              color="text-primary"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={TrophyIcon}
              label="Chapitres Complétés"
              value={dashboardData.stats.completedChapters}
              color="text-success"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={ChartBarIcon}
              label="Progression"
              value={dashboardData.stats.progressPercentage}
              color="text-purple"
              suffix="%"
            />
          </Col>
          <Col md={6} lg={3}>
            <StatCard
              icon={ClockIcon}
              label="Score Moyen"
              value={dashboardData.stats.averageScore}
              color="text-warning"
              suffix="%"
            />
          </Col>
        </Row>

        {/* Progress Bar */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">
                Progression du Programme {getProgrammeText(user?.programType)}
              </h3>
              <small className="text-muted">
                {dashboardData.stats.completedChapters} sur {dashboardData.stats.totalChapters} chapitres
              </small>
            </div>
            <ProgressBar 
              now={dashboardData.stats.progressPercentage} 
              variant="primary" 
              className="mb-2"
              style={{ height: '8px' }}
            />
            <small className="text-muted">
              {dashboardData.stats.progressPercentage}% complété
            </small>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Quick Actions */}
          <Col lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-3">
                  Actions Rapides
                </Card.Title>
                <div className="d-grid gap-3">
                  <Button
                    as={Link}
                    to={`/student/chapters/${user?.programType}`}
                    variant="primary"
                    className="d-flex align-items-center justify-content-center"
                  >
                    <PlayIcon className="h-5 w-5 me-2" />
                    Continuer l'Apprentissage
                  </Button>
                  
                  <Button
                    variant="success"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => alert('Feature coming in Phase 2!')}
                  >
                    <BookOpenIcon className="h-5 w-5 me-2" />
                    Passer un Quiz
                  </Button>

                  <Button
                    variant="primary"
                    className="d-flex align-items-center justify-content-center"
                    onClick={() => alert('Feature coming in Phase 2!')}
                  >
                    💬 Assistant IA
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Quiz Results */}
          <Col lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-3">
                  Résultats Récents
                </Card.Title>
                {dashboardData.recentQuizzes.length > 0 ? (
                  <div className="d-grid gap-3">
                    {dashboardData.recentQuizzes.map((quiz, index) => (
                      <div key={index} className="d-flex align-items-center justify-content-between p-3 bg-light rounded">
                        <div>
                          <h4 className="h6 mb-1">
                            {quiz.chapters?.title || 'Chapitre'}
                          </h4>
                          <small className="text-muted">
                            Tentative #{quiz.quiz_attempts} • {' '}
                            {new Date(quiz.last_attempt_at).toLocaleDateString('fr-FR')}
                          </small>
                        </div>
                        <span className={`badge bg-${getScoreVariant(quiz.quiz_score)}`}>
                          {quiz.quiz_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-muted mb-3" />
                    <p className="mb-1">Aucun quiz passé pour le moment.</p>
                    <p className="small mb-0">Commencez votre apprentissage pour voir vos résultats ici!</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tips Section */}
        <Card className="border border-primary bg-primary bg-opacity-5 mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row">
              <div className="flex-shrink-0 me-md-4 mb-2 mb-md-0">
                <span className="fs-3">💡</span>
              </div>
              <div>
                <Card.Title className="mb-3">
                  Conseils pour Réussir
                </Card.Title>
                <ul className="text-muted small mb-0">
                  <li className="mb-1">• Étudiez chaque chapitre attentivement avant de passer le quiz</li>
                  <li className="mb-1">• Un score de 70% minimum est requis pour valider un chapitre</li>
                  <li className="mb-1">• Utilisez l'assistant IA pour poser des questions sur le code de la route</li>
                  <li className="mb-0">• Révisez régulièrement les chapitres précédents</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default StudentDashboard;