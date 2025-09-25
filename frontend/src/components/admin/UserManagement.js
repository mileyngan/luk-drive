import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Alert } from 'react-bootstrap';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({ role: '', program_type: '' });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student',
    programType: 'novice',
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.program_type) params.append('program_type', filters.program_type);

      const response = await axios.get(`${API_URL}/api/users?${params}`);
      setUsers(response.data.users);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'student',
      programType: 'novice',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (editingUser) {
        // Update existing user
        await axios.put(`${API_URL}/api/users/${editingUser.id}`, formData);
        setSuccessMessage('Utilisateur modifié avec succès.');
      } else {
        // Create new user
        const response = await axios.post(`${API_URL}/api/users`, formData);
        const tempPassword = response.data.temporaryPassword;
        setSuccessMessage(
          `Nouvel utilisateur créé avec succès. Mot de passe temporaire : ${tempPassword}`
        );
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || '',
      role: user.role,
      programType: user.program_type || 'novice',
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;

    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm('Réinitialiser le mot de passe de cet utilisateur?')) return;

    try {
      const response = await axios.post(`${API_URL}/api/users/${userId}/reset-password`);
      const tempPassword = response.data.temporaryPassword;
      setSuccessMessage(`Mot de passe réinitialisé. Nouveau mot de passe : ${tempPassword}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la réinitialisation');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student':
        return 'primary';
      case 'instructor':
        return 'success';
      case 'admin':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'student':
        return 'Élève';
      case 'instructor':
        return 'Instructeur';
      case 'admin':
        return 'Administrateur';
      default:
        return role;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h2 text-dark">Gestion des Utilisateurs</h1>
              <p className="text-muted">Gérez les élèves et instructeurs de {user?.school?.name}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setEditingUser(null);
                setShowModal(true);
              }}
            >
              <PlusIcon className="h-5 w-5 me-2" />
              Ajouter Utilisateur
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="success"
            className="mb-4"
            onClose={() => setSuccessMessage('')}
            dismissible
          >
            {successMessage}
          </Alert>
        )}

        {/* Filters */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filtrer par rôle</Form.Label>
                  <Form.Select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  >
                    <option value="">Tous les rôles</option>
                    <option value="student">Élèves</option>
                    <option value="instructor">Instructeurs</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filtrer par programme</Form.Label>
                  <Form.Select
                    value={filters.program_type}
                    onChange={(e) => setFilters({ ...filters, program_type: e.target.value })}
                  >
                    <option value="">Tous les programmes</option>
                    <option value="novice">Novice</option>
                    <option value="recyclage">Recyclage</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => setFilters({ role: '', program_type: '' })}
                  className="w-100"
                >
                  Réinitialiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Users Table */}
        <Card className="shadow-sm">
          {loading ? (
            <div className="p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Utilisateur</th>
                    <th>Rôle</th>
                    <th>Programme</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <div className="fw-bold">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-muted small">{user.email}</div>
                          {user.phone && <div className="text-muted small">{user.phone}</div>}
                        </div>
                      </td>
                      <td>
                        <span className={`badge bg-${getRoleBadgeColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td>
                        {user.program_type ? (
                          <span className="text-capitalize">{user.program_type}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(user)}
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleResetPassword(user.id)}
                            title="Réinitialiser mot de passe"
                          >
                            <KeyIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {users.length === 0 && !loading && (
                <div className="p-5 text-center text-muted">
                  <UsersIcon className="mx-auto h-12 w-12 text-muted mb-3" />
                  <p>Aucun utilisateur trouvé.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modal for Add/Edit User */}
        <Modal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setEditingUser(null);
            resetForm();
          }}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{editingUser ? 'Modifier Utilisateur' : 'Ajouter Utilisateur'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  required
                  disabled={editingUser !== null}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Form.Group>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Nom</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rôle</Form.Label>
                <Form.Select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Élève</option>
                  <option value="instructor">Instructeur</option>
                </Form.Select>
              </Form.Group>

              {formData.role === 'student' && (
                <Form.Group className="mb-3">
                  <Form.Label>Programme</Form.Label>
                  <Form.Select
                    required
                    value={formData.programType}
                    onChange={(e) => setFormData({ ...formData, programType: e.target.value })}
                  >
                    <option value="novice">Novice</option>
                    <option value="recyclage">Recyclage</option>
                  </Form.Select>
                </Form.Group>
              )}

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                >
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  {editingUser ? 'Modifier' : 'Ajouter'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default UserManagement;
