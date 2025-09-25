import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { Navbar as BootstrapNavbar, Nav, Button, Container } from 'react-bootstrap';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'student': return 'Élève';
      case 'instructor': return 'Instructeur';
      case 'superadmin': return 'Super Admin';
      default: return role;
    }
  };

  return (
    <BootstrapNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        {/* Logo */}
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="bg-white text-primary rounded p-1 me-2">
            <span className="fw-bold">🚗</span>
          </div>
          <span className="fw-bold">SmartDrive</span>
        </BootstrapNavbar.Brand>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BootstrapNavbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="d-flex align-items-center">
            {user ? (
              <>
                <Nav.Item className="me-3 text-white">
                  <span className="d-none d-md-inline">
                    Bienvenue, {user.firstName}
                  </span>
                  <span className="d-md-none">
                    {user.firstName}
                  </span>
                </Nav.Item>
                <Nav.Item className="me-3">
                  <span className="badge bg-light text-primary small">
                    {getUserRoleText(user.role)}
                  </span>
                </Nav.Item>
                <Nav.Item>
                  <Button
                    variant="outline-light"
                    onClick={handleLogout}
                    className="d-flex align-items-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 me-1" />
                    <span className="d-none d-md-inline">Déconnexion</span>
                    <span className="d-md-none">Déco</span>
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <>
                <Nav.Item className="me-2">
                  <Nav.Link as={Link} to="/login" className="text-white">
                    Connexion
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Button as={Link} to="/register-school" variant="light">
                    Inscrire École
                  </Button>
                </Nav.Item>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;