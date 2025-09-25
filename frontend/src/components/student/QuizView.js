import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  QuestionMarkCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Container, Card, Button, ProgressBar, Alert, Row, Col } from 'react-bootstrap';

const QuizView = () => {
  const { chapterId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchQuiz();
  }, [chapterId]);

  // Timer effect
  useEffect(() => {
    if (quiz && !results && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, results, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/quiz/chapter/${chapterId}`);
      setQuiz(response.data);
    } catch (error) {
      setError('Erreur lors du chargement du quiz');
      console.error('Fetch quiz error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/quiz/chapter/${chapterId}/submit`, {
        answers
      });
      setResults(response.data);
    } catch (error) {
      setError('Erreur lors de la soumission du quiz');
      console.error('Submit quiz error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
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

  if (error || !quiz) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <Container className="text-center">
          <h1 className="h3 text-danger">Erreur</h1>
          <p className="text-muted">{error || 'Quiz non trouvé'}</p>
          <Button
            variant="primary"
            onClick={() => navigate(-1)}
          >
            Retour
          </Button>
        </Container>
      </div>
    );
  }

  // Show results
  if (results) {
    return (
      <div className="min-vh-100 bg-light">
        <Container className="py-4">
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center mb-4">
                <div className={`mx-auto d-flex align-items-center justify-content-center rounded-circle mb-3 ${
                  results.passed ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'
                }`} style={{width: '64px', height: '64px'}}>
                  {results.passed ? (
                    <CheckCircleIcon className="h-10 w-10 text-success" />
                  ) : (
                    <XCircleIcon className="h-10 w-10 text-danger" />
                  )}
                </div>
                <h1 className="h2 text-dark mb-3">
                  {results.passed ? 'Félicitations!' : 'Quiz Échoué'}
                </h1>
                <h3 className={`h4 mb-3 text-${getScoreVariant(results.score)}`}>
                  Score: {results.score}% ({results.correctAnswers}/{results.totalQuestions})
                </h3>
                <p className="text-muted">{results.message}</p>
              </div>

              {/* Detailed Results */}
              <div className="mb-4">
                <h3 className="h5 text-dark mb-3">Résultats Détaillés</h3>
                <div className="row g-3">
                  {results.results.map((result, index) => (
                    <div key={result.question_id} className="col-12">
                      <div className={`p-3 rounded border-start ${
                        result.is_correct ? 'bg-success bg-opacity-5 border-success' : 'bg-danger bg-opacity-5 border-danger'
                      }`}>
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0">
                            {result.is_correct ? (
                              <CheckCircleIcon className="h-5 w-5 text-success mt-0.5" />
                            ) : (
                              <XCircleIcon className="h-5 w-5 text-danger mt-0.5" />
                            )}
                          </div>
                          <div className="ms-3">
                            <p className="fw-medium text-dark mb-2">
                              Question {index + 1}: {result.question}
                            </p>
                            <div className="text-sm text-muted">
                              <p className="mb-1">Votre réponse: <span className={result.is_correct ? 'text-success' : 'text-danger'}>
                                {result.options[result.user_answer]}
                              </span></p>
                              {!result.is_correct && (
                                <p className="mb-0">Bonne réponse: <span className="text-success">
                                  {result.options[result.correct_answer]}
                                </span></p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/student/chapters/${user?.programType}`)}
                >
                  Retour aux Chapitres
                </Button>
                
                {!results.passed && (
                  <Button
                    variant="primary"
                    onClick={() => window.location.reload()}
                  >
                    Réessayer le Quiz
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  // Show quiz
  const currentQ = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

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
            Retour au chapitre
          </Button>
          
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
            <div>
              <h1 className="h2 text-dark">Quiz: {quiz.chapter.title}</h1>
              <p className="text-muted">Question {currentQuestion + 1} sur {totalQuestions}</p>
            </div>
            
            <div className={`d-flex align-items-center px-3 py-2 rounded ${
              timeLeft <= 300 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'
            }`}>
              <ClockIcon className="h-5 w-5 me-2" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <ProgressBar 
            now={progress} 
            variant="primary" 
            style={{ height: '6px' }}
          />
        </div>

        {/* Question */}
        <Card className="shadow-sm">
          <Card.Body>
            <div className="mb-4">
              <div className="d-flex align-items-center mb-3">
                <QuestionMarkCircleIcon className="h-6 w-6 text-primary me-2" />
                <span className="text-primary small">
                  Question {currentQuestion + 1}
                </span>
              </div>
              <h2 className="h5 text-dark mb-4">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="mb-4">
              {currentQ.options.map((option, index) => (
                <div key={index} className="mb-2">
                  <label
                    className={`d-flex align-items-center p-3 border rounded cursor-pointer ${
                      answers[currentQ.id] === index 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : 'border-light'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      value={index}
                      checked={answers[currentQ.id] === index}
                      onChange={() => handleAnswerSelect(currentQ.id, index)}
                      className="me-3"
                    />
                    <span className="text-dark">{option}</span>
                  </label>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="d-flex justify-content-between align-items-center">
              <Button
                variant="outline-secondary"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                ← Précédent
              </Button>

              <div className="d-flex gap-2">
                {currentQuestion < totalQuestions - 1 ? (
                  <Button
                    variant="primary"
                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                    disabled={answers[currentQ.id] === undefined}
                  >
                    Suivant →
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleSubmitQuiz}
                    disabled={submitting || Object.keys(answers).length < totalQuestions}
                  >
                    {submitting ? 'Soumission...' : 'Terminer le Quiz'}
                  </Button>
                )}
              </div>
            </div>

            {/* Question Navigation */}
            <div className="mt-4 pt-3 border-top">
              <p className="text-sm text-muted mb-2">Navigation rapide:</p>
              <div className="d-flex flex-wrap gap-2">
                {quiz.questions.map((_, index) => (
                  <Button
                    key={index}
                    variant={index === currentQuestion ? 'primary' : answers[quiz.questions[index].id] !== undefined ? 'success' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setCurrentQuestion(index)}
                    className="d-flex align-items-center justify-content-center"
                    style={{width: '36px', height: '36px'}}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default QuizView;