import React from 'react';
import { useAuth } from './AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { House, People, Book, QuestionCircle, ChatDots, Building, BoxArrowRight } from 'react-bootstrap-icons';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getNavItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'super_admin':
        return [
          { path: '/school-management', label: 'Schools', icon: Building },
          { path: '/dashboard', label: 'Dashboard', icon: House }
        ];
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: House },
          { path: '/students', label: 'Students', icon: People },
          { path: '/chapters', label: 'Chapters', icon: Book },
          { path: '/chat', label: 'AI Chat', icon: ChatDots }
        ];
      case 'student':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: House },
          { path: '/chapters', label: 'Chapters', icon: Book },
          { path: '/quizzes', label: 'Quizzes', icon: QuestionCircle },
          { path: '/chat', label: 'AI Chat', icon: ChatDots }
        ];
      case 'instructor':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: House },
          { path: '/students', label: 'Students', icon: People },
          { path: '/chapters', label: 'Chapters', icon: Book },
          { path: '/chat', label: 'AI Chat', icon: ChatDots }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          <span className="me-2">🚗</span>SmartDrive
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  to={item.path}
                >
                  <item.icon className="me-1" size={16} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                <span className="me-2">{user.first_name} {user.last_name}</span>
                <span className="badge bg-secondary">{user.role}</span>
              </a>
              <ul className="dropdown-menu">
                <li><span className="dropdown-item-text small text-muted">{user.school?.name || 'School'}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={handleLogout}>
                  <BoxArrowRight className="me-2" /> Logout
                </button></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;