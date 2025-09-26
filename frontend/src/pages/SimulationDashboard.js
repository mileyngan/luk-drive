import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tabs, Tab } from 'react-bootstrap';
import { CarFront, Trophy, Clock, CheckCircle } from 'react-bootstrap-icons';
import CarSimulation from '../components/CarSimulation';
import api from '../services/api';

const SimulationDashboard = () => {
  const [simulations, setSimulations] = useState([]);
  const [studentSimulations, setStudentSimulations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimulations();
  }, []);

  const fetchSimulations = async () => {
    try {
      const [simResponse, studentResponse] = await Promise.all([
        api.get('/car-simulations'),
        api.get('/student-simulations')
      ]);
      
      setSimulations(simResponse.data);
      setStudentSimulations(studentResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      setLoading(false);
    }
  };

  const getSimulationStatus = (simulationId) => {
    const record = studentSimulations.find(ss => ss.simulation_id === simulationId);
    if (!record) return 'Not Started';
    if (record.is_completed) return 'Completed';
    return 'In Progress';
  };

  const getSimulationScore = (simulationId) => {
    const record = studentSimulations.find(ss => ss.simulation_id === simulationId);
    return record ? record.score : 0;
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

  return (
    <div className="p-4">
      <h2 className="mb-4">Car Simulation Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-primary">
            <Card.Body className="text-center">
              <CarFront className="text-primary mb-2" size={40} />
              <h5 className="text-primary">{simulations.length}</h5>
              <Card.Text className="text-muted">Available Simulations</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-success">
            <Card.Body className="text-center">
              <Trophy className="text-success mb-2" size={40} />
              <h5 className="text-success">
                {studentSimulations.filter(ss => ss.is_completed).length}
              </h5>
              <Card.Text className="text-muted">Completed</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-warning">
            <Card.Body className="text-center">
              <Clock className="text-warning mb-2" size={40} />
              <h5 className="text-warning">
                {Math.round(studentSimulations.reduce((sum, ss) => sum + (ss.score || 0), 0) / 
                 (studentSimulations.filter(ss => ss.score).length || 1))}%
              </h5>
              <Card.Text className="text-muted">Average Score</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-info">
            <Card.Body className="text-center">
              <CheckCircle className="text-info mb-2" size={40} />
              <h5 className="text-info">
                {studentSimulations.filter(ss => ss.score >= 80).length}
              </h5>
              <Card.Text className="text-muted">High Performers</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different views */}
      <Tabs defaultActiveKey="available" className="mb-4">
        <Tab eventKey="available" title="Available Simulations">
          <Row>
            {simulations.map(sim => (
              <Col md={6} lg={4} className="mb-4" key={sim.id}>
                <Card>
                  <Card.Body>
                    <h5>{sim.title}</h5>
                    <p className="text-muted">{sim.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className={`badge ${sim.difficulty_level === 'hard' ? 'bg-danger' : 
                                               sim.difficulty_level === 'medium' ? 'bg-warning' : 'bg-success'}`}>
                        {sim.difficulty_level}
                      </span>
                      <span className="text-muted">
                        {sim.duration_minutes} min
                      </span>
                    </div>
                    <div className="mt-3">
                      <small className="text-muted">
                        Status: {getSimulationStatus(sim.id)}
                        {getSimulationScore(sim.id) > 0 && (
                          <span className="ms-2">Score: {getSimulationScore(sim.id)}/100</span>
                        )}
                      </small>
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <CarSimulation chapterId={sim.chapter_id} />
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>

        <Tab eventKey="history" title="Simulation History">
          <Card>
            <Card.Header>My Simulation History</Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Simulation</th>
                    <th>Score</th>
                    <th>Time</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSimulations.map(ss => (
                    <tr key={ss.id}>
                      <td>{ss.simulation?.title || 'Unknown'}</td>
                      <td>
                        <span className={`badge ${ss.score >= 80 ? 'bg-success' : 
                                         ss.score >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                          {ss.score || 'N/A'}/100
                        </span>
                      </td>
                      <td>{ss.completion_time ? `${ss.completion_time}s` : 'N/A'}</td>
                      <td>{ss.completed_at ? new Date(ss.completed_at).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`badge ${ss.is_completed ? 'bg-success' : 'bg-warning'}`}>
                          {ss.is_completed ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SimulationDashboard;