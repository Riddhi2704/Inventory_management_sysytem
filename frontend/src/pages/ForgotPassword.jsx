import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft, LayoutDashboard } from 'lucide-react';
import textData from '../constants/textData';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      setStatus({ 
        type: 'success', 
        message: textData.forgotPassword.successMessage || response.data.message 
      });
      setEmail('');
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Something went wrong. Please try again later.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Header */}
        <div className="forgot-password-header">
          <div className="forgot-password-icon">
            <LayoutDashboard size={32} strokeWidth={2} />
          </div>
          <h2 className="forgot-password-title">{textData.forgotPassword.title}</h2>
          <p className="forgot-password-subtitle">{textData.forgotPassword.subtitle}</p>
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
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label>{textData.forgotPassword.emailLabel}</label>
            <div className="input-wrapper">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={textData.forgotPassword.placeholderEmail}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="forgot-password-submit-btn"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              textData.forgotPassword.submitButton
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="forgot-password-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} />
            <span>{textData.common.backToLogin}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
