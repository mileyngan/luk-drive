import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpenIcon,
  PlayIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, ProgressBar, Button, Alert } from 'react-bootstrap';

const ChapterList = () => {
  const { programType } = useParams();
  const { user } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchChapters();
  }, [programType]);

  const fetchChapters = async () => {
    try {
      // This will be implemented in Phase 2
      // For now, showing placeholder data
      setTimeout(() => {
        setChapters([
          {
            id: 1,
            title: 'Introduction au Code de la Route',
            description: 'Découvrez les bases du code de la route camerounais',
            chapter_number: 1,
            is_published: true,
            completed: false,
            score: null
          },
          {
            id: 2,
            title: 'Signalisation Routière',
            description: 'Apprenez à reconnaître et comprendre tous les panneaux',
            chapter_number: 2,
            is_published: true,
            completed: false,
            score: null
          },
          {
            id: 3,
            title: 'Règles de Priorité',
            description: 'Maîtrisez les règles de priorité aux intersections',
            chapter_number: 3,
            is_published: false,
            completed: false,
            score: null
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      setError('Erreur lors du chargement des chapitres');
      console.error('Fetch chapters error:', error);
      setLoading(false);
    }
  };

  const getChapterStatus = (chapter) => {
    if (chapter.completed) {
      return {
        icon: CheckCircleIcon,
        variant: 'success',
        text: 'Complété'
      };
    }
    if (!chapter.is_published) {
      return {
        icon: LockClosedIcon,
        variant: 'secondary',
        text: 'Bientôt disponible'
      };
    }
    return {
      icon: PlayIcon,
      variant: 'primary',
      text: 'Commencer'
    };
  };

  const getProgramTitle = (programType) => {
    return programType === 'novice' ? 'Programme Novice' : 'Programme Recyclage';
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

  const completedChapters = chapters.filter(chapter => chapter.completed).length;
  const progressPercentage = chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <BookOpenIcon className="h-8 w-8 text-primary me-3" />
            <h1 className="h2 text-dark">
              {getProgramTitle(programType)}
            </h1>
          </div>
          <p className="text-muted">
            Parcourez les chapitres et progressez à votre rythme
          </p>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Progress Overview */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="h5 mb-0">
                Progression du Programme
              </h3>
              <small className="text-muted">
                {completedChapters} sur {chapters.length} chapitres complétés
              </small>
            </div>
            <ProgressBar 
              now={progressPercentage} 
              variant="primary" 
              className="mb-2"
              style={{ height: '6px' }}
            />
            <small className="text-muted">{Math.round(progressPercentage)}% complété</small>
          </Card.Body>
        </Card>

        {/* Chapters List */}
        <div className="row g-4">
          {chapters.map((chapter) => {
            const status = getChapterStatus(chapter);
            const StatusIcon = status.icon;
            
            return (
              <div key={chapter.id} className="col-12">
                <Card className="shadow-sm h-100 border">
                  <Card.Body>
                    <div className="d-flex flex-column flex-md-row">
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap align-items-center mb-3">
                          <span className="badge bg-primary me-3 mb-2 mb-md-0">
                            Chapitre {chapter.chapter_number}
                          </span>
                          <span className={`badge bg-${status.variant} mb-2 mb-md-0`}>
                            <StatusIcon className="h-4 w-4 me-1" />
                            {status.text}
                          </span>
                        </div>
                        
                        <Card.Title className="h5 mb-3">
                          {chapter.title}
                        </Card.Title>
                        
                        <Card.Text className="text-muted mb-3">
                          {chapter.description}
                        </Card.Text>

                        {chapter.score && (
                          <Card.Text className="text-sm text-muted mb-0">
                            Meilleur score: <span className="fw-bold text-success">{chapter.score}%</span>
                          </Card.Text>
                        )}
                      </div>
                      
                      <div className="ms-md-3 mt-3 mt-md-0">
                        {chapter.is_published ? (
                          <Button
                            variant={chapter.completed ? 'success' : 'primary'}
                            onClick={() => alert('Feature coming in Phase 2!')}
                          >
                            {chapter.completed ? 'Revoir' : 'Commencer'}
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            disabled
                          >
                            Bientôt
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>

        {chapters.length === 0 && !loading && (
          <div className="text-center py-5">
            <BookOpenIcon className="mx-auto h-12 w-12 text-muted mb-3" />
            <h3 className="h5 text-dark mb-2">
              Aucun chapitre disponible
            </h3>
            <p className="text-muted">
              Les chapitres pour ce programme seront bientôt disponibles.
            </p>
          </div>
        )}

        {/* Info Section */}
        <Card className="border border-primary bg-primary bg-opacity-5 mt-4">
          <Card.Body>
            <div className="d-flex flex-column flex-md-row">
              <div className="flex-shrink-0 me-md-4 mb-2 mb-md-0">
                <span className="fs-3">💡</span>
              </div>
              <div>
                <h3 className="h5 text-dark mb-3">
                  Comment utiliser les chapitres
                </h3>
                <ul className="text-muted small mb-0">
                  <li className="mb-1">• Lisez attentivement le contenu de chaque chapitre</li>
                  <li className="mb-1">• Regardez les vidéos explicatives quand disponibles</li>
                  <li className="mb-1">• Passez le quiz à la fin de chaque chapitre</li>
                  <li className="mb-1">• Obtenez au moins 70% pour valider le chapitre</li>
                  <li className="mb-0">• Vous pouvez repasser le quiz autant de fois que nécessaire</li>
                </ul>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ChapterList;