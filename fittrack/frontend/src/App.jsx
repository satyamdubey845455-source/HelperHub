import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Diet from './pages/Diet';
import Water from './pages/Water';
import Workout from './pages/Workout';
import Sleep from './pages/Sleep';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import CalendarPage from './pages/CalendarPage';
import Notifications from './pages/Notifications';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#818cf8',
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.2rem',
        }}
      >
        Loading FitTrack Hub...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes wrapped in Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="diet" element={<Diet />} />
        <Route path="water" element={<Water />} />
        <Route path="workout" element={<Workout />} />
        <Route path="sleep" element={<Sleep />} />
        <Route path="progress" element={<Progress />} />
        <Route path="goals" element={<Goals />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
