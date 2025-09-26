import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Import all pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import RegisterSchool from './pages/RegisterSchool';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Chapters from './pages/Chapters';
import Quizzes from './pages/Quizzes';
import Chat from './pages/Chat';
import SchoolManagement from './pages/SchoolManagement';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-school" element={<RegisterSchool />} />
            
            {/* Protected routes with Navbar */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student', 'instructor']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <Dashboard />
                  </div>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'instructor']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <Students />
                  </div>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/chapters" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'instructor', 'student']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <Chapters />
                  </div>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/quizzes" element={
              <ProtectedRoute allowedRoles={['student']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <Quizzes />
                  </div>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute allowedRoles={['student']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <Chat />
                  </div>
                </>
              </ProtectedRoute>
            } />
            
            <Route path="/school-management" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <>
                  <Navbar />
                  <div className="container-fluid">
                    <SchoolManagement />
                  </div>
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;