import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PackagePlus,
  List,
  ArrowUpDown,
  ScanLine,
  AlertTriangle,
  ScanBarcode,
  LogOut,
  Bell,
  UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddProductForm from '../components/AddProductForm';
import ProductList from '../components/ProductList';
import MovementTracker from '../components/MovementTracker';
import BarcodeScannerWidget from '../components/BarcodeScannerWidget';
import Profile from '../components/Profile';
import './StaffDashboard.css';

import axios from 'axios';
import { Loader2, CheckCircle2 } from 'lucide-react';

const UpdateQuantity = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantityStr, setQuantityStr] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch Categories on Mount
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

  // Fetch Products when Category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setSelectedProduct(''); // reset product selection
      if (!selectedCategory) {
        setProducts([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/products?category=${selectedCategory}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      }
    };
    if (user?.token) fetchProducts();
  }, [selectedCategory, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantityStr) return;
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      await axios.put(`http://localhost:5000/api/products/${selectedProduct}/quantity`, 
        { quantityAdded: parseInt(quantityStr, 10) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessage({ type: 'success', text: `Quantity successfully updated for product.` });
      setQuantityStr('');
      setSelectedCategory('');
      setSelectedProduct('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update quantity.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sd-card">
      <div className="sd-card-header">
        <h3 className="sd-card-title">Update Product Quantity</h3>
      </div>
      
      {message && (
        <div className="sd-alert-card mb-4" style={{ 
          backgroundColor: message.type === 'success' ? 'var(--sd-status-approved-bg)' : 'var(--sd-status-rejected-bg)', 
          color: message.type === 'success' ? 'var(--sd-status-approved-text)' : 'var(--sd-status-rejected-text)',
          borderColor: message.type === 'success' ? 'var(--sd-status-approved-text)' : 'var(--sd-status-rejected-text)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {message.type === 'success' && <CheckCircle2 size={20} />}
          <div className="sd-alert-content">{message.text}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="sd-form-grid">
        <div className="sd-form-group full">
          <label className="sd-label">Select Category</label>
          <select 
            required 
            className="sd-select" 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Choose Category --</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="sd-form-group full">
          <label className="sd-label">Select Product Name</label>
          <select 
            required 
            className="sd-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={!selectedCategory || products.length === 0}
          >
            <option value="">-- Choose Product --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          {selectedCategory && products.length === 0 && (
            <p className="text-xs text-orange-500 mt-1">No products found in this category.</p>
          )}
        </div>

        <div className="sd-form-group">
          <label className="sd-label">Quantity (+ added / - removed)</label>
          <input 
            required 
            type="number" 
            className="sd-input" 
            placeholder="e.g. 10 or -5" 
            value={quantityStr}
            onChange={(e) => setQuantityStr(e.target.value)}
          />
        </div>

        <div className="sd-form-group">
          <label className="sd-label">Date of Update</label>
          <input type="date" className="sd-input" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
        </div>

        <div className="sd-btn-group full" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
          <button type="submit" disabled={isSubmitting || !selectedProduct || !quantityStr} className="sd-btn sd-btn-primary">
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Update Quantity'}
          </button>
        </div>
      </form>
    </div>
  );
};

const LowStockAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/products?lowStock=true', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setAlerts(res.data);
      } catch (err) {
        console.error('Failed to fetch low stock alerts', err);
        setError('Failed to load alerts.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchLowStock();
  }, [user]);

  return (
    <div className="sd-card">
      <div className="sd-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="sd-card-title">Low Stock Notifications</h3>
        <span style={{ backgroundColor: 'var(--sd-status-rejected-bg)', color: 'var(--sd-status-rejected-text)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          {alerts.length} Alerts
        </span>
      </div>
      <p style={{ color: 'var(--sd-text-muted)', marginBottom: '1.5rem' }}>Inform staff to notify manager and prevent stock shortage.</p>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sd-text-muted)' }}><Loader2 className="animate-spin inline mr-2" /> Loading alerts...</div>
      ) : error ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
      ) : alerts.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sd-text-muted)', backgroundColor: 'var(--sd-bg-body)', borderRadius: '8px' }}>
          ✅ All products are above minimum stock levels.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {alerts.map((product) => (
            <div key={product._id} className="sd-alert-card" style={{ marginTop: 0 }}>
              <div className="sd-alert-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="sd-alert-content" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 className="sd-alert-title">{product.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--sd-text-muted)' }}>SKU: {product.productId}</span>
                </div>
                <p className="sd-alert-text">Minimum Stock Level: {product.minStockLevel || 50} | Current Stock: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{product.quantity}</span></p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <p className="sd-alert-text" style={{ fontWeight: '600' }}>Status: Low Stock Warning</p>
                  {product.supplier && <span style={{ fontSize: '0.75rem', color: 'var(--sd-primary-color)' }}>Supplier: {product.supplier?.name || 'Unknown'}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



const DashboardOverview = () => (
  <div className="sd-card">
    <div className="sd-card-header">
      <h3 className="sd-card-title">Product Status Workflow</h3>
    </div>
    <p style={{ color: 'var(--sd-text-muted)', marginBottom: '2rem' }}>Understand the lifecycle of new products added to the inventory.</p>

    <div className="sd-workflow">
      <div className="sd-workflow-step">
        <div className="sd-workflow-icon">1</div>
        <div className="sd-workflow-label">Staff adds product</div>
      </div>
      <div className="sd-workflow-step">
        <div className="sd-workflow-icon" style={{ backgroundColor: 'var(--sd-status-pending-bg)', borderColor: '#facc15', color: '#b45309' }}>2</div>
        <div className="sd-workflow-label">Status = Pending</div>
      </div>
      <div className="sd-workflow-step">
        <div className="sd-workflow-icon">3</div>
        <div className="sd-workflow-label">Manager Reviews</div>
      </div>
      <div className="sd-workflow-step">
        <div className="sd-workflow-icon" style={{ backgroundColor: 'var(--sd-status-approved-bg)', borderColor: '#4ade80', color: '#166534' }}>4</div>
        <div className="sd-workflow-label">Product Active</div>
      </div>
    </div>
  </div>
);

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [preSelectedProduct, setPreSelectedProduct] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleActionRedirect = (view, productData) => {
    setPreSelectedProduct(productData);
    setActiveView(view);
  };

  // Reset pre-selected product if we navigate away manually
  useEffect(() => {
    if (activeView !== 'move' && preSelectedProduct) {
      setPreSelectedProduct(null);
    }
  }, [activeView]);

  const navItems = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'add', label: 'Add Product', icon: PackagePlus },
    { id: 'list', label: 'Product List', icon: List },
    { id: 'update', label: 'Update Quantity', icon: ArrowUpDown },
    { id: 'move', label: 'Product Movement', icon: ScanLine },
    { id: 'lowstock', label: 'Low Stock Alerts', icon: AlertTriangle },
    { id: 'scanner', label: 'Barcode Scanner', icon: ScanBarcode },
  ];

  return (
    <div className="sd-layout">

      {/* Sidebar Overlay (Mobile) */}
      <div className="sd-sidebar open">
        <div className="sd-sidebar-header">
          <PackagePlus size={24} />
          <span>InventoryNode</span>
        </div>

        <nav className="sd-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sd-nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sd-sidebar-footer">
          <button className="sd-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <LogOut />
            Logout
          </button>
        </div>
      </div>

      <div className="sd-main-wrapper">
        <header className="sd-topbar">
          <div className="sd-topbar-title">Inventory Staff Module</div>
          <div className="sd-topbar-actions">
            <button className="sd-icon-btn"><Bell size={20} /></button>
            <div className="sd-user-profile">
              <div className="sd-avatar"><UserCircle size={20} /></div>
              <span>{user?.fullName || 'Staff Member'}</span>
            </div>
          </div>
        </header>

        <main className="sd-content">
          <div className="sd-page-header">
            <h1 className="sd-page-title">
              {navItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </h1>
            <p className="sd-page-subtitle">
              Manage your inventory tracking and product registration.
            </p>
          </div>

          <div>
            {activeView === 'profile' && <Profile />}
            {activeView === 'dashboard' && <DashboardOverview />}
            {activeView === 'add' && <AddProductForm onSuccess={() => setActiveView('list')} />}
            {activeView === 'list' && <ProductList />}
            {activeView === 'update' && <UpdateQuantity />}
            {activeView === 'move' && <MovementTracker prefillProduct={preSelectedProduct} />}
            {activeView === 'lowstock' && <LowStockAlerts />}
            {activeView === 'scanner' && <BarcodeScannerWidget onActionRedirect={handleActionRedirect} />}
          </div>
        </main>
      </div>

    </div>
  );
}
