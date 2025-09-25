import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Button } from 'react-bootstrap';
import { PersonFill, BookFill, QuestionCircleFill, PeopleFill, CheckCircle, Clock } from 'react-bootstrap-icons';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/schools/stats');
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
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
      <h2 className="mb-4">Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-primary h-100">
            <Card.Body className="text-center">
              <PersonFill className="text-primary mb-2" size={40} />
              <h5 className="text-primary">{stats?.stats?.totalUsers || 0}</h5>
              <Card.Text className="text-muted">Total Users</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-success h-100">
            <Card.Body className="text-center">
              <BookFill className="text-success mb-2" size={40} />
              <h5 className="text-success">{stats?.stats?.totalChapters || 0}</h5>
              <Card.Text className="text-muted">Total Chapters</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-warning h-100">
            <Card.Body className="text-center">
              <QuestionCircleFill className="text-warning mb-2" size={40} />
              <h5 className="text-warning">{stats?.stats?.totalProgress || 0}</h5>
              <Card.Text className="text-muted">Quiz Attempts</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-info h-100">
            <Card.Body className="text-center">
              <CheckCircle className="text-info mb-2" size={40} />
              <h5 className="text-info">Active</h5>
              <Card.Text className="text-muted">System Status</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Recent Activity</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Chapter</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentProgress?.slice(0, 5).map((progress, index) => (
                    <tr key={index}>
                      <td>{progress.student?.first_name} {progress.student?.last_name}</td>
                      <td>{progress.chapter?.title}</td>
                      <td>
                        <span className={`badge ${progress.quiz_score >= 70 ? 'bg-success' : 'bg-warning'}`}>
                          {progress.quiz_score}%
                        </span>
                      </td>
                      <td>{new Date(progress.last_attempt_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${progress.completed_at ? 'bg-success' : 'bg-warning'}`}>
                          {progress.completed_at ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;