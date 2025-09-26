import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Pencil, Trash } from 'react-bootstrap-icons';
import api from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'student',
    program_type: 'novice'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get all users from the current school (not just students)
      const response = await api.get('/users');
      console.log('All users response:', response.data); // Debug log
      
      // Filter for students only
      const allUsers = Array.isArray(response.data) ? response.data : [];
      const studentUsers = allUsers.filter(user => user.role === 'student');
      
      console.log('Filtered students:', studentUsers); // Debug log
      setStudents(studentUsers);
      setLoading(false);
    } catch (err) {
      console.error('Students fetch error:', err);
      setError('Failed to load students: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating student with data:', formData); // Debug log
      const response = await api.post('/users', formData);
      console.log('Student creation response:', response.data); // Debug log
      
      setShowModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: 'student',
        program_type: 'novice'
      });
      fetchStudents(); // Refresh the list
    } catch (err) {
      console.error('Student creation error:', err);
      setError('Failed to create student: ' + (err.response?.data?.error || err.message));
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Students Management</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus className="me-2" /> Add Student
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Program</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.first_name} {student.last_name}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>
                      <span className="badge bg-primary">
                        {student.program_type || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-info">
                        {student.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${student.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">
                        <Pencil />
                      </Button>
                      <Button variant="outline-danger" size="sm">
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add Student Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Student</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Program Type</Form.Label>
              <Form.Select
                name="program_type"
                value={formData.program_type}
                onChange={handleInputChange}
                required
              >
                <option value="novice">Novice</option>
                <option value="recyclage">Recyclage</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Student
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Students;