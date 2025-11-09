/**
 * VrikshAI Web App - Main Application Component
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DarshanPage from './pages/DarshanPage';
import MeraVanaPage from './pages/MeraVanaPage';
import ChikitsaPage from './pages/ChikitsaPage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirect to home if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, user } = useAuth();

  console.log('PublicRoute - loading:', loading, 'authenticated:', authenticated, 'user:', user);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  if (authenticated) {
    console.log('PublicRoute - Redirecting to / because authenticated is true');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/darshan"
        element={
          <ProtectedRoute>
            <DarshanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mera-vana"
        element={
          <ProtectedRoute>
            <MeraVanaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chikitsa"
        element={
          <ProtectedRoute>
            <ChikitsaPage />
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
