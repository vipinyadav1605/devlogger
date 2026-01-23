import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Layout from './components/layouts/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Journal from './components/journal/Journal';
import Projects from './components/projects/Projects';
import Skills from './components/skills/Skills';
import Resources from './components/resources/Resources';
import Snippets from './components/snippets/Snippets';
import Goals from './components/goals/Goals';
import Activities from './components/activities/Activities';
import Profile from './components/profile/Profile';
import GitHub from './components/GitHub/GitHub'; 
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Layout onLogout={handleLogout} /> : <Navigate to="/login" />
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
          <Route path="resources" element={<Resources />} />
          <Route path="snippets" element={<Snippets />} />
          <Route path="goals" element={<Goals />} />
          <Route path="activities" element={<Activities />} />
          <Route path="github" element={<GitHub />} />  {/* NEW */}

          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;