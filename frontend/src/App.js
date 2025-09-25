import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import RegisterSchool from './components/auth/RegisterSchool';
import AdminDashboard from './components/admin/AdminDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import SuperAdminDashboard from './components/admin/SuperAdminDashboard';
import UserManagement from './components/admin/UserManagement';
import ProgramSelection from './components/student/ProgramSelection';
import ChapterList from './components/student/ChapterList';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'instructor':
      return <AdminDashboard />; // Instructors use admin dashboard for now
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register-school" element={<RegisterSchool />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student/programs" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ProgramSelection />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student/chapters/:programType" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ChapterList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/unauthorized" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Accès Non Autorisé</h1>
                    <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
                  </div>
                </div>
              } />
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Non Trouvée</h1>
                    <p className="text-gray-600">La page que vous recherchez n'existe pas.</p>
                  </div>
                </div>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;