import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import textData from '../constants/textData';
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
      setError(err || 'Failed to sign in. Please check your credentials.');
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
          <h2 className="login-title">{textData.login.title}</h2>
          <p className="login-subtitle">{textData.login.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">

          {/* Email Field */}
          <div className="form-group">
            <label>{textData.login.emailLabel}</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={textData.login.emailPlaceholder}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label>{textData.login.passwordLabel}</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={textData.login.passwordPlaceholder}
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
              <Link to="/forgot-password" style={{ color: 'var(--primary-color)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' }}>{textData.login.forgotPassword}</Link>
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
              textData.login.loginButton
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          {textData.login.noAccount}{' '}
          <Link to="/register">{textData.login.registerLink}</Link>
        </div>
      </div>
    </div>
  );
}
