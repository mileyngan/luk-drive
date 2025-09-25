import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { Check, X, Eye } from 'react-bootstrap-icons';
import api from '../services/api';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load schools');
      setLoading(false);
    }
  };

  const updateSchoolStatus = async (schoolId, status) => {
    try {
      await api.put('/schools/status', { schoolId, status });
      fetchSchools();
    } catch (err) {
      setError('Failed to update school status');
    }
  };

  const viewSchoolDetails = (school) => {
    setSelectedSchool(school);
    setShowDetails(true);
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
        <h2>School Management</h2>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>School Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>{school.email}</td>
                  <td>{school.phone}</td>
                  <td>{school.city}</td>
                  <td>
                    <Badge 
                      bg={
                        school.status === 'approved' ? 'success' :
                        school.status === 'pending' ? 'warning' : 'danger'
                      }
                    >
                      {school.status}
                    </Badge>
                  </td>
                  <td>{new Date(school.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm" 
                      className="me-2"
                      onClick={() => viewSchoolDetails(school)}
                    >
                      <Eye className="me-1" /> View
                    </Button>
                    {school.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-2"
                          onClick={() => updateSchoolStatus(school.id, 'approved')}
                        >
                          <Check className="me-1" /> Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => updateSchoolStatus(school.id, 'suspended')}
                        >
                          <X className="me-1" /> Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* School Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)}>
        <Modal.Header closeButton>
          <Modal.Title>School Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchool && (
            <div>
              <h5>{selectedSchool.name}</h5>
              <p><strong>Email:</strong> {selectedSchool.email}</p>
              <p><strong>Phone:</strong> {selectedSchool.phone}</p>
              <p><strong>Address:</strong> {selectedSchool.address}</p>
              <p><strong>City:</strong> {selectedSchool.city}</p>
              <p><strong>Region:</strong> {selectedSchool.region}</p>
              <p><strong>Status:</strong> <Badge bg={selectedSchool.status === 'approved' ? 'success' : selectedSchool.status === 'pending' ? 'warning' : 'danger'}>
                {selectedSchool.status}
              </Badge></p>
              <p><strong>Created:</strong> {new Date(selectedSchool.created_at).toLocaleString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolManagement;