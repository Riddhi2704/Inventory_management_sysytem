import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import textData from '../constants/textData';
import './ResetPassword.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (password !== confirmPassword) {
      return setStatus({ type: 'error', message: 'Passwords do not match.' });
    }

    if (password.length < 8) {
      return setStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:5001/api/auth/reset-password/${token}`, { 
        password 
      });
      
      setStatus({ type: 'success', message: textData.resetPassword.successMessage || response.data.message });
      
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        {/* Header */}
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <LayoutDashboard size={32} strokeWidth={2} />
          </div>
          <h2 className="reset-password-title">{textData.resetPassword.title}</h2>
          <p className="reset-password-subtitle">{textData.resetPassword.subtitle}</p>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div className={`status-alert ${status.type}`}>
            {status.type === 'success' ? (
              <CheckCircle2 size={18} className="alert-icon" />
            ) : (
              <AlertCircle size={18} className="alert-icon" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label>{textData.resetPassword.newPasswordLabel}</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={textData.resetPassword.placeholderPassword}
                disabled={isLoading || status.type === 'success'}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>{textData.resetPassword.confirmPasswordLabel}</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={textData.resetPassword.placeholderPassword}
                disabled={isLoading || status.type === 'success'}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || status.type === 'success'}
            className="reset-password-submit-btn"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              textData.resetPassword.submitButton
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="reset-password-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            <span>{textData.common.backToLogin}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
