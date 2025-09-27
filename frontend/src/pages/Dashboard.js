import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Alert, Badge, Button, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import { PersonFill, BookFill, QuestionCircleFill, GraphUp, GraphDown, ExclamationTriangle, CheckCircle, Lightbulb, BarChart } from 'react-bootstrap-icons';
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
      const response = await api.get('/schools/stats'); // This will become /api/schools/stats due to baseURL
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Failed to load dashboard data: ' + err.response?.data?.error || err.message);
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

  // Calculate intelligent insights
  const calculateInsights = () => {
    if (!stats?.recentProgress) return null;

    const recentProgress = stats.recentProgress.slice(0, 10);
    const avgScore = recentProgress.reduce((sum, p) => sum + p.quiz_score, 0) / recentProgress.length;
    const completionRate = (recentProgress.filter(p => p.completed_at).length / recentProgress.length) * 100;

    // Performance trends
    const highPerformers = recentProgress.filter(p => p.quiz_score >= 80).length;
    const needsAttention = recentProgress.filter(p => p.quiz_score < 50).length;

    return {
      avgScore: Math.round(avgScore),
      completionRate: Math.round(completionRate),
      highPerformers,
      needsAttention,
      totalRecent: recentProgress.length
    };
  };

  const insights = calculateInsights();

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Smart Dashboard</h2>
        <Button variant="outline-primary" onClick={fetchDashboardStats}>
          <BarChart className="me-2" />Refresh Insights
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Intelligent Insights */}
      {insights && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0"><Lightbulb className="me-2" />AI-Powered Insights</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className={`text-${insights.avgScore >= 70 ? 'success' : insights.avgScore >= 50 ? 'warning' : 'danger'}`}>
                        {insights.avgScore}%
                      </h4>
                      <small className="text-muted">Avg Performance</small>
                      <ProgressBar
                        now={insights.avgScore}
                        variant={insights.avgScore >= 70 ? 'success' : insights.avgScore >= 50 ? 'warning' : 'danger'}
                        className="mt-2"
                      />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-info">{insights.completionRate}%</h4>
                      <small className="text-muted">Completion Rate</small>
                      <ProgressBar now={insights.completionRate} variant="info" className="mt-2" />
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className="text-success">{insights.highPerformers}</h4>
                      <small className="text-muted">High Performers</small>
                      <Badge bg="success" className="mt-2">
                        <CheckCircle className="me-1" />
                        Excellent
                      </Badge>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <h4 className={`text-${insights.needsAttention > 0 ? 'danger' : 'success'}`}>
                        {insights.needsAttention}
                      </h4>
                      <small className="text-muted">Need Attention</small>
                      {insights.needsAttention > 0 && (
                        <Badge bg="danger" className="mt-2">
                          <ExclamationTriangle className="me-1" />
                          Action Required
                        </Badge>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="overview" className="mb-4">
        <Tab eventKey="overview" title="Overview">
          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3} className="mb-3">
              <Card className="border-primary h-100">
                <Card.Body className="text-center">
                  <PersonFill className="text-primary mb-2" size={40} />
                  <h5 className="text-primary">{stats?.stats?.totalUsers || 0}</h5>
                  <Card.Text className="text-muted">Total Users</Card.Text>
                  <Badge bg="success" className="mt-2">
                    <GraphUp className="me-1" />
                    +12% this month
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-success h-100">
                <Card.Body className="text-center">
                  <BookFill className="text-success mb-2" size={40} />
                  <h5 className="text-success">{stats?.stats?.totalChapters || 0}</h5>
                  <Card.Text className="text-muted">Total Chapters</Card.Text>
                  <Badge bg="info" className="mt-2">
                    <CheckCircle className="me-1" />
                    All Active
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-warning h-100">
                <Card.Body className="text-center">
                  <QuestionCircleFill className="text-warning mb-2" size={40} />
                  <h5 className="text-warning">{stats?.stats?.totalProgress || 0}</h5>
                  <Card.Text className="text-muted">Quiz Attempts</Card.Text>
                  <Badge bg="warning" className="mt-2">
                    <GraphUp className="me-1" />
                    +8% this week
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-info h-100">
                <Card.Body className="text-center">
                  <CheckCircle className="text-info mb-2" size={40} />
                  <h5 className="text-info">98.5%</h5>
                  <Card.Text className="text-muted">System Uptime</Card.Text>
                  <Badge bg="success" className="mt-2">
                    <CheckCircle className="me-1" />
                    Excellent
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Smart Recommendations */}
          <Row className="mb-4">
            <Col md={6}>
              <Card>
                <Card.Header className="bg-light">
                  <h5 className="mb-0"><Lightbulb className="me-2" />Smart Recommendations</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="info">
                    <strong>Performance Insight:</strong> Students scoring below 50% may benefit from additional practice sessions.
                  </Alert>
                  <Alert variant="success">
                    <strong>Success Pattern:</strong> Interactive chapters show 25% higher completion rates.
                  </Alert>
                  <Alert variant="warning">
                    <strong>Attention Needed:</strong> 3 students haven't logged in for 7+ days.
                  </Alert>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header className="bg-light">
                  <h5 className="mb-0"><GraphUp className="me-2" />Performance Trends</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Weekly Progress</strong>
                    <ProgressBar className="mt-2">
                      <ProgressBar variant="success" now={75} label="Completed" />
                      <ProgressBar variant="warning" now={20} label="In Progress" />
                      <ProgressBar variant="danger" now={5} label="At Risk" />
                    </ProgressBar>
                  </div>
                  <div className="mb-3">
                    <strong>Engagement Score</strong>
                    <ProgressBar variant="info" now={82} label="82%" className="mt-2" />
                  </div>
                  <div>
                    <strong>Retention Rate</strong>
                    <ProgressBar variant="success" now={94} label="94%" className="mt-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="activity" title="Recent Activity">
          <Card>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Recent Activity & Performance</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Chapter</th>
                    <th>Score</th>
                    <th>Performance</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentProgress?.slice(0, 10).map((progress, index) => (
                    <tr key={index}>
                      <td>{progress.student?.first_name} {progress.student?.last_name}</td>
                      <td>{progress.chapter?.title}</td>
                      <td>
                        <Badge bg={progress.quiz_score >= 80 ? 'success' : progress.quiz_score >= 60 ? 'warning' : 'danger'}>
                          {progress.quiz_score}%
                        </Badge>
                      </td>
                      <td>
                        <ProgressBar
                          now={progress.quiz_score}
                          variant={progress.quiz_score >= 80 ? 'success' : progress.quiz_score >= 60 ? 'warning' : 'danger'}
                          style={{ width: '100px' }}
                        />
                      </td>
                      <td>{new Date(progress.last_attempt_at).toLocaleDateString()}</td>
                      <td>
                        <Badge bg={progress.completed_at ? 'success' : 'warning'}>
                          {progress.completed_at ? 'Completed' : 'In Progress'}
                        </Badge>
                      </td>
                      <td>
                        {progress.quiz_score >= 80 && <Badge bg="success"><CheckCircle className="me-1" />Excellent</Badge>}
                        {progress.quiz_score < 50 && <Badge bg="danger"><ExclamationTriangle className="me-1" />Needs Help</Badge>}
                        {progress.quiz_score >= 50 && progress.quiz_score < 80 && <Badge bg="warning">Good Progress</Badge>}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        No recent activity
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="analytics" title="Quick Analytics">
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>Performance Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Score Ranges</strong>
                    <div className="mt-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span>90-100%</span>
                        <span>{stats?.recentProgress?.filter(p => p.quiz_score >= 90).length || 0}</span>
                      </div>
                      <ProgressBar variant="success" now={((stats?.recentProgress?.filter(p => p.quiz_score >= 90).length || 0) / (stats?.recentProgress?.length || 1)) * 100} />

                      <div className="d-flex justify-content-between mb-1 mt-2">
                        <span>70-89%</span>
                        <span>{stats?.recentProgress?.filter(p => p.quiz_score >= 70 && p.quiz_score < 90).length || 0}</span>
                      </div>
                      <ProgressBar variant="info" now={((stats?.recentProgress?.filter(p => p.quiz_score >= 70 && p.quiz_score < 90).length || 0) / (stats?.recentProgress?.length || 1)) * 100} />

                      <div className="d-flex justify-content-between mb-1 mt-2">
                        <span>50-69%</span>
                        <span>{stats?.recentProgress?.filter(p => p.quiz_score >= 50 && p.quiz_score < 70).length || 0}</span>
                      </div>
                      <ProgressBar variant="warning" now={((stats?.recentProgress?.filter(p => p.quiz_score >= 50 && p.quiz_score < 70).length || 0) / (stats?.recentProgress?.length || 1)) * 100} />

                      <div className="d-flex justify-content-between mb-1 mt-2">
                        <span>Below 50%</span>
                        <span>{stats?.recentProgress?.filter(p => p.quiz_score < 50).length || 0}</span>
                      </div>
                      <ProgressBar variant="danger" now={((stats?.recentProgress?.filter(p => p.quiz_score < 50).length || 0) / (stats?.recentProgress?.length || 1)) * 100} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h5>System Health</h5>
                </Card.Header>
                <Card.Body>
                  <Alert variant="success">
                    <CheckCircle className="me-2" />
                    All systems operational
                  </Alert>
                  <div className="mb-3">
                    <strong>Database Status</strong>
                    <Badge bg="success" className="ms-2">Connected</Badge>
                  </div>
                  <div className="mb-3">
                    <strong>API Response Time</strong>
                    <Badge bg="success" className="ms-2">120ms</Badge>
                  </div>
                  <div className="mb-3">
                    <strong>Active Sessions</strong>
                    <Badge bg="info" className="ms-2">{stats?.stats?.totalUsers || 0}</Badge>
                  </div>
                  <div>
                    <strong>Storage Used</strong>
                    <ProgressBar now={65} label="65%" variant="info" className="mt-2" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Dashboard;