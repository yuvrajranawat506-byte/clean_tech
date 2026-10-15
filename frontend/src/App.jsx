// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SchedulePickup from './pages/SchedulePickup';
import MyPickups from './pages/MyPickups';
import Rewards from './pages/Rewards';
import Impact from './pages/Impact';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPickups from './pages/admin/AdminPickups';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public Routes — redirect to dashboard if already logged in */}
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/schedule"  element={<ProtectedRoute><SchedulePickup /></ProtectedRoute>} />
          <Route path="/my-pickups" element={<ProtectedRoute><MyPickups /></ProtectedRoute>} />
          <Route path="/rewards"   element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
          <Route path="/impact"    element={<ProtectedRoute><Impact /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/pickups"   element={<ProtectedRoute adminOnly><AdminPickups /></ProtectedRoute>} />
          <Route path="/admin/users"     element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />

          {/* Marketing Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
