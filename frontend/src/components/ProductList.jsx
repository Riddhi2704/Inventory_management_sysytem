import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, Search, Loader2, Package, X } from 'lucide-react';
import textData from '../constants/textData';
import './ProductManagement.css';

const API = 'http://localhost:5001/api';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [user]);

  const fetchProducts = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/products`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('[ProductList] Data loaded:', res.data);
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data?.products) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchProducts();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product, category: product.category?._id || product.category });
    setEditError('');
    setShowEditModal(true);
  };

  const onUpdateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/products/${selectedProduct._id}`, editForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.status !== 'Rejected' && 
      (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.productId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirst, indexOfLast);

  return (
    <div className="pl-container" style={{ padding: '1rem' }}>
      <div className="pl-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{textData.productList.title}</h2>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={textData.productList.searchPlaceholder} 
            className="pm-input" 
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="pm-table-card">
        <div className="pm-table-container">
          <table className="pm-table">
            <thead>
              <tr>
                <th>{textData.productList.table.img}</th>
                <th>{textData.productList.table.sku}</th>
                <th>{textData.productList.table.name}</th>
                {user?.role !== 'Staff' && <th>Organization Name</th>}
                <th>{textData.productList.table.category}</th>
                <th>{textData.productList.table.brand}</th>
                <th>{textData.productList.table.qty}</th>
                <th>{textData.productList.table.price}</th>
                <th>{textData.productList.table.status}</th>
                {user?.role !== 'Admin' && <th>{textData.productList.table.actions}</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={user?.role !== 'Staff' ? 10 : 9} style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={user?.role !== 'Staff' ? 10 : 9} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No products found.</td></tr>
              ) : currentItems.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.productImage ? <img src={p.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <Package size={18} color="#94a3b8" />}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.productId}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  {user?.role !== 'Staff' && <td>{p.shopName || 'N/A'}</td>}
                  <td>{p.category?.name || 'N/A'}</td>
                  <td>{p.brand || 'N/A'}</td>
                  <td>{p.quantity} {p.unitType || 'pcs'}</td>
                  <td>₹{p.sellingPrice?.toLocaleString()}</td>
                  <td>
                    <span className={`pm-badge ${p.status === 'Active' ? 'pm-badge-active' : 'pm-badge-low'}`}>
                      {p.status}
                    </span>
                  </td>
                  {user?.role !== 'Admin' && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEdit(p)} title="Edit" style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#6366f1' }}><Pencil size={16} /></button>
                        <button onClick={() => handleDelete(p._id)} title="Delete" style={{ background: '#f1f5f9', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && filteredProducts.length > 0 && (
          <div className="pl-pagination-wrapper">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pl-pagination-btn"
            >
              Previous
            </button>
            
            <div className="pl-pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`pl-pagination-number ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pl-pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{textData.productList.editModal.title}</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none' }}><X size={20} /></button>
            </div>
            {editError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {editError}
              </div>
            )}
            <form onSubmit={onUpdateProduct}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Product Name</label>
                <input className="pm-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>Category</label>
                <select className="pm-select" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b' }}>{textData.productList.editModal.brand}</label>
                <input className="pm-input" value={editForm.brand || ''} onChange={e => setEditForm({ ...editForm, brand: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b' }}>{textData.productList.editModal.qty}</label>
                  <input type="number" className="pm-input" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b' }}>{textData.productList.editModal.price}</label>
                  <input type="number" className="pm-input" value={editForm.sellingPrice} onChange={e => setEditForm({ ...editForm, sellingPrice: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="sd-btn sd-btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
