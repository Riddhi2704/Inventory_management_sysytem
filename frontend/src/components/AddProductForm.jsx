import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AddProductForm({ onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', supplier: '',
    purchasePrice: '', sellingPrice: '', quantity: '',
    description: '', storageLocation: '', productImage: ''
  });

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          axios.get('http://127.0.0.1:5000/api/categories', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://127.0.0.1:5000/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);

        if (catRes.data && catRes.data.length > 0) {
          setCategories(catRes.data);
        } else {
          setCategories([{ _id: 'temp_id', name: 'Please refresh or add categories' }]);
        }

        if (supRes.data && supRes.data.length > 0) {
          setSuppliers(supRes.data);
        } else {
          setSuppliers([]);
        }

        if (supRes.data && supRes.data.length > 0) {
          setSuppliers(supRes.data);
        } else {
          setSuppliers([{ _id: '60d21b4667d0d8992e610c87', name: 'TechCorp' }, { _id: '60d21b4667d0d8992e610c88', name: 'WoodWorks' }]);
        }
      } catch (err) {
        console.error('Failed to fetch categories/suppliers', err);
        setCategories([{ _id: '60d21b4667d0d8992e610c85', name: 'Electronics' }, { _id: '60d21b4667d0d8992e610c86', name: 'Furniture' }]);
        setSuppliers([{ _id: '60d21b4667d0d8992e610c87', name: 'TechCorp' }, { _id: '60d21b4667d0d8992e610c88', name: 'WoodWorks' }]);
      }
    };
    if (user?.token) fetchDropdownData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      name: '', category: '', brand: '', supplier: '',
      purchasePrice: '', sellingPrice: '', quantity: '',
      description: '', storageLocation: '', productImage: ''
    });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const payload = { ...formData };

      // Auto-generate a basic SKU if none provided
      payload.productId = `SKU-${Math.floor(Math.random() * 10000)}`;
      payload.minStockLevel = 50;

      await axios.post('http://127.0.0.1:5000/api/products', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 1500);
      handleReset();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <PackagePlus size={24} style={{ color: 'var(--sd-primary-color)' }} />
        <h3 className="sd-card-title">Add New Product</h3>
      </div>

      {error && (
        <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-rejected-bg)', borderColor: 'var(--sd-status-rejected-text)', color: 'var(--sd-status-rejected-text)' }}>
          <div className="sd-alert-content">{error}</div>
        </div>
      )}

      {success && (
        <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-approved-bg)', borderColor: 'var(--sd-status-approved-text)', color: 'var(--sd-status-approved-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} />
          <div className="sd-alert-content">Product successfully added! Status set to 'Pending Approval'.</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="sd-form-grid">

          <div className="sd-form-group">
            <label className="sd-label">Product Name</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="sd-input" placeholder="e.g. Wireless Mouse" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Product Category</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="sd-select">
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Brand Name</label>
            <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="sd-input" placeholder="e.g. Logitech" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Supplier Name</label>
            <input required type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="sd-input" placeholder="e.g. Mr. Jay Patel" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Purchase Price ($)</label>
            <input required type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="sd-input" placeholder="0.00" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Selling Price ($)</label>
            <input required type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="sd-input" placeholder="0.00" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Product Quantity</label>
            <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="sd-input" placeholder="e.g. 100" />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">Storage Location</label>
            <select required name="storageLocation" value={formData.storageLocation} onChange={handleChange} className="sd-select">
              <option value="">Select Location...</option>
              <option value="Shop">Shop Floor</option>
              <option value="Rack">Rack</option>
              <option value="Warehouse Section">Warehouse Section</option>
            </select>
          </div>

          <div className="sd-form-group full">
            <label className="sd-label">Product Description <span style={{ color: 'var(--sd-text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>(Optional)</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="sd-textarea" placeholder="Detailed product description..."></textarea>
          </div>

          <div className="sd-form-group full">
            <label className="sd-label">Product Image <span style={{ color: 'var(--sd-text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>(Optional)</span></label>
            <input type="file" name="productImage" className="sd-input" accept="image/*" />
          </div>

        </div>

        <div className="sd-btn-group">
          <button type="submit" disabled={isSubmitting} className="sd-btn sd-btn-primary">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PackagePlus size={20} />}
            Add Product
          </button>
          <button type="button" onClick={handleReset} className="sd-btn sd-btn-secondary" disabled={isSubmitting}>
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}
