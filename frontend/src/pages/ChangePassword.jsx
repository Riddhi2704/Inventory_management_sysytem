import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import textData from '../constants/textData';

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.oldPassword) newErrors.oldPassword = textData.changePassword.validation.required;
    if (!formData.newPassword) newErrors.newPassword = textData.changePassword.validation.required;
    if (!formData.confirmPassword) newErrors.confirmPassword = textData.changePassword.validation.required;

    if (formData.newPassword && formData.newPassword.length < 8) {
      newErrors.newPassword = textData.changePassword.validation.strength;
    } else if (formData.newPassword) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        newErrors.newPassword = textData.changePassword.validation.strength;
      }
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = textData.changePassword.validation.mismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await axios.put('http://localhost:5001/api/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setMessage({ type: 'success', text: textData.changePassword.success });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(-1); // Go back to profile or previous page
      }, 2000);

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff',
        border: '1px solid #f1f5f9'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            margin: '0 auto 16px',
            color: '#2563eb'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
            {textData.changePassword.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {textData.changePassword.subtitle}
          </p>
        </div>

        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              {textData.changePassword.oldPassword}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="oldPassword"
                type={showPasswords.old ? 'text' : 'password'}
                value={formData.oldPassword}
                onChange={handleChange}
                placeholder={textData.changePassword.placeholders.old}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.oldPassword ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                type="button"
                onClick={() => toggleVisibility('old')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.oldPassword && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.oldPassword}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              {textData.changePassword.newPassword}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder={textData.changePassword.placeholders.new}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.newPassword ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                type="button"
                onClick={() => toggleVisibility('new')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.newPassword}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#334155', marginBottom: '6px' }}>
              {textData.changePassword.confirmPassword}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={textData.changePassword.placeholders.confirm}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#cbd5e1'}`,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button 
                type="button"
                onClick={() => toggleVisibility('confirm')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : textData.changePassword.submitButton}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              color: '#64748b',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'color 0.2s'
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
