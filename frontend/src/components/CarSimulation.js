import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, ProgressBar, Alert, Modal, Container, Row, Col, Badge } from 'react-bootstrap';
import { CarFront, Play, Pause, Stop, Trophy, Clock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ExclamationTriangle, CheckCircle, XCircle } from 'react-bootstrap-icons';
import api from '../services/api';

const CarSimulation = ({ chapterId, onSimulationComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [currentScenario, setCurrentScenario] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [vehicleState, setVehicleState] = useState({
    speed: 0,
    position: { x: 50, y: 50 },
    direction: 0,
    gear: 'P',
    indicators: { left: false, right: false },
    hazards: false
  });
  const [controls, setControls] = useState({
    accelerator: false,
    brake: false,
    clutch: false,
    steering: 0 // -1 to 1
  });
  const [readinessScore, setReadinessScore] = useState(0);

  const simulationRef = useRef(null);
  const timerRef = useRef(null);
  const scenarioTimerRef = useRef(null);

  // Predefined scenarios for different driving conditions
  const scenarioLibrary = [
    {
      id: 1,
      title: 'Urban Driving - Basic Maneuvers',
      type: 'urban',
      difficulty: 'beginner',
      duration: 120, // 2 minutes
      objectives: ['Maintain safe speed', 'Proper lane discipline', 'Traffic light compliance'],
      hazards: ['pedestrians', 'traffic_lights', 'other_vehicles'],
      description: 'Practice basic urban driving skills in a controlled environment.'
    },
    {
      id: 2,
      title: 'Highway Driving - Lane Changes',
      type: 'highway',
      difficulty: 'intermediate',
      duration: 180, // 3 minutes
      objectives: ['Maintain highway speeds', 'Safe lane changes', 'Blind spot checking'],
      hazards: ['merging_traffic', 'speeding_vehicles', 'construction_zones'],
      description: 'Master highway driving with emphasis on lane changes and speed management.'
    },
    {
      id: 3,
      title: 'Rural Road Navigation',
      type: 'rural',
      difficulty: 'intermediate',
      duration: 150, // 2.5 minutes
      objectives: ['Curve negotiation', 'Overtaking safely', 'Animal awareness'],
      hazards: ['sharp_curves', 'wildlife', 'narrow_roads'],
      description: 'Navigate rural roads with varying conditions and potential hazards.'
    },
    {
      id: 4,
      title: 'Emergency Situations',
      type: 'emergency',
      difficulty: 'advanced',
      duration: 200, // 3.3 minutes
      objectives: ['Emergency braking', 'Evasive maneuvers', 'Hazard response'],
      hazards: ['sudden_stops', 'obstacle_avoidance', 'emergency_vehicles'],
      description: 'Respond appropriately to emergency situations on the road.'
    },
    {
      id: 5,
      title: 'Night Driving',
      type: 'night',
      difficulty: 'advanced',
      duration: 160, // 2.7 minutes
      objectives: ['Headlight usage', 'Visibility management', 'Fatigue awareness'],
      hazards: ['low_visibility', 'unlit_vehicles', 'fatigue_indicators'],
      description: 'Practice safe driving during nighttime conditions.'
    }
  ];

  useEffect(() => {
    initializeScenarios();
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(scenarioTimerRef.current);
    };
  }, []);

  const initializeScenarios = () => {
    // Select scenarios based on chapter progress
    const selectedScenarios = scenarioLibrary.slice(0, 3); // Start with first 3 scenarios
    setScenarios(selectedScenarios);
    setCurrentScenario(selectedScenarios[0]);
  };

  const startSimulation = async () => {
    if (!currentScenario) return;

    setLoading(true);
    try {
      await api.post('/simulations/start', {
        chapter_id: chapterId,
        scenario_id: currentScenario.id,
        started_at: new Date().toISOString()
      });

      setIsRunning(true);
      setIsPaused(false);
      setLoading(false);
      setFeedback([]);

      // Start main timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            completeSimulation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start scenario progression
      startScenario();
    } catch (err) {
      setError('Failed to start simulation');
      setLoading(false);
    }
  };

  const startScenario = () => {
    const scenario = scenarios[currentScenarioIndex];
    if (!scenario) return;

    setCurrentScenario(scenario);
    setTimeLeft(scenario.duration);

    // Simulate scenario events
    scenarioTimerRef.current = setTimeout(() => {
      generateScenarioEvent();
    }, Math.random() * 30000 + 10000); // Random event between 10-40 seconds
  };

  const generateScenarioEvent = () => {
    if (!isRunning || isPaused) return;

    const scenario = currentScenario;
    const hazard = scenario.hazards[Math.floor(Math.random() * scenario.hazards.length)];

    let eventMessage = '';
    let points = 0;

    switch (hazard) {
      case 'pedestrians':
        eventMessage = 'Pedestrian crossing ahead! Slow down and prepare to stop.';
        points = controls.brake ? 10 : -15;
        break;
      case 'traffic_lights':
        eventMessage = 'Traffic light turning red. Prepare to stop safely.';
        points = controls.brake ? 8 : -12;
        break;
      case 'other_vehicles':
        eventMessage = 'Vehicle merging from side road. Adjust speed and position.';
        points = vehicleState.speed < 60 ? 5 : -10;
        break;
      case 'merging_traffic':
        eventMessage = 'Highway merge ahead. Check blind spots and accelerate smoothly.';
        points = vehicleState.speed > 80 ? 10 : -8;
        break;
      case 'sharp_curves':
        eventMessage = 'Sharp curve ahead. Reduce speed and steer smoothly.';
        points = vehicleState.speed < 40 ? 12 : -20;
        break;
      case 'sudden_stops':
        eventMessage = 'Vehicle ahead braking suddenly! Emergency stop required.';
        points = controls.brake ? 15 : -25;
        break;
      default:
        eventMessage = 'General driving situation. Maintain safe driving practices.';
        points = 2;
    }

    setFeedback(prev => [...prev.slice(-4), {
      message: eventMessage,
      points,
      timestamp: new Date(),
      type: points > 0 ? 'success' : 'warning'
    }]);

    setScore(prev => Math.max(0, Math.min(100, prev + points)));

    // Schedule next event
    if (isRunning && !isPaused) {
      scenarioTimerRef.current = setTimeout(() => {
        generateScenarioEvent();
      }, Math.random() * 25000 + 15000); // 15-40 seconds
    }
  };

  const pauseSimulation = () => {
    setIsPaused(true);
    clearInterval(timerRef.current);
    clearTimeout(scenarioTimerRef.current);
  };

  const resumeSimulation = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          completeSimulation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Resume scenario events
    generateScenarioEvent();
  };

  const completeSimulation = async () => {
    try {
      clearInterval(timerRef.current);
      clearTimeout(scenarioTimerRef.current);

      const finalScore = score;
      const completionTime = currentScenario.duration - timeLeft;

      await api.post('/simulations/complete', {
        scenario_id: currentScenario.id,
        score: finalScore,
        completion_time: completionTime,
        feedback_count: feedback.length,
        completed_at: new Date().toISOString()
      });

      // Calculate readiness percentage
      const readiness = calculateReadiness(finalScore, feedback);
      setReadinessScore(readiness);

      setIsRunning(false);
      setShowResult(true);

      if (onSimulationComplete) {
        onSimulationComplete(finalScore, readiness);
      }
    } catch (err) {
      setError('Failed to complete simulation');
    }
  };

  const calculateReadiness = (finalScore, feedbackArray) => {
    let readiness = finalScore;

    // Bonus for positive feedback
    const positiveFeedback = feedbackArray.filter(f => f.points > 0).length;
    readiness += positiveFeedback * 2;

    // Penalty for negative feedback
    const negativeFeedback = feedbackArray.filter(f => f.points < 0).length;
    readiness -= negativeFeedback * 3;

    return Math.max(0, Math.min(100, readiness));
  };

  const nextScenario = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setCurrentScenario(scenarios[currentScenarioIndex + 1]);
      setTimeLeft(scenarios[currentScenarioIndex + 1].duration);
      setFeedback([]);
      startScenario();
    } else {
      completeSimulation();
    }
  };

  const handleControlChange = (control, value) => {
    setControls(prev => ({ ...prev, [control]: value }));

    // Update vehicle state based on controls
    if (control === 'accelerator' && value) {
      setVehicleState(prev => ({
        ...prev,
        speed: Math.min(120, prev.speed + 5),
        gear: prev.speed > 0 ? 'D' : 'P'
      }));
    } else if (control === 'brake' && value) {
      setVehicleState(prev => ({
        ...prev,
        speed: Math.max(0, prev.speed - 10)
      }));
    } else if (control === 'steering') {
      setVehicleState(prev => ({
        ...prev,
        direction: value * 45 // Max 45 degrees turn
      }));
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container>
      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>
                <CarFront className="me-2" />
                {currentScenario ? currentScenario.title : 'Driving Simulation'}
              </h5>
              <div className="d-flex align-items-center gap-3">
                <Badge bg={getDifficultyColor(currentScenario?.difficulty)}>
                  {currentScenario?.difficulty}
                </Badge>
                <div className="d-flex align-items-center">
                  <Clock className="me-2" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {currentScenario && (
                <>
                  <p className="mb-3">{currentScenario.description}</p>
                  <div className="mb-3">
                    <strong>Objectives:</strong>
                    <ul className="mb-0 mt-2">
                      {currentScenario.objectives.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Vehicle Status */}
              {isRunning && (
                <Row className="mb-3">
                  <Col md={6}>
                    <div className="p-3 border rounded">
                      <h6>Vehicle Status</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Speed:</span>
                        <Badge bg="info">{vehicleState.speed} km/h</Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Gear:</span>
                        <Badge bg="secondary">{vehicleState.gear}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Direction:</span>
                        <Badge bg="primary">{vehicleState.direction.toFixed(1)}°</Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 border rounded">
                      <h6>Score: {score}/100</h6>
                      <ProgressBar
                        now={score}
                        variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}
                        className="mb-2"
                      />
                      <small className="text-muted">
                        Scenario {currentScenarioIndex + 1} of {scenarios.length}
                      </small>
                    </div>
                  </Col>
                </Row>
              )}

              {/* Controls */}
              {isRunning && !isPaused && (
                <Card className="mb-3">
                  <Card.Body>
                    <h6>Vehicle Controls</h6>
                    <Row className="text-center">
                      <Col>
                        <Button
                          variant={controls.accelerator ? "success" : "outline-success"}
                          className="mb-2 w-100"
                          onMouseDown={() => handleControlChange('accelerator', true)}
                          onMouseUp={() => handleControlChange('accelerator', false)}
                          onMouseLeave={() => handleControlChange('accelerator', false)}
                        >
                          <ArrowUp /> Accelerate
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          variant={controls.brake ? "danger" : "outline-danger"}
                          className="mb-2 w-100"
                          onMouseDown={() => handleControlChange('brake', true)}
                          onMouseUp={() => handleControlChange('brake', false)}
                          onMouseLeave={() => handleControlChange('brake', false)}
                        >
                          <ArrowDown /> Brake
                        </Button>
                      </Col>
                    </Row>
                    <Row className="text-center">
                      <Col>
                        <Button
                          variant={controls.steering < 0 ? "primary" : "outline-primary"}
                          className="me-2"
                          onClick={() => handleControlChange('steering', -0.5)}
                        >
                          <ArrowLeft /> Left
                        </Button>
                        <Button
                          variant={controls.steering > 0 ? "primary" : "outline-primary"}
                          onClick={() => handleControlChange('steering', 0.5)}
                        >
                          Right <ArrowRight />
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {/* Feedback */}
              {feedback.length > 0 && (
                <div className="mb-3">
                  <h6>Recent Feedback:</h6>
                  {feedback.slice(-3).map((item, index) => (
                    <Alert
                      key={index}
                      variant={item.type === 'success' ? 'success' : 'warning'}
                      className="py-2 mb-2"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{item.message}</span>
                        <Badge bg={item.points > 0 ? 'success' : 'danger'}>
                          {item.points > 0 ? '+' : ''}{item.points}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Control Buttons */}
              {!isRunning ? (
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
              ) : (
                <div className="d-flex justify-content-between">
                  {isPaused ? (
                    <Button variant="success" onClick={resumeSimulation}>
                      <Play className="me-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button variant="warning" onClick={pauseSimulation}>
                      <Pause className="me-2" />
                      Pause
                    </Button>
                  )}
                  <Button variant="primary" onClick={nextScenario}>
                    Next Scenario
                  </Button>
                  <Button variant="danger" onClick={completeSimulation}>
                    <Stop className="me-2" />
                    End Simulation
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Scenario Progress */}
          <Card className="mb-4">
            <Card.Header>
              <h6>Scenario Progress</h6>
            </Card.Header>
            <Card.Body>
              {scenarios.map((scenario, index) => (
                <div key={scenario.id} className="mb-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <small className={index === currentScenarioIndex ? 'fw-bold' : ''}>
                      {scenario.title}
                    </small>
                    {index < currentScenarioIndex ? (
                      <CheckCircle className="text-success" />
                    ) : index === currentScenarioIndex ? (
                      <Clock className="text-primary" />
                    ) : (
                      <XCircle className="text-muted" />
                    )}
                  </div>
                  {index === currentScenarioIndex && (
                    <ProgressBar
                      now={(currentScenario.duration - timeLeft) / currentScenario.duration * 100}
                      className="mt-1"
                      style={{ height: '4px' }}
                    />
                  )}
                </div>
              ))}
            </Card.Body>
          </Card>

          {/* Tips */}
          <Card>
            <Card.Header>
              <h6>Driving Tips</h6>
            </Card.Header>
            <Card.Body>
              <ul className="small mb-0">
                <li>Maintain safe following distance</li>
                <li>Check mirrors regularly</li>
                <li>Use indicators for lane changes</li>
                <li>Anticipate other road users</li>
                <li>Stay focused and avoid distractions</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results Modal */}
      <Modal show={showResult} onHide={() => setShowResult(false)} size="lg" centered>
        <Modal.Header className="bg-success text-white">
          <Modal.Title>Simulation Complete!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="text-center">
            <Col md={6}>
              <Trophy className="text-success" size={60} />
              <h4 className="mt-3">Final Score: {score}/100</h4>
              <ProgressBar
                now={score}
                label={`${score}%`}
                variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}
                className="mb-3"
              />
            </Col>
            <Col md={6}>
              <div className="p-3 border rounded">
                <h5>Readiness Assessment</h5>
                <h3 className={`mt-3 ${readinessScore >= 80 ? 'text-success' : readinessScore >= 60 ? 'text-warning' : 'text-danger'}`}>
                  {readinessScore}%
                </h3>
                <p className="text-muted mb-0">
                  {readinessScore >= 80 ? 'Ready for road test!' :
                   readinessScore >= 60 ? 'Good progress, more practice needed' :
                   'Additional training recommended'}
                </p>
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <h6>Performance Summary:</h6>
            <Row>
              <Col md={4}>
                <div className="text-center">
                  <div className="h4 text-primary">{feedback.filter(f => f.points > 0).length}</div>
                  <small className="text-muted">Positive Actions</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <div className="h4 text-warning">{feedback.filter(f => f.points < 0).length}</div>
                  <small className="text-muted">Areas for Improvement</small>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <div className="h4 text-info">{scenarios.length}</div>
                  <small className="text-muted">Scenarios Completed</small>
                </div>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResult(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Practice Again
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CarSimulation;
 