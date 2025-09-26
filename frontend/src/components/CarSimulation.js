import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, ProgressBar, Alert, Modal, Container } from 'react-bootstrap';
import { CarFront, Play, Pause, Stop, Trophy, Clock } from 'react-bootstrap-icons';
import api from '../services/api';

const CarSimulation = ({ chapterId, onSimulationComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [currentExercise, setCurrentExercise] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const simulationRef = useRef(null);

  useEffect(() => {
    fetchSimulationExercise();
  }, [chapterId]);

  const fetchSimulationExercise = async () => {
    try {
      const response = await api.get(`/chapters/${chapterId}/simulation`);
      setCurrentExercise(response.data);
    } catch (err) {
      setError('Failed to load simulation exercise');
    }
  };

  const startSimulation = async () => {
    if (!currentExercise) return;
    
    setLoading(true);
    try {
      await api.post('/student-simulations', {
        chapter_id: chapterId,
        simulation_id: currentExercise.id,
        started_at: new Date().toISOString()
      });
      
      setIsRunning(true);
      setLoading(false);
      
      // Start simulation timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            completeSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to start simulation');
      setLoading(false);
    }
  };

  const completeSimulation = async () => {
    try {
      const finalScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100 for demo
      setScore(finalScore);
      
      await api.put('/student-simulations/complete', {
        simulation_id: currentExercise.id,
        score: finalScore,
        completion_time: 600 - timeLeft,
        completed_at: new Date().toISOString()
      });

      setIsRunning(false);
      setShowResult(true);
      
      if (onSimulationComplete) {
        onSimulationComplete(finalScore);
      }
    } catch (err) {
      setError('Failed to complete simulation');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      {currentExercise && (
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5>
              <CarFront className="me-2" />
              {currentExercise.title}
            </h5>
            <div className="d-flex align-items-center">
              <Clock className="me-2" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </Card.Header>
          <Card.Body>
            <p>{currentExercise.description}</p>
            <div className="mb-3">
              <small className="text-muted">Difficulty: {currentExercise.difficulty_level}</small>
            </div>
            
            {isRunning ? (
              <div>
                <ProgressBar 
                  now={progress} 
                  label={`${progress}%`} 
                  className="mb-3"
                />
                <div className="d-flex justify-content-between">
                  <Button 
                    variant="warning" 
                    onClick={() => setIsRunning(false)}
                    disabled={loading}
                  >
                    Pause
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={completeSimulation}
                    disabled={loading}
                  >
                    End Simulation
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button 
                  variant="success" 
                  onClick={startSimulation}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Play className="me-2" />
                      Start Simulation
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Results Modal */}
      <Modal show={showResult} onHide={() => setShowResult(false)} centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title>Simulation Complete!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <Trophy className="text-success" size={60} />
            <h4 className="mt-3">Your Score: {score}/100</h4>
            <p className="text-muted">
              {score >= 80 ? 'Excellent performance!' : 
               score >= 60 ? 'Good effort, keep practicing!' : 
               'Practice more to improve your skills.'}
            </p>
            <ProgressBar 
              now={score} 
              label={`${score}%`} 
              variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResult(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => setShowResult(false)}>
            Continue Learning
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarSimulation;