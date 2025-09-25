import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar, Container } from 'react-bootstrap';
import { Clock } from 'react-bootstrap-icons';
import api from '../services/api';

const Quizzes = () => {
  const [chapters, setChapters] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChapters();
  }, []);

  const submitQuiz = async () => {
    try {
      await api.post('/quizzes/submit', {
        chapter_id: currentQuiz.chapter.id,
        answers: answers
      });
      setQuizStarted(false);
      setCurrentQuiz(null);
      setAnswers([]);
      alert('Quiz submitted successfully!');
    } catch (err) {
      setError('Failed to submit quiz');
    }
  };

  useEffect(() => {
    let interval;
    if (quizStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizStarted) {
      submitQuiz();
    }
    return () => clearInterval(interval);
  }, [quizStarted, timeLeft, submitQuiz]); // Added submitQuiz as dependency

  const fetchChapters = async () => {
    try {
      const response = await api.get('/chapters');
      setChapters(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load chapters');
      setLoading(false);
    }
  };

  const startQuiz = async (chapterId) => {
    try {
      const response = await api.get(`/quizzes/chapter/${chapterId}`);
      setCurrentQuiz(response.data);
      setCurrentQuestion(0);
      setAnswers([]);
      setTimeLeft(1200);
      setQuizStarted(true);
    } catch (err) {
      setError('Failed to start quiz');
    }
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (quizStarted && currentQuiz) {
    const currentQ = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <Container className="py-4">
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>{currentQuiz.chapter.title}</h5>
            <div className="d-flex align-items-center">
              <Clock className="me-2" />
              <span className={`fw-bold ${timeLeft < 300 ? 'text-danger' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </Card.Header>
          <Card.Body>
            <ProgressBar 
              now={progress} 
              label={`${Math.round(progress)}%`} 
              className="mb-4"
            />
            
            <h6>Question {currentQuestion + 1} of {currentQuiz.questions.length}</h6>
            <p className="lead">{currentQ.question}</p>
            
            <div className="mt-4">
              {currentQ.options.map((option, index) => (
                <div key={index} className="mb-2">
                  <input
                    className="form-check-input me-2"
                    type="radio"
                    name={`question-${currentQuestion}`}
                    id={`option-${index}`}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswer(index)}
                  />
                  <label className="form-check-label" htmlFor={`option-${index}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="secondary" 
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion < currentQuiz.questions.length - 1 ? (
                <Button 
                  variant="primary" 
                  onClick={nextQuestion}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  variant="success" 
                  onClick={submitQuiz}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Quizzes</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="row">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="col-md-6 col-lg-4 mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Chapter {chapter.chapter_number}: {chapter.title}</Card.Title>
                <Card.Text>
                  {chapter.description?.substring(0, 100)}...
                </Card.Text>
                <Button 
                  variant="primary" 
                  onClick={() => startQuiz(chapter.id)}
                  disabled={!chapter.is_published}
                >
                  Start Quiz
                </Button>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Quizzes;