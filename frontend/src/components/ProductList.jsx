import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/categories', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    if (user?.token) fetchCategories();
  }, [user]);

  // Fetch Products based on Search/Filter
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = 'http://127.0.0.1:5000/api/products';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user, categoryFilter]); 

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const getStatusBadge = (status) => {
    if (status === 'Pending Approval') return <span className="sd-badge pending">Pending</span>;
    if (status === 'Approved' || status === 'Active') return <span className="sd-badge approved">Approved</span>;
    return <span className="sd-badge">{status}</span>;
  };

  return (
    <div className="sd-card" style={{ padding: 0, overflow: 'hidden' }}>

      {/* Header and Controls */}
      <div className="sd-card-header" style={{ margin: 0, padding: '1.5rem', borderBottom: '1px solid var(--sd-border-color)' }}>
        <h3 className="sd-card-title">Product List</h3>
      </div>

      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--sd-border-color)', backgroundColor: '#fafafb' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label className="sd-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Search Name</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--sd-text-muted)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sd-input"
                style={{ paddingLeft: '2.25rem', height: '36px' }}
                placeholder="Product name..."
              />
            </div>
          </div>

          <div style={{ minWidth: '180px' }}>
            <label className="sd-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Filter Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="sd-select"
              style={{ height: '36px' }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="sd-btn sd-btn-primary" style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} /> Search
          </button>
        </form>
      </div>

      {/* Table Area */}
      <div className="sd-table-container">
        <table className="sd-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Quantity Available</th>
              <th>Storage Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="animate-spin text-muted" size={32} style={{ margin: '0 auto 1rem' }} /> Loading inventory...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--sd-text-muted)' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--sd-text-muted)', fontSize: '0.8rem' }}>{product.productId}</td>
                  <td style={{ fontWeight: '500' }}>{product.name}</td>
                  <td>{typeof product.category === 'object' ? product.category?.name : (product.category || 'Uncategorized')}</td>
                  <td>{product.quantity}</td>
                  <td>{product.storageLocation}</td>
                  <td>{getStatusBadge(product.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Fake) */}
      <div style={{ padding: '0.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--sd-border-color)', backgroundColor: '#fff' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>Showing {products.length} entries</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="sd-btn sd-btn-secondary" disabled style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Prev</button>
          <button className="sd-btn sd-btn-secondary" disabled style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Next</button>
        </div>
      </div>

    </div>
  );
}
