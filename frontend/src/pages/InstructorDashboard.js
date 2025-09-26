import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tabs, Tab } from 'react-bootstrap';
import { Book, People, BarChart, ChatDots, CarFront } from 'react-bootstrap-icons'; // Changed ChartBar to BarChart
import api from '../services/api';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalChapters: 0,
    averageScore: 0,
    completedChapters: 0
  });

  useEffect(() => {
    fetchInstructorStats();
  }, []);

  const fetchInstructorStats = async () => {
    try {
      const response = await api.get('/instructor/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Instructor Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-primary">
            <Card.Body className="text-center">
              <People className="text-primary mb-2" size={40} />
              <h5 className="text-primary">{stats.totalStudents}</h5>
              <Card.Text className="text-muted">Students</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-success">
            <Card.Body className="text-center">
              <Book className="text-success mb-2" size={40} />
              <h5 className="text-success">{stats.totalChapters}</h5>
              <Card.Text className="text-muted">Chapters</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-warning">
            <Card.Body className="text-center">
              <BarChart className="text-warning mb-2" size={40} /> {/* Changed to BarChart */}
              <h5 className="text-warning">{stats.averageScore}%</h5>
              <Card.Text className="text-muted">Avg Score</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-info">
            <Card.Body className="text-center">
              <CarFront className="text-info mb-2" size={40} />
              <h5 className="text-info">{stats.completedChapters}</h5>
              <Card.Text className="text-muted">Completed</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different sections */}
      <Tabs defaultActiveKey="students" className="mb-4">
        <Tab eventKey="students" title="Manage Students">
          <Card>
            <Card.Header>Student Management</Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Progress</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>John Doe</td>
                    <td>50%</td>
                    <td>75%</td>
                    <td><span className="badge bg-warning">In Progress</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">Review</Button>
                      <Button variant="outline-success" size="sm">Approve</Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="chapters" title="Create Chapters">
          <Card>
            <Card.Header>Create New Chapter</Card.Header>
            <Card.Body>
              <form>
                <div className="mb-3">
                  <label className="form-label">Chapter Title</label>
                  <input type="text" className="form-control" placeholder="Enter chapter title" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ebook Content</label>
                  <textarea className="form-control" rows="6" placeholder="Enter ebook content"></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">Video URL</label>
                  <input type="url" className="form-control" placeholder="Enter YouTube URL" />
                </div>
                <Button variant="primary">Create Chapter</Button>
              </form>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="reviews" title="Practical Reviews">
          <Card>
            <Card.Header>Practical Exercise Reviews</Card.Header>
            <Card.Body>
              <p>Review and grade student practical exercises</p>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;