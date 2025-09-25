import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  BookOpenIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Container, Card, Button, ProgressBar, Tabs, Tab, Alert } from 'react-bootstrap';

const ChapterView = () => {
  const { chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('content');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchChapter();
  }, [chapterId]);

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chapters/${chapterId}`);
      setChapter(response.data.chapter);
    } catch (error) {
      setError('Erreur lors du chargement du chapitre');
      console.error('Fetch chapter error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/student/quiz/${chapterId}`);
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

  if (error || !chapter) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h1 className="h3 text-danger mb-4">Erreur</h1>
          <p className="text-muted mb-4">{error || 'Chapitre non trouvé'}</p>
          <Button
            variant="primary"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container className="py-4">
        {/* Header */}
        <div className="mb-4">
          <Button
            variant="link"
            className="text-primary p-0 mb-3 d-flex align-items-center"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon className="h-5 w-5 me-2" />
            Retour aux chapitres
          </Button>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <div className="d-flex flex-wrap align-items-center mb-2">
                <span className="badge bg-primary me-3 mb-2 mb-md-0">
                  Chapitre {chapter.chapter_number}
                </span>
                <span className="text-muted text-sm mb-2 mb-md-0">
                  Programme {chapter.program_type}
                </span>
              </div>
              <h1 className="h2 text-dark mb-2">{chapter.title}</h1>
              {chapter.description && (
                <p className="text-muted">{chapter.description}</p>
              )}
            </div>
            
            <Button
              variant="success"
              onClick={handleStartQuiz}
              className="d-flex align-items-center"
            >
              <QuestionMarkCircleIcon className="h-5 w-5 me-2" />
              Passer le Quiz
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        {chapter.progress && (
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted small">Votre progression sur ce chapitre</span>
                <span className="text-success fw-bold small">
                  {chapter.progress.quiz_score ? `Meilleur score: ${chapter.progress.quiz_score}%` : 'Non commencé'}
                </span>
              </div>
              {chapter.progress.quiz_score && (
                <ProgressBar 
                  now={Math.min(chapter.progress.quiz_score, 100)} 
                  variant="success" 
                  style={{ height: '4px' }}
                />
              )}
            </Card.Body>
          </Card>
        )}

        {/* Content Tabs */}
        <Card className="shadow-sm">
          <Card.Body>
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-3"
            >
              <Tab eventKey="content" title={
                <span>
                  <DocumentTextIcon className="h-5 w-5 me-2" />
                  Contenu
                </span>
              }>
                {chapter.ebook_content ? (
                  <div 
                    className="mb-0"
                    dangerouslySetInnerHTML={{ __html: chapter.ebook_content }}
                  />
                ) : (
                  <div className="text-center py-5 text-muted">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-muted mb-3" />
                    <p>Le contenu de ce chapitre sera bientôt disponible.</p>
                  </div>
                )}
              </Tab>
              
              {chapter.video_url && (
                <Tab eventKey="video" title={
                  <span>
                    <PlayIcon className="h-5 w-5 me-2" />
                    Vidéo
                  </span>
                }>
                  {chapter.video_type === 'youtube' ? (
                    <div className="ratio ratio-16x9">
                      <iframe
                        src={chapter.video_url.replace('watch?v=', 'embed/')}
                        title={chapter.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <video 
                      controls 
                      className="w-100 rounded"
                      src={`${API_URL}${chapter.video_url}`}
                    >
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  )}
                </Tab>
              )}
            </Tabs>
          </Card.Body>
        </Card>

        {/* Action buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Retour aux chapitres
          </Button>
          
          <Button
            variant="primary"
            onClick={handleStartQuiz}
          >
            Passer le Quiz de ce Chapitre
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default ChapterView;