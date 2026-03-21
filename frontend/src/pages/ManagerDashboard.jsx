import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CheckCircle, Package, Tags, Truck, ShoppingCart,
  BarChart3, History, FileText, Bell, LogOut, Plus, X, Search,
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Layers, Users,
  ArrowUpRight, ArrowDownRight, Filter, RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ManagerApprovalList from '../components/ManagerApprovalList';
import CategorySupplierManager from '../components/CategorySupplierManager';
import PurchaseOrderManager from '../components/PurchaseOrderManager';
import ProductManagement from '../components/ProductManagement';
import Profile from '../components/Profile';
import textData from '../constants/textData';
import './ManagerDashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('All');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/manager/dashboard', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtered Activities
  const filteredMovements = useMemo(() => {
    if (!stats?.recentMovements) return [];
    return stats.recentMovements.filter(m => {
      const matchesSearch = (m.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReason = filterReason === 'All' || m.reason === filterReason;
      return matchesSearch && matchesReason;
    });
  }, [stats?.recentMovements, searchTerm, filterReason]);

  const menuItems = [
    { id: 'profile', label: textData.profile.title, icon: <Users size={20} /> },
    { id: 'dashboard', label: textData.managerDashboard.tabs.dashboard, icon: <LayoutDashboard size={20} /> },
    { id: 'approvals', label: textData.managerDashboard.tabs.approvals, icon: <CheckCircle size={20} /> },
    { id: 'products', label: textData.managerDashboard.tabs.products, icon: <Package size={20} /> },
    { id: 'categories', label: textData.managerDashboard.tabs.categories, icon: <Tags size={20} /> },
    { id: 'orders', label: textData.managerDashboard.tabs.orders, icon: <ShoppingCart size={20} /> },
    { id: 'movements', label: textData.managerDashboard.tabs.logs, icon: <History size={20} /> },
  ];

  // Removed the full-page loading block to ensure a smoother experience without jarring transitions.

  return (
    <div className={`manager-dashboard ${sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      {/* Sidebar */}
      <aside className="manager-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Package size={24} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{textData.managerDashboard.sidebarTitle}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user?.shopName}</span>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', color: 'white', border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ color: '#ef4444' }}>
            <LogOut size={20} />
            <span>{textData.common.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="manager-main">
        {/* Top Navbar */}
        <header className="manager-top-navbar">
          <div className="navbar-left">
            <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
              <LayoutDashboard size={24} />
            </button>
            <h2 style={{ color: '#1e293b' }}>{textData.managerDashboard.navTitle}</h2>
          </div>

          <div className="navbar-right">
            <div className="notification-badge"><Bell size={20} /></div>
            <div className="user-profile">
              <div className="user-avatar" style={{ background: '#6366f1', color: '#white' }}>{user?.fullName?.charAt(0)}</div>
              <div className="user-info">
                <span className="user-name">{user?.fullName}</span>
                <span className="user-role">{textData.managerDashboard.sidebarTitle}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="animate-fade">
              {/* Summary Cards */}
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="card-icon bg-indigo"><Package size={24} /></div>
                  <div className="card-info">
                    <span className="card-label">{textData.managerDashboard.summary.totalProducts}</span>
                    <span className="card-value">{stats?.summary?.totalProducts || 0}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon bg-rose"><X size={24} /></div>
                  <div className="card-info">
                    <span className="card-label">{textData.managerDashboard.summary.outOfStock}</span>
                    <span className="card-value">{stats?.summary?.outOfStock || 0}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon bg-amber"><CheckCircle size={24} /></div>
                  <div className="card-info">
                    <span className="card-label">{textData.managerDashboard.summary.pendingApproval}</span>
                    <span className="card-value">{stats?.summary?.pendingApproval || 0}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon bg-emerald"><DollarSign size={24} /></div>
                  <div className="card-info">
                    <span className="card-label">{textData.managerDashboard.summary.inventoryValue}</span>
                    <span className="card-value">₹{stats?.summary?.totalInventoryValue?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="card-icon bg-violet"><AlertTriangle size={24} /></div>
                  <div className="card-info">
                    <span className="card-label">{textData.managerDashboard.summary.lowStock}</span>
                    <span className="card-value">{stats?.summary?.lowStock || 0}</span>
                  </div>
                </div>
              </div>

              {/* Analytics Grid */}
              <div className="analytics-grid">
                {/* 1. Low Stock Alert */}
                <div className="analytics-card">
                  <h4><AlertTriangle size={18} color="#f59e0b" /> {textData.managerDashboard.analytics.lowStockAlert}</h4>
                  <div className="info-list">
                    {stats?.lowStockProducts?.length > 0 ? stats.lowStockProducts.map((p, i) => (
                      <div className="info-item" key={i}>
                        <div className="item-main">
                          <Package size={16} />
                          <span>{p.name}</span>
                        </div>
                        <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                          {p.quantity} {p.unitType || 'pcs'} left
                        </span>
                      </div>
                    )) : <p style={{ color: '#64748b', textAlign: 'center' }}>All items well stocked.</p>}
                  </div>
                </div>

                {/* 2. Top Selling Products */}
                <div className="analytics-card">
                  <h4><TrendingUp size={18} color="#10b981" /> {textData.managerDashboard.analytics.topSelling}</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.topSellingProducts}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="totalSold" fill="#6366f1" radius={[4, 4, 0, 0]} name="Qty Sold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Category Distribution */}
                <div className="analytics-card">
                  <h4><Layers size={18} color="#8b5cf6" /> {textData.managerDashboard.analytics.categoryDist}</h4>
                  <div className="chart-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="count"
                          label
                        >
                          {stats?.categoryDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Sales Analytics */}
                <div className="analytics-card">
                  <h4><TrendingUp size={18} color="#6366f1" /> {textData.managerDashboard.analytics.salesTrend}</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats?.salesAnalytics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 5. Profit Analysis */}
                <div className="analytics-card">
                  <h4><DollarSign size={18} color="#10b981" /> {textData.managerDashboard.analytics.profitAnalysis}</h4>
                  <div className="profit-grid">
                    <div className="profit-stat">
                      <span className="profit-label">{textData.managerDashboard.profit.purchaseValue}</span>
                      <span className="profit-val" style={{ color: '#64748b' }}>₹{stats?.profitAnalysis?.totalPurchaseValue?.toLocaleString()}</span>
                    </div>
                    <div className="profit-stat">
                      <span className="profit-label">{textData.managerDashboard.profit.sellingValue}</span>
                      <span className="profit-val" style={{ color: '#64748b' }}>₹{stats?.profitAnalysis?.totalSellingValue?.toLocaleString()}</span>
                    </div>
                    <div className="profit-stat" style={{ background: '#d1fae5', border: '1px solid #10b981' }}>
                      <span className="profit-label" style={{ color: '#047857' }}>{textData.managerDashboard.profit.actualProfit}</span>
                      <span className="profit-val" style={{ color: '#059669' }}>₹{stats?.profitAnalysis?.totalProfit?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{textData.managerDashboard.profit.potentialProfitNote}</p>
                  </div>
                </div>

                {/* 6. Fast vs Slow Moving */}
                <div className="analytics-card">
                  <h4><RefreshCcw size={18} color="#06b6d4" /> {textData.managerDashboard.analytics.movementPerf}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <h5 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#10b981' }}>{textData.managerDashboard.activity.filterSales}</h5>
                      {stats?.fastMoving?.map((p, i) => (
                        <div key={i} className="info-item" style={{ padding: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem' }}>{p.name}</span>
                          <ArrowUpRight size={14} color="#10b981" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#ef4444' }}>{textData.managerDashboard.activity.filterDamage}</h5>
                      {stats?.slowMoving?.map((p, i) => (
                        <div key={i} className="info-item" style={{ padding: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem' }}>{p.name}</span>
                          <ArrowDownRight size={14} color="#ef4444" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 7. Supplier Contribution */}
                <div className="analytics-card">
                  <h4><Truck size={18} color="#475569" /> {textData.managerDashboard.analytics.supplierContrib}</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.supplierContribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: 10 }} width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#475569" radius={[0, 4, 4, 0]} name="Products Supplied" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 8. Inventory Movement */}
                <div className="analytics-card">
                  <h4><History size={18} color="#6366f1" /> {textData.managerDashboard.analytics.stockTrends}</h4>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.movementTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} style={{ fontSize: 10 }} />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="added" stackId="1" stroke="#10b981" fill="#d1fae5" name="Stock Added" />
                        <Area type="monotone" dataKey="removed" stackId="1" stroke="#ef4444" fill="#fee2e2" name="Stock Removed" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{textData.managerDashboard.activity.title}</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="search-container">
                    <Search size={18} className="search-icon" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder={textData.managerDashboard.activity.searchPlaceholder}
                      className="search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="filter-select"
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  >
                    <option value="All">{textData.managerDashboard.activity.filterAll}</option>
                    <option value="Sale">{textData.managerDashboard.activity.filterSales}</option>
                    <option value="Restock">{textData.managerDashboard.activity.filterRestocks}</option>
                    <option value="Damage">{textData.managerDashboard.activity.filterDamage}</option>
                    <option value="Deleted">{textData.managerDashboard.activity.filterDeletions}</option>
                  </select>
                </div>
              </div>

              <div className="table-card">
                <div className="scrollable-table">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>{textData.common.productName}</th>
                        <th>{textData.common.category}</th>
                        <th>{textData.common.quantity}</th>
                        <th>{textData.common.status}</th>
                        <th>{textData.common.date} & {textData.common.time}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovements.slice(0, 10).map((log, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: '#1e293b' }}>{log.product?.name || 'Item Removed'}</td>
                          <td>{log.product?.category?.name || 'N/A'}</td>
                          <td>{log.quantityMoved} {log.product?.unitType || 'pcs'}</td>
                          <td>
                            <span className={`status-badge status-${log.reason?.replace(/\s/g, '').toLowerCase()}`}>
                              {log.reason?.includes('Deleted') ? <TrendingDown size={14} /> : (['Sale', 'Damage'].includes(log.reason) ? <TrendingDown size={14} /> : <TrendingUp size={14} />)}
                              {log.reason}
                            </span>
                          </td>
                          <td>{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {filteredMovements.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>{textData.managerDashboard.activity.noMovements}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && <Profile />}
          {activeTab === 'approvals' && <ManagerApprovalList />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'categories' && <CategorySupplierManager />}
          {activeTab === 'orders' && <PurchaseOrderManager />}

          {(activeTab !== 'dashboard' && activeTab !== 'profile' && activeTab !== 'approvals' && activeTab !== 'products' && activeTab !== 'categories' && activeTab !== 'orders' && activeTab !== 'movements') && (
            <div className="placeholder-view">
              <div className="analytics-card" style={{ textAlign: 'center', padding: '5rem' }}>
                <Package size={48} color="#cbd5e1" style={{ margin: '0 auto 1.5rem' }} />
                <h3>{menuItems.find(i => i.id === activeTab)?.label}</h3>
                <p style={{ color: '#64748b' }}>{textData.managerDashboard.optimizationNote}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
