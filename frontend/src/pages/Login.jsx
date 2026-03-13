import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);

      // Redirect based on role
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Manager') navigate('/manager');
      else if (user.role === 'Staff') navigate('/staff');
      else navigate('/');

    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* Header */}
        <div className="login-header">
          <div className="login-icon">
            <LayoutDashboard size={32} strokeWidth={2} />
          </div>
          <h2 className="login-title">Inventory Management System Login</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Email Field */}
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="forgot-password" style={{ marginTop: '0.5rem', textAlign: 'right' }}>
              <Link to="/reset-password" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
          </div>

          {error && (
            <div className="login-error" style={{ marginBottom: '-0.5rem' }}>
              <AlertCircle size={18} className="error-icon" />
              <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="login-submit-btn"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}