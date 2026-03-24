import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Search, Edit2, Trash2, Shield, UserCheck, Mail } from 'lucide-react';

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ fullName: '', email: '', role: 'Staff', shopName: '', password: '' });

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/admin/users', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user.token]);

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(`http://localhost:5001/api/admin/users/${editingUser._id}`, formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            } else {
                await axios.post('http://localhost:5001/api/admin/users', formData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ fullName: '', email: '', role: 'Staff', shopName: '', password: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save user");
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="ap-fade-in">
            <div className="ap-page-header">
                <h1 className="ap-page-title">User Management</h1>
                <p className="ap-page-subtitle">Manage system access for Admins, Managers, and Staff.</p>
            </div>

            <div className="ap-filter-bar">
                <div className="ap-search-wrap" style={{ flex: 1, maxWidth: '400px' }}>
                    <Search className="ap-search-icon" size={16} />
                    <input 
                        className="ap-search-input" 
                        placeholder="Search users..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="ap-btn ap-btn-primary" onClick={() => { setEditingUser(null); setFormData({ fullName: '', email: '', role: 'Staff', shopName: '', password: '' }); setShowModal(true); }}>
                    <UserPlus size={18} />
                    Add New User
                </button>
            </div>

            <div className="ap-card ap-table-wrap">
                <table className="ap-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Shop</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="ap-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                                            {u.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--ap-text-light)' }}>{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`ap-badge ${u.role === 'Admin' ? 'ap-badge-purple' : u.role === 'Manager' ? 'ap-badge-blue' : 'ap-badge-gray'}`}>
                                        <Shield size={12} /> {u.role}
                                    </span>
                                </td>
                                <td>{u.shopName || 'N/A'}</td>
                                <td>
                                    <span className="ap-badge ap-badge-green">
                                        <UserCheck size={12} /> Active
                                    </span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="ap-icon-btn" onClick={() => { setEditingUser(u); setFormData({ ...u, password: '' }); setShowModal(true); }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="ap-icon-btn" onClick={() => handleDeleteUser(u._id)} style={{ color: 'var(--ap-danger)' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="ap-modal-overlay">
                    <div className="ap-modal">
                        <div className="ap-modal-header">
                            <h3 className="ap-modal-title">{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="ap-modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveUser}>
                            <div className="ap-modal-body ap-form-grid">
                                <div className="ap-form-group full">
                                    <label className="ap-label">Full Name</label>
                                    <input className="ap-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-label">Email</label>
                                    <input className="ap-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-label">Role</label>
                                    <select className="ap-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Staff">Staff</option>
                                    </select>
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-label">Shop Name (for Managers/Staff)</label>
                                    <input className="ap-input" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
                                </div>
                                <div className="ap-form-group">
                                    <label className="ap-label">Password {editingUser && '(Leave blank to keep current)'}</label>
                                    <input className="ap-input" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingUser} />
                                </div>
                            </div>
                            <div className="ap-modal-footer">
                                <button type="button" className="ap-btn ap-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="ap-btn ap-btn-primary">Save User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
