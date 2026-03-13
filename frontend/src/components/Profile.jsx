import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle2, UserCircle, Save, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  
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
    password: '' // Only for updates, not fetched
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch the current user's profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/auth/profile', {
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
          profilePhoto: data.profilePhoto || ''
        }));
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
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
        profilePhoto: formData.profilePhoto
      };

      if (formData.password.trim() !== '') {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }
        payload.password = formData.password;
      }

      const res = await axios.put('http://127.0.0.1:5000/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // Update the AuthContext and localStorage with the new token and details
      updateUser(res.data);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));
      
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update profile.' });
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
          <h3 className="sd-card-title">My Profile</h3>
          <p style={{ color: 'var(--sd-text-muted)', fontSize: '0.85rem' }}>View and update your personal information.</p>
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
          <label className="sd-label">Full Name</label>
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
          <label className="sd-label">Phone Number</label>
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
          <label className="sd-label">Address</label>
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
          <label className="sd-label">City</label>
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
          <label className="sd-label">State</label>
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
          <label className="sd-label">Pincode</label>
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
          <label className="sd-label">Shift Time</label>
          <select 
            name="shiftTime"
            className="sd-select" 
            value={formData.shiftTime}
            onChange={handleChange}
            disabled={formData.role !== 'Staff'}
          >
            <option value="">-- No Shift Assigned --</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>

        <div className="sd-form-group full">
          <label className="sd-label">Profile Photo URL (Optional)</label>
          <input 
            name="profilePhoto"
            type="url" 
            className="sd-input" 
            value={formData.profilePhoto}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">Change Password</label>
          <input 
            name="password"
            type="password" 
            className="sd-input" 
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />
        </div>

        {/* Read-Only Information Section */}
        <div className="sd-form-group full" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--sd-border-color)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--sd-text-color)' }}>Account Details (Read-Only)</h4>
        </div>

        <div className="sd-form-group">
          <label className="sd-label">Email Address</label>
          <input 
            type="email" 
            className="sd-input" 
            value={formData.email}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">Role</label>
          <input 
            type="text" 
            className="sd-input" 
            value={formData.role}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>
        
        <div className="sd-form-group">
          <label className="sd-label">Assigned Shop</label>
          <input 
            type="text" 
            className="sd-input" 
            value={formData.shopName}
            disabled
            style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
          />
        </div>

        <div className="sd-btn-group full" style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
          <button type="submit" disabled={isSubmitting} className="sd-btn sd-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
