import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import './Register.css';

export default function Register() {
  const [role, setRole] = useState('Admin'); // 'Admin', 'Manager', 'Staff'
  const [formData, setFormData] = useState({
    fullName: '', gender: 'Male', dob: '', mobileNumber: '', email: '',
    address: '', city: '', state: '', pincode: '', password: '', confirmPassword: '',
    profilePhoto: '', shopName: '',
    // Admin specific
    adminId: '', adminEducation: '', adminJoiningDate: '',
    // Manager specific
    managerId: '', department: 'Inventory Management', managerEducation: '', experienceYears: '', managerJoiningDate: '',
    // Staff specific
    staffId: '', shiftTime: 'Morning', staffJoiningDate: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Generate IDs correctly when role mounts/changes
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toISOString().split('T')[0];

    setFormData(prev => ({
      ...prev,
      adminId: `ADM-${randomNum}`,
      managerId: `MGR-${randomNum}`,
      staffId: `STF-${randomNum}`,
      adminJoiningDate: prev.adminJoiningDate || today,
      managerJoiningDate: prev.managerJoiningDate || today,
      staffJoiningDate: prev.staffJoiningDate || today
    }));
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, %, &, !, *, ?).');
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = { ...formData, role };

      // Clean up fields based on chosen role just in case backend enforces strict properties
      if (role !== 'Admin') {
        delete dataToSubmit.adminId;
        delete dataToSubmit.adminEducation;
        delete dataToSubmit.adminJoiningDate;
      }
      if (role !== 'Manager') {
        delete dataToSubmit.managerId;
        delete dataToSubmit.department;
        delete dataToSubmit.managerEducation;
        delete dataToSubmit.experienceYears;
        delete dataToSubmit.managerJoiningDate;
      }
      if (role !== 'Staff') {
        delete dataToSubmit.staffId;
        delete dataToSubmit.shiftTime;
        delete dataToSubmit.staffJoiningDate;
      }

      // Map matching payload if needed for the backend
      // Assuming backend expects "education" "joiningDate" instead of prefixed ones, let's normalize
      if (role === 'Admin') {
        dataToSubmit.education = dataToSubmit.adminEducation;
        dataToSubmit.joiningDate = dataToSubmit.adminJoiningDate;
      } else if (role === 'Manager') {
        dataToSubmit.education = dataToSubmit.managerEducation;
        dataToSubmit.joiningDate = dataToSubmit.managerJoiningDate;
      } else if (role === 'Staff') {
        dataToSubmit.joiningDate = dataToSubmit.staffJoiningDate;
      }

      const user = await register(dataToSubmit);

      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Manager') navigate('/manager');
      else if (user.role === 'Staff') navigate('/staff');
      else navigate('/');

    } catch (err) {
      setError(err.message || err.toString() || 'Failed to register account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        <div className="register-header">
          <h2 className="register-title">Inventory Management System Registration</h2>
          <p className="register-subtitle">Register to create a new account</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">

          {/* Step 1: Role Selection */}
          <div className="form-group full-width">
            <h3 className="section-title">Step 1 — Role Selection</h3>
            <label>Select Role</label>
            <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
              <option value="Admin">Admin</option>
              <option value="Manager">Inventory Manager</option>
              <option value="Staff">Inventory Staff</option>
            </select>
          </div>

          <h3 className="section-title" style={{ marginTop: '0.5rem' }}>Common Details</h3>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Full Name</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" placeholder="John Doe" />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" />
            </div>

            <div className="form-group">
              <label>Shop Name</label>
              <input required name="shopName" value={formData.shopName} onChange={handleChange} className="input-field" placeholder="e.g. Ahmedabad Mobile Store" />
            </div>

            <div className="form-group">
              <label>Mobile Number</label>
              <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="input-field" placeholder="+1234567890" />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="john@example.com" />
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <input required name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="123 Main St" />
            </div>

            <div className="form-group">
              <label>City</label>
              <input required name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="City" />
            </div>

            <div className="form-group">
              <label>State</label>
              <input required name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="State" />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input required name="pincode" value={formData.pincode} onChange={handleChange} className="input-field" placeholder="ZIP Code" />
            </div>

            <div className="form-group full-width">
              <label>Profile Photo (Optional)</label>
              <div className="file-input-wrapper">
                <input type="file" name="profilePhoto" className="input-field" accept="image/*" />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="input-field" placeholder="••••••••" />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="••••••••" />
            </div>
          </div>

          {/* Role Specific Fields */}
          <h3 className="section-title" style={{ marginTop: '0.5rem' }}>Role Specific Fields</h3>

          <div className="form-row">
            {role === 'Admin' && (
              <>
                <div className="form-group">
                  <label>Admin ID (Auto Generated)</label>
                  <input readOnly name="adminId" value={formData.adminId} className="input-field" disabled />
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input required type="date" name="adminJoiningDate" value={formData.adminJoiningDate} onChange={handleChange} className="input-field" />
                </div>
                <div className="form-group full-width">
                  <label>Education</label>
                  <input required name="adminEducation" value={formData.adminEducation} onChange={handleChange} className="input-field" placeholder="Degree / Certification" />
                </div>
              </>
            )}

            {role === 'Manager' && (
              <>
                <div className="form-group">
                  <label>Manager ID (Auto Generated)</label>
                  <input readOnly name="managerId" value={formData.managerId} className="input-field" disabled />
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input required type="date" name="managerJoiningDate" value={formData.managerJoiningDate} onChange={handleChange} className="input-field" />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="input-field">
                    <option value="Inventory Management">Inventory Management</option>
                    <option value="Product Management">Product Management</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="input-field" placeholder="e.g. 5" />
                </div>
                <div className="form-group full-width">
                  <label>Education</label>
                  <input required name="managerEducation" value={formData.managerEducation} onChange={handleChange} className="input-field" placeholder="Degree / Certification" />
                </div>
              </>
            )}

            {role === 'Staff' && (
              <>
                <div className="form-group">
                  <label>Staff ID (Auto Generated)</label>
                  <input readOnly name="staffId" value={formData.staffId} className="input-field" disabled />
                </div>
                <div className="form-group">
                  <label>Joining Date</label>
                  <input required type="date" name="staffJoiningDate" value={formData.staffJoiningDate} onChange={handleChange} className="input-field" />
                </div>
                <div className="form-group full-width">
                  <label>Shift Time</label>
                  <select name="shiftTime" value={formData.shiftTime} onChange={handleChange} className="input-field">
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="register-error" style={{ marginBottom: '-0.5rem' }}>
              <AlertCircle size={18} className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="register-submit-btn"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="register-footer">
          Already have an account?{' '}
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
