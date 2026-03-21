import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, UserCircle, Save, AlertCircle, KeyRound } from 'lucide-react';
import textData from '../constants/textData';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    shiftTime: '',
    role: '',
    shopName: '',
    profilePhoto: '',
    managerId: '',
    department: '',
    joiningDate: '',
    password: '' // Only for updates, not fetched
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch the current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        const data = res.data;
        setFormData(prev => ({
          ...prev,
          fullName: data.fullName || '',
          email: data.email || '',
          mobileNumber: data.mobileNumber || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          shiftTime: data.shiftTime || '',
          role: data.role || '',
          shopName: data.shopName || '',
          profilePhoto: data.profilePhoto || '',
          managerId: data.managerId || '',
          department: data.department || '',
          joiningDate: data.joiningDate || ''
        }));
      } catch (err) {
        setMessage({ type: 'error', text: textData.profile.errorLoad });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.token) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Build the update payload; omit password if empty
      const payload = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        shiftTime: formData.shiftTime,
        profilePhoto: formData.profilePhoto,
        department: formData.department
      };

      if (formData.password.trim() !== '') {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }
        payload.password = formData.password;
      }

      const res = await axios.put('http://localhost:5001/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Update the AuthContext and localStorage with the new token and details
      updateUser(res.data);

      setMessage({ type: 'success', text: textData.profile.success });

      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || textData.profile.errorUpdate });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sd-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );
  }

  return (
    <div className="sd-card">
      <div className="sd-card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {formData.profilePhoto ? (
          <img
            src={formData.profilePhoto}
            alt="Profile"
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sd-border-color)' }}
          />
        ) : (
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '50%', padding: '0.5rem', border: '1px solid var(--sd-border-color)' }}>
            <UserCircle size={32} className="text-muted" />
          </div>
        )}
        <div>
          <h3 className="sd-card-title">{textData.profile.title}</h3>
          <p style={{ color: 'var(--sd-text-muted)', fontSize: '0.85rem' }}>{textData.profile.subtitle}</p>
        </div>
      </div>

      {message && (
        <div className="sd-alert-card mb-4" style={{
          backgroundColor: message.type === 'success' ? 'var(--sd-status-approved-bg)' : 'var(--sd-status-rejected-bg)',
          color: message.type === 'success' ? 'var(--sd-status-approved-text)' : 'var(--sd-status-rejected-text)',
          borderColor: message.type === 'success' ? 'var(--sd-status-approved-text)' : 'var(--sd-status-rejected-text)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <div className="sd-alert-content">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="sd-form-grid">
        {/* Editable Fields */}
        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.fullName}</label>
          <input
            required
            name="fullName"
            type="text"
            className="sd-input"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.phone}</label>
          <input
            required
            name="mobileNumber"
            type="text"
            className="sd-input"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group full">
          <label className="sd-label">{textData.profile.address}</label>
          <input
            required
            name="address"
            type="text"
            className="sd-input"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.city}</label>
          <input
            required
            name="city"
            type="text"
            className="sd-input"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.state}</label>
          <input
            required
            name="state"
            type="text"
            className="sd-input"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.pincode}</label>
          <input
            required
            name="pincode"
            type="text"
            className="sd-input"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.shiftTime}</label>
          <select
            name="shiftTime"
            className="sd-select"
            value={formData.shiftTime}
            onChange={handleChange}
            disabled={formData.role !== 'Staff'}
          >
            <option value="">{textData.profile.noShift}</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div className="sd-form-group full">
          <label className="sd-label">{textData.profile.profilePhoto}</label>
          <input
            name="profilePhoto"
            type="url"
            className="sd-input"
            value={formData.profilePhoto}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        {/* <div className="sd-form-group">
          <label className="sd-label">{textData.profile.changePassword}</label>
          <input 
            name="password"
            type="password" 
            className="sd-input" 
            value={formData.password}
            onChange={handleChange}
            placeholder={textData.profile.passwordPlaceholder}
          />
        </div> */}

        {/* Read-Only Information Section */}
        {formData.role === 'Manager' && (
          <div className="sd-form-group full" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--sd-border-color)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--sd-text-color)' }}>{textData.profile.managerDetails}</h4>
            <div className="sd-form-grid">
              <div className="sd-form-group">
                <label className="sd-label">{textData.profile.managerId}</label>
                <input type="text" className="sd-input" value={formData.managerId} disabled style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }} />
              </div>
              <div className="sd-form-group">
                <label className="sd-label">{textData.profile.department}</label>
                <select 
                  name="department" 
                  className="sd-select" 
                  value={formData.department} 
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  <option value="Inventory Management">Inventory Management</option>
                  <option value="Product Management">Product Management</option>
                </select>
              </div>
              <div className="sd-form-group">
                <label className="sd-label">{textData.profile.joiningDate}</label>
                <input type="text" className="sd-input" value={formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString() : ''} disabled style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }} />
              </div>
            </div>
          </div>
        )}

        <div className="sd-form-group full" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--sd-border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--sd-text-color)' }}>{textData.profile.accountDetails}</h4>
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.email}</label>
          <input
            type="email"
            className="sd-input"
            value={formData.email}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.role}</label>
          <input
            type="text"
            className="sd-input"
            value={formData.role}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">{textData.profile.shop}</label>
          <input
            type="text"
            className="sd-input"
            value={formData.shopName}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>

        <div className="sd-btn-group full" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
          <button type="submit" disabled={isSubmitting} className="sd-btn sd-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? textData.profile.updating : textData.profile.updateButton}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/change-password')}
            className="sd-btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              backgroundColor: '#2563eb',
              color: 'white'
            }}
          >
            <KeyRound size={18} />
            {textData.profile.changePasswordButton}
          </button>
        </div>
      </form>
    </div>
  );
}
