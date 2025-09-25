import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages - we'll create these next
import Login from './pages/Login';
import RegisterSchool from './pages/RegisterSchool';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Chapters from './pages/Chapters';
import Quizzes from './pages/Quizzes';
import Chat from './pages/Chat';
import SchoolManagement from './pages/SchoolManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register-school" element={<RegisterSchool />} />
                  
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student', 'instructor']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/students" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'instructor']}>
                      <Students />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/chapters" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'instructor', 'student']}>
                      <Chapters />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/quizzes" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Quizzes />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/chat" element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/school-management" element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <SchoolManagement />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/" element={
                    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'student', 'instructor']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;