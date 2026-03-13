import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Package, 
  Tags, 
  Truck, 
  ShoppingCart, 
  BarChart3, 
  History, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  Plus, 
  Edit, 
  Warehouse,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import ManagerApprovalList from '../components/ManagerApprovalList';
import CategorySupplierManager from '../components/CategorySupplierManager';
import './ManagerDashboard.css';

const MOCK_ANALYTICS = [
  { name: 'Mon', value: 400, stock: 240, orders: 20 },
  { name: 'Tue', value: 300, stock: 139, orders: 15 },
  { name: 'Wed', value: 200, stock: 980, orders: 40 },
  { name: 'Thu', value: 278, stock: 390, orders: 25 },
  { name: 'Fri', value: 189, stock: 480, orders: 30 },
  { name: 'Sat', value: 239, stock: 380, orders: 10 },
  { name: 'Sun', value: 349, stock: 430, orders: 5 },
];

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/manager/dashboard', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'approvals', label: 'Approve Products', icon: <CheckCircle size={20} /> },
    { id: 'products', label: 'Product Management', icon: <Package size={20} /> },
    { id: 'categories', label: 'Category Management', icon: <Tags size={20} /> },
    { id: 'suppliers', label: 'Manage Suppliers', icon: <Truck size={20} /> },
    { id: 'orders', label: 'Purchase Orders', icon: <ShoppingCart size={20} /> },
    { id: 'stock', label: 'Stock Management', icon: <BarChart3 size={20} /> },
    { id: 'movements', label: 'Inventory Movement', icon: <History size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  ];

  return (
    <div className={`manager-dashboard ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Sidebar */}
      <aside className={`manager-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Package size={24} color="#fff" />
          </div>
          <span>Manager Hub</span>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item">
            <LogOut size={20} color="#ef4444" />
            <span style={{color: '#ef4444'}}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="manager-main">
        {/* Top Navbar */}
        <header className="manager-top-navbar">
          <div className="navbar-left">
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2>{menuItems.find(m => m.id === activeTab)?.label}</h2>
          </div>

          <div className="navbar-right">
            <div className="notification-badge">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar">
                {user?.fullName?.charAt(0) || 'M'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.fullName || 'Manager'}</span>
                <span className="user-role">Operations Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <section className="summary-section">
                <div className="section-header">
                  <h3>Inventory Overview</h3>
                </div>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="card-icon bg-blue-soft"><Plus size={24} /></div>
                    <div className="card-info">
                      <span className="card-label">Products Added</span>
                      <span className="card-value">{stats?.productsCount || 24}</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon bg-red-soft"><X size={24} /></div>
                    <div className="card-info">
                      <span className="card-label">Out of Stock</span>
                      <span className="card-value">{stats?.lowStockCount || 8}</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon bg-amber-soft"><ShoppingCart size={24} /></div>
                    <div className="card-info">
                      <span className="card-label">Pending Orders</span>
                      <span className="card-value">12</span>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="card-icon bg-emerald-soft"><Package size={24} /></div>
                    <div className="card-info">
                      <span className="card-label">Total Value</span>
                      <span className="card-value">${stats?.inventoryValue?.toLocaleString() || '124,500'}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Manager Responsibilities */}
              <section className="responsibilities-section">
                <div className="section-header">
                  <h3>Manager Responsibilities</h3>
                </div>
                <div className="responsibility-grid">
                  {[
                    { label: 'Approve New Products', icon: <CheckCircle /> },
                    { label: 'Edit Product Details', icon: <Edit /> },
                    { label: 'Manage Suppliers', icon: <Truck /> },
                    { label: 'Create Purchase Orders', icon: <ShoppingCart /> },
                    { label: 'Manage Stock Levels', icon: <BarChart3 /> },
                    { label: 'Monitor Warehouse', icon: <Warehouse /> },
                  ].map((resp, i) => (
                    <div key={i} className="responsibility-card">
                      <div className="resp-content">
                        <span className="resp-icon">{resp.icon}</span>
                        <span className="resp-text">{resp.label}</span>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Analytics Section */}
              <section className="analytics-section">
                <div className="section-header">
                  <h3>Inventory Analytics</h3>
                </div>
                <div className="analytics-grid">
                  <div className="analytics-card full-width">
                    <h4>Stock Movement vs Orders</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_ANALYTICS}>
                          <defs>
                            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip />
                          <Area type="monotone" dataKey="stock" stroke="#2563eb" fillOpacity={1} fill="url(#colorStock)" strokeWidth={2} />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h4>Daily Sales Report</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_ANALYTICS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h4>Supplier Performance</h4>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_ANALYTICS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </section>

              {/* Recent Activity Table */}
              <section className="activity-section">
                <div className="section-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="table-card">
                  <div className="scrollable-table">
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Supplier</th>
                          <th>Quantity</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentMovements?.length > 0 ? stats.recentMovements.slice(0, 5).map((log, i) => (
                          <tr key={i}>
                            <td style={{fontWeight: 500}}>{log.product?.name || 'Item ' + i}</td>
                            <td>{log.product?.category?.name || 'General'}</td>
                            <td>{log.product?.supplier?.name || 'System'}</td>
                            <td>{log.quantityMoved}</td>
                            <td>
                              <span className={`status-badge ${log.status === 'Approved' ? 'status-approved' : 'status-pending'}`}>
                                {log.status || 'Approved'}
                              </span>
                            </td>
                            <td>{log.timestamp ? new Date(log.timestamp).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                          </tr>
                        )) : [1, 2, 3, 4, 5].map(i => (
                          <tr key={i}>
                            <td style={{fontWeight: 500}}>Sample Product {i}</td>
                            <td>Electronics</td>
                            <td>Alpha Corp</td>
                            <td>{Math.floor(Math.random() * 100)}</td>
                            <td>
                              <span className={`status-badge ${i % 2 === 0 ? 'status-approved' : 'status-pending'}`}>
                                {i % 2 === 0 ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td>Mar 11, 2026</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'approvals' && (
            <div className="animate-fade-in">
              <ManagerApprovalList />
            </div>
          )}

          {activeTab === 'categories' && (
             <div className="animate-fade-in">
               <CategorySupplierManager />
             </div>
          )}

          {(activeTab !== 'dashboard' && activeTab !== 'approvals' && activeTab !== 'categories') && (
            <div className="placeholder-view">
              <div className="table-card" style={{padding: '4rem', textAlign: 'center'}}>
                <Package size={48} color="#94a3b8" style={{marginBottom: '1rem', display: 'inline-block'}} />
                <h4 style={{marginBottom: '0.5rem'}}>Management Interface</h4>
                <p style={{color: '#64748b'}}>The {menuItems.find(m => m.id === activeTab)?.label} module is being updated with the new design system.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
