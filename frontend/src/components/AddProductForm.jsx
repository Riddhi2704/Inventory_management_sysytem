import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PackagePlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import textData from '../constants/textData';

export default function AddProductForm({ onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', supplier: '',
    purchasePrice: '', sellingPrice: '', quantity: '', unitType: 'pcs',
    description: '', storageLocation: '', productImage: ''
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const catRes = await axios.get('http://localhost:5001/api/categories', { 
          headers: { Authorization: `Bearer ${user.token}` } 
        });

        if (catRes.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to fetch categories', err);
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
      purchasePrice: '', sellingPrice: '', quantity: '', unitType: 'pcs',
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
      const payload = { 
        ...formData,
        name: formData.name.trim(),
        brand: formData.brand.trim()
      };

      // Auto-generate a basic SKU if none provided
      payload.productId = `SKU-${Math.floor(Math.random() * 10000)}`;
      payload.minStockLevel = 50;

      await axios.post('http://localhost:5001/api/products', payload, {
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
        <h3 className="sd-card-title">{textData.addProduct.title}</h3>
      </div>

      {error && (
        <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-rejected-bg)', borderColor: 'var(--sd-status-rejected-text)', color: 'var(--sd-status-rejected-text)' }}>
          <div className="sd-alert-content">{error}</div>
        </div>
      )}

      {success && (
        <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-approved-bg)', borderColor: 'var(--sd-status-approved-text)', color: 'var(--sd-status-approved-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={20} />
          <div className="sd-alert-content">{textData.addProduct.success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="sd-form-grid">

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.name}</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.name} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.category}</label>
            <select required name="category" value={formData.category} onChange={handleChange} className="sd-select">
              <option value="">{textData.addProduct.placeholders.category}</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.brand}</label>
            <input required type="text" name="brand" value={formData.brand} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.brand} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.supplier}</label>
            <input required type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.supplier} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.purchasePrice}</label>
            <input required type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.price} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.sellingPrice}</label>
            <input required type="number" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.price} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.quantity}</label>
            <input required type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="sd-input" placeholder={textData.addProduct.placeholders.quantity} />
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.unitType}</label>
            <select required name="unitType" value={formData.unitType} onChange={handleChange} className="sd-select">
              <option value="pcs">Pieces (pcs)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="gm">Gram (gm)</option>
              <option value="L">Liter (L)</option>
              <option value="Meter">Meter</option>
              <option value="Box">Box</option>
              <option value="Packet">Packet</option>
            </select>
          </div>

          <div className="sd-form-group">
            <label className="sd-label">{textData.addProduct.form.location}</label>
            <select required name="storageLocation" value={formData.storageLocation} onChange={handleChange} className="sd-select">
              <option value="">{textData.addProduct.placeholders.location}</option>
              <option value="Shop">Shop Floor</option>
              <option value="Rack">Rack</option>
              <option value="Warehouse Section">Warehouse Section</option>
            </select>
          </div>

          <div className="sd-form-group full">
            <label className="sd-label">{textData.addProduct.form.description} <span style={{ color: 'var(--sd-text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>{textData.addProduct.form.optional}</span></label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="sd-textarea" placeholder={textData.addProduct.placeholders.description}></textarea>
          </div>

          <div className="sd-form-group full">
            <label className="sd-label">{textData.addProduct.form.image} <span style={{ color: 'var(--sd-text-muted)', fontSize: '0.85em', fontWeight: 'normal' }}>{textData.addProduct.form.optional}</span></label>
            <input type="file" name="productImage" className="sd-input" accept="image/*" />
          </div>

        </div>

        <div className="sd-btn-group">
          <button type="submit" disabled={isSubmitting} className="sd-btn sd-btn-primary">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PackagePlus size={20} />}
            {textData.addProduct.buttons.add}
          </button>
          <button type="button" onClick={handleReset} className="sd-btn sd-btn-secondary" disabled={isSubmitting}>
            {textData.addProduct.buttons.reset}
          </button>
        </div>
      </form>
    </div>
  );
}
