import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, ScanLine, Loader2, Info } from 'lucide-react';
import textData from '../constants/textData';

export default function MovementTracker({ prefillProduct }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    quantityMoved: '',
    reason: 'Restock',
    fromLocation: '',
    toLocation: ''
  });

  const REASONS = ['Restock', 'Sent Out', 'Store display', 'Damage', 'Return', 'Used', 'Sale', 'Found'];

  // Debounced search for products
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log("Movement Search check:", { searchTerm, hasSelected: !!selectedProduct }); // DEBUG
      // Don't search if we already have a selected product or search term is empty
      if (searchTerm.length >= 1 && !selectedProduct) {
        searchProducts();
      } else if (searchTerm.length < 1) {
        setProducts([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedProduct]);

  // Handle pre-filled product from props (e.g. from Barcode Scanner)
  useEffect(() => {
    if (prefillProduct && (!selectedProduct || selectedProduct._id !== prefillProduct._id)) {
      handleSelectProduct(prefillProduct);
    }
  }, [prefillProduct]);

  const searchProducts = async () => {
    if (!user?.token) {
      console.error("Search aborted: No user token found");
      return;
    }
    console.log("Fetching products for:", searchTerm); // DEBUG
    try {
      const res = await axios.get(`http://localhost:5001/api/products?search=${searchTerm.trim()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log("Search results received:", res.data.length, res.data); // DEBUG
      setProducts(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed: ' + (err.response?.data?.message || err.message));
      setProducts([]);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setProducts([]);
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    setSuccess('');
    setError('');
    setFormData({ quantityMoved: '', reason: 'Restock', fromLocation: '', toLocation: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        productId: selectedProduct._id,
        quantityMoved: parseInt(formData.quantityMoved),
        reason: formData.reason,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation
      };

      const res = await axios.post('http://localhost:5001/api/logs/movement', payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setSuccess(`${textData.movementTracker.success} ${res.data.updatedQuantity}`);

      // Update local selected product quantity to reflect change
      setSelectedProduct({
        ...selectedProduct,
        quantity: res.data.updatedQuantity
      });

      setFormData({ ...formData, quantityMoved: '' });

    } catch (err) {
      setError(err.response?.data?.message || textData.movementTracker.errorUpdate);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sd-card">

      <div className="sd-card-header">
        <ScanLine size={24} style={{ color: 'var(--sd-primary-color)' }} />
        <h3 className="sd-card-title">{textData.movementTracker.title}</h3>
      </div>
      <p style={{ color: 'var(--sd-text-muted)', marginBottom: '2rem' }}>{textData.movementTracker.subtitle}</p>

      <div className="sd-form-grid" style={{ alignItems: 'flex-start' }}>

        {/* Left Column - Product Search & Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <label className="sd-label" style={{ display: 'block', marginBottom: '0.5rem' }}>{textData.movementTracker.searchLabel}</label>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--sd-text-muted)' }} />
                <input
                  type="text"
                  className="sd-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder={textData.movementTracker.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    console.log("Search input change:", e.target.value); // DEBUG
                    setSearchTerm(e.target.value);
                    if (selectedProduct) setSelectedProduct(null);
                  }}
                />
                <button 
                  type="button"
                  onClick={() => { console.log("Manual search triggered"); searchProducts(); }}
                  style={{ position: 'absolute', right: selectedProduct ? '60px' : '10px', top: '50%', transform: 'translateY(-50%)', background: 'var(--sd-primary-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  {textData.movementTracker.searchButton}
                </button>
                {selectedProduct && (
                  <button type="button" onClick={handleClearSelection} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--sd-text-muted)', cursor: 'pointer' }}>
                    {textData.movementTracker.clearButton}
                  </button>
                )}
              </div>

            {/* Search Results Dropdown */}
            {searchTerm.length >= 1 && !selectedProduct && (
              <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--sd-bg-card)', border: '1px solid var(--sd-border-color)', borderRadius: '8px', boxShadow: 'var(--sd-shadow-md)', maxHeight: '240px', overflowY: 'auto' }}>
                {products.length > 0 ? (
                  products.map(p => (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProduct(p)}
                      style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--sd-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {p.name} {p.brand ? <span style={{ fontWeight: 'normal', fontSize: '0.85em', color: 'var(--sd-text-muted)' }}>({p.brand})</span> : ''}
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: p.status === 'Active' ? '#dcfce7' : '#fef9c3', color: p.status === 'Active' ? '#166534' : '#854d0e', fontWeight: '700', textTransform: 'uppercase' }}>
                            {p.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>SKU: {p.productId}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--sd-primary-color)' }}>Qty: {p.quantity} {p.unitType || 'pcs'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>{p.location || 'No location'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--sd-text-muted)' }}>
                    {textData.movementTracker.noProducts} "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedProduct ? (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ fontWeight: '700', fontSize: '1.125rem', color: '#1e3a8a', margin: '0 0 0.25rem 0' }}>{selectedProduct.name} {selectedProduct.brand ? `(${selectedProduct.brand})` : ''}</h3>
              <p style={{ fontFamily: 'monospace', color: '#2563eb', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>SKU: {selectedProduct.productId}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#60a5fa', textTransform: 'uppercase' }}>{textData.movementTracker.currentStock}</span>
                  <div style={{ fontWeight: '700', fontSize: '1.5rem', color: '#1d4ed8' }}>{selectedProduct.quantity} {selectedProduct.unitType || 'pcs'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#60a5fa', textTransform: 'uppercase' }}>{textData.movementTracker.location}</span>
                  <div style={{ fontWeight: '500', color: '#1d4ed8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={16} /> {selectedProduct.location || textData.movementTracker.unassigned}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ border: '2px dashed var(--sd-border-color)', borderRadius: '12px', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--sd-text-muted)', textAlign: 'center', backgroundColor: '#fafafb' }}>
              <ScanLine size={48} style={{ marginBottom: '1rem', color: '#d1d5db' }} strokeWidth={1} />
              <p style={{ margin: 0 }}>{textData.movementTracker.emptyState}</p>
            </div>
          )}
        </div>

        {/* Right Column - Action Form */}
        <div style={{ opacity: selectedProduct ? 1 : 0.5, pointerEvents: selectedProduct ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {error && <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-rejected-bg)', borderColor: 'var(--sd-status-rejected-text)', color: 'var(--sd-status-rejected-text)', margin: 0 }}><div className="sd-alert-content">{error}</div></div>}
            {success && <div className="sd-alert-card" style={{ backgroundColor: 'var(--sd-status-approved-bg)', borderColor: 'var(--sd-status-approved-text)', color: 'var(--sd-status-approved-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Info size={16} /> <div className="sd-alert-content">{success}</div></div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="sd-form-group">
                <label className="sd-label">{textData.movementTracker.quantityLabel}</label>
                <input
                  type="number"
                  name="quantityMoved"
                  required
                  min="1"
                  value={formData.quantityMoved}
                  onChange={handleChange}
                  className="sd-input"
                  placeholder="e.g. 5"
                />
              </div>
              <div className="sd-form-group">
                <label className="sd-label">{textData.movementTracker.reasonLabel}</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="sd-select"
                >
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#fafafb', borderRadius: '12px', border: '1px solid var(--sd-border-color)' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                {textData.movementTracker.infoText}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="sd-form-group">
                  <label className="sd-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{textData.movementTracker.fromLocation}</label>
                  <input type="text" name="fromLocation" value={formData.fromLocation} onChange={handleChange} className="sd-input" placeholder={textData.movementTracker.optional} />
                </div>
                <div className="sd-form-group">
                  <label className="sd-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{textData.movementTracker.toLocation}</label>
                  <input type="text" name="toLocation" value={formData.toLocation} onChange={handleChange} className="sd-input" placeholder={textData.movementTracker.optional} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedProduct}
              className="sd-btn sd-btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : textData.movementTracker.confirmButton}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
