import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Loader2, Pencil, X, Save, Trash2, 
  Eye, Package, AlertTriangle, TrendingDown, Layers, 
  ChevronLeft, ChevronRight, PlusCircle, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProductManagement.css';
import textData from '../constants/textData';

const API = 'http://localhost:5001/api';

export default function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalInventoryValue: 0
  });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(100);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [editForm, setEditForm] = useState({});
  const [stockUpdate, setStockUpdate] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editError, setEditError] = useState('');

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsRes = await axios.get(`${API}/products/stats`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(statsRes.data);

      // 2. Fetch Products with filtering
      const params = new URLSearchParams({
        page,
        limit,
        search: searchTerm,
        category: categoryFilter,
        supplier: supplierFilter,
        lowStock: statusFilter === 'Low Stock' ? 'true' : 'false',
        status: 'Active',
        paginate: 'true'
      });

      const productsRes = await axios.get(`${API}/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // Handle response based on structure
      if (productsRes.data.products) {
        setProducts(productsRes.data.products);
        setTotalPages(productsRes.data.pagination.pages);
      } else {
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
        setTotalPages(1);
      }

      // 3. Fetch Categories & Suppliers (if not loaded)
      if (categories.length === 0) {
        const catRes = await axios.get(`${API}/categories`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setCategories(catRes.data);
      }
      if (suppliers.length === 0) {
        const supRes = await axios.get(`${API}/suppliers`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setSuppliers(supRes.data);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, page, limit, searchTerm, categoryFilter, supplierFilter, statusFilter, categories.length, suppliers.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({ ...product, category: product.category?._id || product.category });
    setEditError('');
    setShowEditModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleStockUpdate = (product) => {
    setSelectedProduct(product);
    setStockUpdate(0);
    setShowStockModal(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await axios.delete(`${API}/products/${deleteConfirm._id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const onUpdateProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/products/${selectedProduct._id}`, editForm, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const onUpdateStock = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API}/products/${selectedProduct._id}/quantity`, { quantityAdded: stockUpdate }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowStockModal(false);
      fetchData();
    } catch (err) {
      alert('Stock update failed');
    } finally {
      setSaving(false);
    }
  };

  const getStockBadge = (product) => {
    if (product.quantity === 0) return <span className="pm-badge pm-badge-out">{textData.productManagement.badges.outOfStock}</span>;
    if (product.quantity <= product.minStockLevel) return <span className="pm-badge pm-badge-low">{textData.productManagement.badges.lowStock}</span>;
    return <span className="pm-badge pm-badge-active">{textData.productManagement.badges.inStock}</span>;
  };

  return (
    <div className="pm-container">
      {/* 1. Summary Cards */}
      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{background: '#e0e7ff', color: '#4338ca'}}>
            <Package size={24} />
          </div>
          <div className="pm-stat-info">
            <div className="pm-stat-label">{textData.productManagement.stats.total}</div>
            <div className="pm-stat-value">{stats.totalProducts}</div>
          </div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{background: '#fef3c7', color: '#b45309'}}>
            <AlertTriangle size={24} />
          </div>
          <div className="pm-stat-info">
            <div className="pm-stat-label">{textData.productManagement.stats.lowStock}</div>
            <div className="pm-stat-value">{stats.lowStock}</div>
          </div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{background: '#fee2e2', color: '#b91c1c'}}>
            <TrendingDown size={24} />
          </div>
          <div className="pm-stat-info">
            <div className="pm-stat-label">{textData.productManagement.stats.outOfStock}</div>
            <div className="pm-stat-value">{stats.outOfStock}</div>
          </div>
        </div>
        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{background: '#d1fae5', color: '#047857'}}>
            <LayoutGrid size={24} />
          </div>
          <div className="pm-stat-info">
            <div className="pm-stat-label">{textData.productManagement.stats.value}</div>
            <div className="pm-stat-value">₹{stats.totalInventoryValue?.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 2. Refined Search & Category Filter Row */}
      <div className="pm-search-filter-row">
        <div className="pm-search-box">
          <Search size={18} className="pm-search-icon" />
          <input 
            className="pm-search-input" 
            placeholder={textData.productManagement.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pm-category-container">
          <label className="pm-category-label">{textData.productManagement.categoriesLabel}</label>
          <select className="pm-category-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">{textData.productManagement.allCategories}</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      {/* 3. Product Table */}
      <div className="pm-table-card">
        <div className="pm-table-container">
          <table className="pm-table">
            <thead>
              <tr>
                <th>{textData.productManagement.table.img}</th>
                <th>{textData.productManagement.table.sku}</th>
                <th>{textData.productManagement.table.name}</th>
                <th>{textData.productManagement.table.category}</th>
                <th>{textData.productManagement.table.brand}</th>
                <th>{textData.productManagement.table.supplier}</th>
                <th className="pm-price-cell">{textData.productManagement.table.buyPrice}</th>
                <th className="pm-price-cell">{textData.productManagement.table.sellPrice}</th>
                <th>{textData.productManagement.table.qty}</th>
                <th>{textData.productManagement.table.status}</th>
                <th style={{textAlign: 'center'}}>{textData.productManagement.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{textAlign: 'center', padding: '4rem'}}><Loader2 className="animate-spin" /></td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="10" style={{textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>{textData.productList.noProducts}</td></tr>
              ) : products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '4px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {p.productImage ? <img src={p.productImage} alt="" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'4px'}} /> : <Package size={18} color="#94a3b8" />}
                    </div>
                  </td>
                  <td style={{fontFamily: 'monospace', fontSize: '0.75rem'}}>{p.productId}</td>
                  <td className="pm-product-name">{p.name}</td>
                  <td>{p.category?.name || 'N/A'}</td>
                  <td>{p.brand || 'N/A'}</td>
                  <td>{p.supplier?.name || 'N/A'}</td>
                  <td className="pm-price-cell">₹{p.purchasePrice?.toLocaleString()}</td>
                  <td className="pm-price-cell">₹{p.sellingPrice?.toLocaleString()}</td>
                  <td>{p.quantity} {p.unitType || 'pcs'}</td>
                  <td>{getStockBadge(p)}</td>
                  <td>
                    <div className="pm-actions">
                      <button className="pm-action-btn pm-btn-view" title="View Details" onClick={() => handleView(p)}><Eye size={16}/></button>
                      <button className="pm-action-btn pm-btn-edit" title="Edit Product" onClick={() => handleEdit(p)}><Pencil size={16}/></button>
                      <button className="pm-action-btn pm-btn-stock" title="Update Stock" onClick={() => handleStockUpdate(p)}><PlusCircle size={16}/></button>
                      <button className="pm-action-btn pm-btn-delete" title="Delete Product" onClick={() => setDeleteConfirm(p)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination */}
        <div className="pm-pagination">
          <span style={{fontSize: '0.875rem', color: '#64748b'}}>{textData.productManagement.pagination.page} {page} {textData.productManagement.pagination.of} {totalPages}</span>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button className="pm-btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={16} /> {textData.productManagement.pagination.prev}
            </button>
            <button className="pm-btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              {textData.productManagement.pagination.next} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showEditModal && selectedProduct && (
         <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem'}}>
            <div style={{background:'white', width:'100%', maxWidth:'600px', borderRadius:'12px', padding:'2rem', maxHeight:'90vh', overflowY:'auto'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                    <h3>{textData.productManagement.modals.edit.title}</h3>
                    <button onClick={() => setShowEditModal(false)}><X/></button>
                </div>
                {editError && (
                  <div style={{ gridColumn: '1 / -1', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    {editError}
                  </div>
                )}
                <form onSubmit={onUpdateProduct} style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.name}</label>
                        <input className="pm-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.brand}</label>
                        <input className="pm-input" value={editForm.brand} onChange={e => setEditForm({...editForm, brand: e.target.value})} />
                    </div>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.category}</label>
                        <select className="pm-select" value={typeof editForm.category === 'object' ? editForm.category?._id : editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.qty}</label>
                        <input className="pm-input" type="number" value={editForm.quantity} onChange={e => setEditForm({...editForm, quantity: e.target.value})} />
                    </div>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.buyPrice}</label>
                        <input className="pm-input" type="number" value={editForm.purchasePrice} onChange={e => setEditForm({...editForm, purchasePrice: e.target.value})} />
                    </div>
                    <div className="pm-filter-group">
                        <label className="pm-filter-label">{textData.productManagement.modals.edit.sellPrice}</label>
                        <input className="pm-input" type="number" value={editForm.sellingPrice} onChange={e => setEditForm({...editForm, sellingPrice: e.target.value})} />
                    </div>
                    <div style={{gridColumn:'1 / -1', marginTop:'1rem', display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                        <button type="button" onClick={() => setShowEditModal(false)} className="pm-btn-page">{textData.productManagement.modals.buttons.cancel}</button>
                        <button type="submit" className="pm-btn-page" style={{background:'var(--pm-primary)', color:'white'}} disabled={saving}>{textData.productManagement.modals.buttons.save}</button>
                    </div>
                </form>
            </div>
         </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
              <div style={{background:'white', padding:'2rem', borderRadius:'12px', width:'350px'}}>
                  <h3 style={{marginBottom:'1rem'}}>{textData.productManagement.modals.stock.title}</h3>
                  <p style={{fontSize:'0.875rem', marginBottom:'1rem'}}>{textData.productManagement.modals.stock.product}: <strong>{selectedProduct.name}</strong></p>
                  <label className="pm-filter-label">{textData.productManagement.modals.stock.label}</label>
                  <input 
                    type="number" 
                    className="pm-input" 
                    value={stockUpdate} 
                    onChange={e => setStockUpdate(e.target.value)}
                    placeholder={textData.productManagement.modals.stock.placeholder}
                  />
                  <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
                      <button onClick={() => setShowStockModal(false)} className="pm-btn-page" style={{flex:1}}>{textData.productManagement.modals.buttons.cancel}</button>
                      <button onClick={onUpdateStock} className="pm-btn-page" style={{flex:1, background:'#10b981', color:'white'}} disabled={saving}>{textData.productManagement.modals.stock.update}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
              <div style={{background:'white', padding:'2rem', borderRadius:'12px', width:'400px'}}>
                  <h3 style={{color:'#ef4444', marginBottom:'1rem'}}>{textData.productManagement.modals.delete.title}</h3>
                  <p>{textData.productManagement.modals.delete.confirmLabel} <strong>{deleteConfirm.name}</strong>? {textData.productManagement.modals.delete.warning}</p>
                  <div style={{display:'flex', gap:'1rem', marginTop:'1.5rem'}}>
                      <button onClick={() => setDeleteConfirm(null)} className="pm-btn-page" style={{flex:1}}>{textData.productManagement.modals.buttons.cancel}</button>
                      <button onClick={handleDelete} className="pm-btn-page" style={{flex:1, background:'#ef4444', color:'white'}}>{textData.productManagement.modals.delete.confirmButton}</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
