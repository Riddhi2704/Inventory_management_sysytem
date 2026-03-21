import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Plus, Loader2, Trash2, 
  Search, Edit, AlertCircle, CheckCircle2 
} from 'lucide-react';
import textData from '../constants/textData';
import './CategorySupplierManager.css';

export default function CategorySupplierManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'suppliers'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Generic form state
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(null); // { id: string, type: 'categories' | 'suppliers' }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, type: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, supRes] = await Promise.all([
        axios.get('http://localhost:5001/api/categories', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5001/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
      setError(textData.categorySupplier.errors.load);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user?.token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const isCat = activeTab === 'categories';
      const endpoint = isCat ? '/api/categories' : '/api/suppliers';
      
      // Phone validation for suppliers
      if (!isCat && formData.phone) {
        const phoneDigits = formData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          setError("Phone number must be exactly 10 digits");
          setIsSubmitting(false);
          return;
        }
      }
      
      if (isEditing) {
        await axios.put(`http://localhost:5001${endpoint}/${isEditing.id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        showToast("Updated successfully");
      } else {
        await axios.post(`http://localhost:5001${endpoint}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        showToast(isCat ? textData.categorySupplier.success.categoryCreated : textData.categorySupplier.success.supplierCreated);
      }
      
      setFormData({});
      setIsEditing(null);
      fetchData(); // Refresh lists
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item, type) => {
    setIsEditing({ id: item._id, type });
    setFormData(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setFormData({});
  };

  const handleDeleteClick = (id, type) => {
    setDeleteModal({ show: true, id, type });
  };

  const confirmDelete = async () => {
    const { id, type } = deleteModal;
    try {
      const endpoint = type === 'categories' ? `/api/categories/${id}` : `/api/suppliers/${id}`;
      await axios.delete(`http://localhost:5001${endpoint}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showToast("Deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(textData.categorySupplier.errors.deleteFail);
    } finally {
      setDeleteModal({ show: false, id: null, type: null });
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter((s, index, self) => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
    self.findIndex(t => t.name.toLowerCase() === s.name.toLowerCase()) === index
  );

  return (
    <div className="cs-manager-container animate-fade">
      {/* Header with Tabs */}
      <div className="cs-header">
        <h2 className="cs-title">{textData.categorySupplier.manageTitle}</h2>
        <div className="cs-tabs">
          <button 
            onClick={() => { setActiveTab('categories'); setFormData({}); setIsEditing(null); setError(''); setSearchTerm(''); }}
            className={`cs-tab ${activeTab === 'categories' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} /> {textData.categorySupplier.tabs.categories}
          </button>
          <button 
            onClick={() => { setActiveTab('suppliers'); setFormData({}); setIsEditing(null); setError(''); setSearchTerm(''); }}
            className={`cs-tab ${activeTab === 'suppliers' ? 'active' : ''}`}
          >
            <Users size={18} /> {textData.categorySupplier.tabs.suppliers}
          </button>
        </div>
      </div>

      <div className="cs-content-grid">
        {/* Form Card */}
        <div className="cs-card h-fit">
          <div className="cs-card-title">
            {isEditing ? <Edit size={20} color="#4f46e5" /> : <Plus size={20} color="#4f46e5" />}
            {isEditing ? (activeTab === 'categories' ? "Edit Category" : "Edit Supplier") : (activeTab === 'categories' ? textData.categorySupplier.form.addCategory : textData.categorySupplier.form.addSupplier)}
          </div>
          <p className="cs-card-subtitle">
            {isEditing ? "Update existing information in the database" : (activeTab === 'categories' ? textData.categorySupplier.form.categorySubtitle : "Add a new vendor to your database")}
          </p>
          
          {error && (
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="cs-form-group">
              <label className="cs-label">
                {activeTab === 'categories' ? textData.categorySupplier.form.name : textData.categorySupplier.form.supplierName}
              </label>
              <input 
                required 
                name="name" 
                value={formData.name || ''} 
                onChange={handleInputChange} 
                className="cs-input" 
                placeholder={activeTab === 'categories' ? textData.categorySupplier.form.placeholders.categoryName : textData.categorySupplier.form.placeholders.supplierName}
              />
            </div>

            {activeTab === 'categories' ? (
              <div className="cs-form-group">
                <label className="cs-label">{textData.categorySupplier.form.description}</label>
                <textarea 
                  name="description" 
                  value={formData.description || ''} 
                  onChange={handleInputChange} 
                  className="cs-textarea" 
                  placeholder={textData.categorySupplier.form.placeholders.description}
                />
              </div>
            ) : (
              <>
                <div className="cs-form-group">
                  <label className="cs-label">{textData.categorySupplier.form.email}</label>
                  <input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="cs-input" placeholder={textData.categorySupplier.form.placeholders.email}/>
                </div>
                <div className="cs-form-group">
                  <label className="cs-label">{textData.categorySupplier.form.phone}</label>
                  <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="cs-input" placeholder={textData.categorySupplier.form.placeholders.phone}/>
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="cs-btn-primary">
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? "Update" : (activeTab === 'categories' ? textData.categorySupplier.form.buttons.create : textData.categorySupplier.form.buttons.createSupplier))}
            </button>
            
            {isEditing && (
              <button type="button" onClick={handleCancelEdit} className="cs-btn-secondary" style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        {/* List Section */}
        <div className="cs-list-section">
          <div className="cs-search-container">
            <Search className="cs-search-icon" size={18} />
            <input 
              type="text" 
              className="cs-search-input" 
              placeholder={`Search ${activeTab}...`} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="cs-table-container">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>{textData.categorySupplier.table.name}</th>
                  {activeTab === 'categories' ? (
                    <th>{textData.categorySupplier.table.description}</th>
                  ) : (
                    <th>{textData.categorySupplier.table.contactInfo}</th>
                  )}
                  <th style={{ textAlign: 'right' }}>{textData.categorySupplier.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '48px' }}><Loader2 className="animate-spin mx-auto" size={24} /></td></tr>
                ) : activeTab === 'categories' ? (
                  filteredCategories.length === 0 ? <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>{textData.categorySupplier.table.noCategories}</td></tr> :
                  filteredCategories.map(c => (
                    <tr key={c._id}>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td>{c.description || '-'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => handleEditClick(c, 'categories')} className="cs-action-btn cs-btn-edit"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteClick(c._id, 'categories')} className="cs-action-btn cs-btn-delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredSuppliers.length === 0 ? <tr><td colSpan="3" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>{textData.categorySupplier.table.noSuppliers}</td></tr> :
                  filteredSuppliers.map(s => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ fontSize: '0.8125rem', lineHeight: '1.4' }}>
                        {(s.email || s.phone || s.address) ? (
                          <>
                            {s.email && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Email:</span>
                                <span style={{ color: '#4f46e5' }}>{s.email}</span>
                              </div>
                            )}
                            {s.phone && (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Phone:</span>
                                <span style={{ color: '#1e293b' }}>{s.phone}</span>
                              </div>
                            )}
                            {s.address && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                <span style={{ color: '#64748b', fontWeight: 500 }}>Addr:</span>
                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.address}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No contact info provided</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => handleEditClick(s, 'suppliers')} className="cs-action-btn cs-btn-edit"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteClick(s._id, 'suppliers')} className="cs-action-btn cs-btn-delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="cs-toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="cs-modal-overlay">
          <div className="cs-modal">
            <div style={{ backgroundColor: '#fee2e2', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: '#ef4444' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Are you sure?</h3>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
              {textData.categorySupplier.errors.deleteConfirm}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setDeleteModal({ show: false, id: null, type: null })}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
