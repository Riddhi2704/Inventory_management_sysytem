import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CheckCircle, Package, Tags, Truck, ShoppingCart,
  BarChart3, History, FileText, Bell, LogOut, Plus, X, Search,
  AlertTriangle, TrendingUp, TrendingDown, DollarSign, Layers, Users,
  ArrowUpRight, ArrowDownRight, Filter, RefreshCcw, Loader2, IndianRupee, PieChart as PieIcon, Activity
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ManagerApprovalList from '../components/ManagerApprovalList';
import CategorySupplierManager from '../components/CategorySupplierManager';
import PurchaseOrderManager from '../components/PurchaseOrderManager';
import ProductManagement from '../components/ProductManagement';
import Profile from '../components/Profile';
import ManagerLogAnalysis from '../components/ManagerLogAnalysis';
import textData from '../constants/textData';
import './ManagerDashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Activity Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('All');
  const [activityPage, setActivityPage] = useState(1);
  const activityItemsPerPage = 5;

  // Revenue Analytics Features
  const [revenueCategory, setRevenueCategory] = useState('all');
  const [revenueTime, setRevenueTime] = useState('month');
  const [revenueSearch, setRevenueSearch] = useState('');
  const [debouncedRevSearch, setDebouncedRevSearch] = useState('');
  const [revenueData, setRevenueData] = useState([]);
  const [revenueLoading, setRevenueLoading] = useState(false);

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
    if (activeTab === 'dashboard') fetchStats();
  }, [user, activeTab]);

  // Debounce for Revenue Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRevSearch(revenueSearch);
    }, 500);
    return () => clearTimeout(handler);
  }, [revenueSearch]);

  // Fetch Advanced Revenue Analytics Graph
  useEffect(() => {
    const fetchRevenueGraph = async () => {
      if (activeTab !== 'dashboard') return;
      setRevenueLoading(true);
      try {
        const res = await axios.get('http://localhost:5001/api/manager/analytics/revenue', {
          params: { filterType: revenueTime, category: revenueCategory, productName: debouncedRevSearch },
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setRevenueData(res.data);
      } catch (err) {
        console.error("Revenue graph error:", err);
      } finally {
        setRevenueLoading(false);
      }
    };
    if (user?.token) fetchRevenueGraph();
  }, [revenueTime, revenueCategory, debouncedRevSearch, user, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filtered Activities
  const filteredMovements = useMemo(() => {
    if (!stats?.recentMovements) return [];
    return stats.recentMovements.filter(m => {
      const nameToSearch = m.product?.name || m.productName || (m.reason?.startsWith('Deleted: ') ? m.reason.split('Deleted: ')[1] : '');
      const matchesSearch = nameToSearch.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesReason = filterReason === 'All' || m.reason === filterReason;
      return matchesSearch && matchesReason;
    });
  }, [stats?.recentMovements, searchTerm, filterReason]);

  // Reset activity page on filter change
  useEffect(() => {
    setActivityPage(1);
  }, [searchTerm, filterReason]);

  const totalActivityPages = Math.ceil(filteredMovements.length / activityItemsPerPage);
  const paginatedActivities = filteredMovements.slice((activityPage - 1) * activityItemsPerPage, activityPage * activityItemsPerPage);

  const menuItems = [
    { id: 'profile', label: textData.profile.title, icon: <Users size={20} /> },
    { id: 'dashboard', label: textData.managerDashboard.tabs.dashboard, icon: <LayoutDashboard size={20} /> },
    { id: 'approvals', label: textData.managerDashboard.tabs.approvals, icon: <CheckCircle size={20} /> },
    { id: 'products', label: textData.managerDashboard.tabs.products, icon: <Package size={20} /> },
    { id: 'categories', label: textData.managerDashboard.tabs.categories, icon: <Tags size={20} /> },
    { id: 'orders', label: textData.managerDashboard.tabs.orders, icon: <ShoppingCart size={20} /> },
    { id: 'movements', label: textData.managerDashboard.tabs.logs, icon: <History size={20} /> },
  ];

  // Custom Tooltip for Donut Chart
  const CustomDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'white', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1e293b' }}>{payload[0].name}</p>
          <p style={{ margin: 0, color: payload[0].payload.fill, fontWeight: 700 }}>{payload[0].value} Products Total</p>
        </div>
      );
    }
    return null;
  };

  // Custom Label for Donut Inner Percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    if (percent < 0.05) return null; // hide small percentages
    return (
      <text x={x} y={y} fill="white" fontSize="12" fontWeight="bold" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
              <div className="user-avatar" style={{ background: '#6366f1', color: 'white' }}>{user?.fullName?.charAt(0)}</div>
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

              {/* Advanced Summary Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '2rem'
              }}>
                {[
                  {
                    title: 'Total Products',
                    value: stats?.summary?.totalProducts,
                    icon: <Package size={24} color="#3b82f6" />,
                    bgColor: '#eff6ff',
                    tab: 'products',
                    trend: '↑ 5% Added',
                    trendColor: '#10b981'
                  },
                  {
                    title: 'Total Categories',
                    value: stats?.summary?.totalCategories,
                    icon: <Tags size={24} color="#a855f7" />,
                    bgColor: '#faf5ff',
                    tab: 'categories'
                  },
                  {
                    title: 'Low Stock Alerts',
                    value: stats?.summary?.lowStock,
                    icon: <AlertTriangle size={24} color="#f97316" />,
                    bgColor: '#fff7ed',
                    tab: 'products',
                    trend: 'Action Required',
                    trendColor: '#ea580c'
                  },
                  {
                    title: 'Out of Stock',
                    value: stats?.summary?.outOfStock,
                    icon: <AlertTriangle size={24} color="#ef4444" />,
                    bgColor: '#fef2f2',
                    tab: 'products'
                  },
                  {
                    title: 'Total Suppliers',
                    value: stats?.summary?.totalSuppliers,
                    icon: <Users size={24} color="#6366f1" />,
                    bgColor: '#eef2ff',
                    tab: 'categories'
                  },
                  {
                    title: 'Week Sales',
                    value: stats?.summary?.todaySales != null ? `₹${stats.summary.todaySales.toLocaleString()}` : null,
                    icon: <Activity size={24} color="#10b981" />,
                    bgColor: '#ecfdf5',
                    tab: 'dashboard'
                  },
                  {
                    title: 'Monthly Revenue',
                    value: stats?.summary?.monthlyRevenue != null ? `₹${stats.summary.monthlyRevenue.toLocaleString()}` : null,
                    icon: <TrendingUp size={24} color="#10b981" />,
                    bgColor: '#ecfdf5',
                    tab: 'dashboard',
                    trend: '↑ 12% vs last month',
                    trendColor: '#10b981'
                  },
                  {
                    title: 'Total Orders',
                    value: stats?.summary?.totalOrders,
                    icon: <ShoppingCart size={24} color="#4f46e5" />,
                    bgColor: '#e0e7ff',
                    tab: 'orders'
                  },
                  {
                    title: 'Inventory Value',
                    value: stats?.summary?.totalInventoryValue != null ? `₹${stats.summary.totalInventoryValue.toLocaleString()}` : null,
                    icon: <IndianRupee size={24} color="#0d9488" />,
                    bgColor: '#ccfbf1',
                    tab: 'dashboard'
                  }
                ].map((card, idx) => (
                  <div
                    key={idx}
                    onClick={() => { if (card.tab !== 'dashboard') setActiveTab(card.tab); }}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      cursor: card.tab !== 'dashboard' ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      if (card.tab !== 'dashboard') {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (card.tab !== 'dashboard') {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: card.bgColor, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {card.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {card.title}
                      </p>
                      {loading ? (
                        <div style={{ height: '28px', width: '60%', background: '#e2e8f0', borderRadius: '4px', marginTop: '4px' }} />
                      ) : (
                        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', color: '#1e293b', fontWeight: 700 }}>
                          {card.value ?? 0}
                        </h3>
                      )}
                      {card.trend && !loading && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: card.trendColor, marginTop: '4px', display: 'inline-block' }}>
                          {card.trend}
                        </span>
                      )}
                    </div>
                    {card.tab !== 'dashboard' && (
                      <ArrowUpRight size={16} color="#cbd5e1" style={{ position: 'absolute', top: '16px', right: '16px' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Advanced 4-Grid Dashboard Setup */}
              <div className="analytics-grid" style={{ gap: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>

                {/* 1. Category Distribution (Donut Chart) */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4><PieIcon size={20} color="#8b5cf6" /> Category Distribution</h4>
                  <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats?.categoryDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          animationBegin={0}
                          animationDuration={1500}
                        >
                          {stats?.categoryDistribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomDonutTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Enhanced Sales Analytics Graph */}
                <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                      <Activity size={20} color="#6366f1" />
                      Dynamic Revenue Analytics
                      {revenueData.length > 0 && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: '20px', marginLeft: '12px', letterSpacing: '0.025em' }}>
                          TOTAL: ₹{revenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                        </span>
                      )}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <select
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                        value={revenueCategory}
                        onChange={e => setRevenueCategory(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {stats?.categoryDistribution?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <select
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                        value={revenueTime}
                        onChange={e => setRevenueTime(e.target.value)}
                      >
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                          placeholder="Search Product..."
                          value={revenueSearch}
                          onChange={e => setRevenueSearch(e.target.value)}
                          style={{ padding: '6px 12px 6px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', width: '160px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minHeight: '280px', position: 'relative' }}>
                    {revenueLoading ? (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10 }}>
                        <Loader2 className="animate-spin" size={32} color="#6366f1" />
                      </div>
                    ) : revenueData.length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <BarChart3 size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <span>No Revenue Data Available</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} style={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Area type="monotone" dataKey="revenue" name="Total Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* 3. Profit Analysis (Cards UI) */}
                <div className="analytics-card">
                  <h4><IndianRupee size={20} color="#10b981" /> Profit Margins & Value</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>

                    {/* Purchase Value */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#e2e8f0', padding: '10px', borderRadius: '10px' }}><ShoppingCart size={20} color="#475569" /></div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.8125rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Purchase Value</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>₹{(stats?.profitAnalysis?.totalPurchaseValue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Selling Value */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', transition: 'transform 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#dbeafe', padding: '10px', borderRadius: '10px' }}><Tags size={20} color="#3b82f6" /></div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.8125rem', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase' }}>Est. Selling Value</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a' }}>₹{(stats?.profitAnalysis?.totalSellingValue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actual Profit */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0', transition: 'transform 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ background: '#d1fae5', padding: '10px', borderRadius: '10px' }}><ArrowUpRight size={20} color="#059669" /></div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.8125rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase' }}>Projected Net Profit</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b' }}>₹{(stats?.profitAnalysis?.totalProfit || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={{ background: '#34d399', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>+12.4%</div>
                    </div>

                  </div>
                </div>

                {/* 4. Movement Performance */}
                <div className="analytics-card">
                  <h4><RefreshCcw size={20} color="#06b6d4" /> Fast vs Slow Moving Inventory</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                    <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <h5 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={16} /> Top Sales Performer</h5>
                      <div className="info-list">
                        {stats?.fastMoving?.map((p, i) => (
                          <div key={i} className="info-item" style={{ padding: '0.75rem', border: '1px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sold: {p.totalSold} qty</div>
                            </div>
                            <ArrowUpRight size={18} color="#10b981" style={{ flexShrink: 0 }} />
                          </div>
                        ))}
                        {!stats?.fastMoving?.length && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No sales data yet.</p>}
                      </div>
                    </div>

                    <div style={{ background: '#fff1f2', padding: '1.25rem', borderRadius: '16px', border: '1px solid #fecaca' }}>
                      <h5 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingDown size={16} /> Lowest Movement</h5>
                      <div className="info-list">
                        {stats?.slowMoving?.map((p, i) => (
                          <div key={i} className="info-item" style={{ padding: '0.75rem', background: 'white', border: '1px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock: {p.quantity || 0}</div>
                            </div>
                            <ArrowDownRight size={18} color="#e11d48" style={{ flexShrink: 0 }} />
                          </div>
                        ))}
                        {!stats?.slowMoving?.length && <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>No inventory loaded.</p>}
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Recent Activity Table */}
              <div className="analytics-card" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ margin: 0 }}><History size={20} color="#ec4899" /> Recent Activity</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px' }}
                      value={filterReason}
                      onChange={e => setFilterReason(e.target.value)}
                    >
                      <option value="All">All Actions</option>
                      <option value="Sale">Sale</option>
                      <option value="Restock">Restock</option>
                      <option value="Damage">Damage</option>
                      <option value="Return">Return</option>
                      <option value="Deleted">Deleted</option>
                    </select>
                    <div style={{ position: 'relative' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        placeholder="Search Activity..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ padding: '6px 12px 6px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', width: '160px' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>
                      <tr>
                        <th style={{ padding: '12px 16px' }}>Product</th>
                        <th style={{ padding: '12px 16px' }}>Action</th>
                        <th style={{ padding: '12px 16px' }}>Quantity</th>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovements.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            No recent activity found.
                          </td>
                        </tr>
                      ) : (
                        paginatedActivities.map((m, index) => (
                          <tr key={m._id || index} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 16px', fontWeight: 500, color: '#1e293b' }}>
                              {m.product?.name || m.productName || (m.reason?.startsWith('Deleted: ') ? 'Deleted Item' : 'Unknown')}
                              {m.product?.category?.name && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>{m.product.category.name}</span>}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                                background: m.reason.includes('Sale') ? '#d1fae5' : m.reason.includes('Damage') || m.reason.includes('Deleted') ? '#fee2e2' : '#e0e7ff',
                                color: m.reason.includes('Sale') ? '#059669' : m.reason.includes('Damage') || m.reason.includes('Deleted') ? '#dc2626' : '#4338ca'
                              }}>
                                {m.reason}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>
                              {m.reason.includes('Sale') || m.reason.includes('Damage') || m.reason.includes('Deleted') ? '-' : '+'}{m.quantityMoved || 0}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              {new Date(m.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {!loading && filteredMovements.length > 0 && (
                  <div className="pl-pagination-wrapper">
                    <button
                      onClick={() => setActivityPage(prev => Math.max(prev - 1, 1))}
                      disabled={activityPage === 1}
                      className="pl-pagination-btn"
                    >
                      Previous
                    </button>

                    <div className="pl-pagination-numbers">
                      {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => setActivityPage(number)}
                          className={`pl-pagination-number ${activityPage === number ? 'active' : ''}`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setActivityPage(prev => Math.min(prev + 1, totalActivityPages))}
                      disabled={activityPage === totalActivityPages}
                      className="pl-pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'profile' && <Profile />}
          {activeTab === 'approvals' && <ManagerApprovalList />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'categories' && <CategorySupplierManager />}
          {activeTab === 'orders' && <PurchaseOrderManager />}
          {activeTab === 'movements' && <ManagerLogAnalysis />}

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
