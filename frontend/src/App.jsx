import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import StaffDashboard from './pages/StaffDashboard';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

// Redirect based on role if already logged in
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'Admin') return <Navigate to="/admin" replace />;
  if (user.role === 'Manager') return <Navigate to="/manager" replace />;
  if (user.role === 'Staff') return <Navigate to="/staff" replace />;
  
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/manager/*" element={
        <ProtectedRoute allowedRoles={['Manager']}>
          <ManagerDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/staff/*" element={
        <ProtectedRoute allowedRoles={['Staff']}>
          <StaffDashboard />
        </ProtectedRoute>
      } />

      <Route path="/unauthorized" element={<div className="p-8 text-red-500 font-bold">Unauthorized Access</div>} />
      <Route path="/" element={<RoleBasedRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
