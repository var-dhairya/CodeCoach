import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';

import ImportKattis from './pages/ImportKattis';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/problems" element={
              <ProtectedRoute>
                <Layout>
                  <Problems />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/problems/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ProblemDetail />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/problems/:problemId/analysis" element={
              <ProtectedRoute>
                <Layout>
                  <Analysis />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            
            <Route path="/import/kattis" element={
              <ProtectedRoute>
                <Layout>
                  <ImportKattis />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
