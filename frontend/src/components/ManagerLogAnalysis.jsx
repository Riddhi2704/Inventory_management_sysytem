import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Search, Filter, Calendar, TrendingUp, TrendingDown,
  Download, Printer, FileSpreadsheet, Package, Activity,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'];
const ACTION_COLORS = {
  'Sale': '#d1fae5',
  'Restock': '#dbeafe',
  'Delete': '#fee2e2',
  'Update': '#ffedd5',
  'Return': '#f3e8ff',
  'Damage': '#fee2e2'
};
const ACTION_TEXT_COLORS = {
  'Sale': '#059669',
  'Restock': '#2563eb',
  'Delete': '#dc2626',
  'Update': '#ea580c',
  'Return': '#9333ea',
  'Damage': '#dc2626'
};

export default function ManagerLogAnalysis() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('All'); // Today, This Week, This Month, This Year, All
  const [actionFilter, setActionFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  
  // Custom Date Range (Optional integration)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/logs/movement', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper parsing function
  const getActionCategory = (reason) => {
    const r = (reason || '').toLowerCase();
    if (r.includes('sale') || r.includes('sold')) return 'Sale';
    if (r.includes('restock') || r.includes('receive')) return 'Restock';
    if (r.includes('delete') || r.includes('remove')) return 'Delete';
    if (r.includes('update') || r.includes('edit')) return 'Update';
    if (r.includes('return')) return 'Return';
    if (r.includes('damage')) return 'Damage';
    return 'Other';
  };

  const getProductDetails = (m) => {
    const name = m.product?.name || m.productName || 'Unknown Product';
    const categoryName = m.product?.category?.name || m.categoryName || 'Uncategorized';
    let price = m.product?.sellingPrice || 0;
    
    // For restocks, we might ideally prefer purchasePrice, but let's default to sellingPrice if needed.
    if (getActionCategory(m.reason) === 'Restock' && m.product?.purchasePrice) {
      price = m.product.purchasePrice;
    }
    
    const qty = m.quantityMoved || 0;
    const total = qty * price;
    
    return { name, categoryName, price, qty, total };
  };

  // Unique lists for Filter dropdowns
  const availableCategories = useMemo(() => {
    const cats = new Set(logs.map(m => m.product?.category?.name || m.categoryName).filter(Boolean));
    return Array.from(cats).sort();
  }, [logs]);

  const availableRoles = useMemo(() => {
    const roles = new Set(logs.map(m => m.movedBy?.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [logs]);

  // Derived filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter(m => {
      const { name, categoryName } = getProductDetails(m);
      const action = getActionCategory(m.reason);
      const mDate = new Date(m.createdAt);
      const role = m.movedBy?.role || 'Unknown';

      // Text Search
      const searchMatch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.movedBy?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Select Filters
      const actionMatch = actionFilter === 'All' || action === actionFilter;
      const categoryMatch = categoryFilter === 'All' || categoryName === categoryFilter;
      const roleMatch = userRoleFilter === 'All' || role === userRoleFilter;

      // Time Filter
      let timeMatch = true;
      const today = new Date();
      if (timeFilter !== 'All') {
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        switch (timeFilter) {
          case 'Today':
            timeMatch = mDate >= startOfToday;
            break;
          case 'This Week':
            const startOfWeek = new Date(startOfToday);
            startOfWeek.setDate(startOfToday.getDate() - today.getDay());
            timeMatch = mDate >= startOfWeek;
            break;
          case 'This Month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            timeMatch = mDate >= startOfMonth;
            break;
          case 'This Year':
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            timeMatch = mDate >= startOfYear;
            break;
          case 'Custom':
            if (startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              timeMatch = mDate >= start && mDate <= end;
            }
            break;
          default:
            timeMatch = true;
        }
      }

      return searchMatch && actionMatch && categoryMatch && roleMatch && timeMatch;
    }).sort((a, b) => {
       // Setup generic sorting
       let valA, valB;
       if (sortField === 'createdAt') {
         valA = new Date(a.createdAt).getTime(); valB = new Date(b.createdAt).getTime();
       } else if (sortField === 'productName') {
         valA = getProductDetails(a).name; valB = getProductDetails(b).name;
       } else if (sortField === 'quantityMoved') {
         valA = a.quantityMoved; valB = b.quantityMoved;
       } else if (sortField === 'total') {
         valA = getProductDetails(a).total; valB = getProductDetails(b).total;
       }
       
       if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
       if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
       return 0;
    });
  }, [logs, searchTerm, timeFilter, actionFilter, categoryFilter, userRoleFilter, sortField, sortOrder, startDate, endDate]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Summary Metrics Calculation
  const metrics = useMemo(() => {
    let salesTotal = 0;
    let productsSold = 0;
    let productsRestocked = 0;
    let productsDeleted = 0;

    filteredLogs.forEach(m => {
      const action = getActionCategory(m.reason);
      const { qty, total } = getProductDetails(m);

      if (action === 'Sale') {
        salesTotal += total;
        productsSold += qty;
      } else if (action === 'Restock') {
        productsRestocked += qty;
      } else if (action === 'Delete' || action === 'Damage') {
        productsDeleted += qty;
      }
    });

    return { salesTotal, productsSold, productsRestocked, productsDeleted };
  }, [filteredLogs]);

  // Chart Data Calculations (Dynamic based on filteredLogs)
  const chartData = useMemo(() => {
    const trendMap = {}; // Line & Bar chart: { date: 'YYYY-MM-DD', salesAmt: 0, restockQty: 0, salesQty: 0 }
    const actionDist = {}; // Pie chart: { action: count }

    filteredLogs.forEach(m => {
      const dateStr = new Date(m.createdAt).toISOString().split('T')[0];
      const action = getActionCategory(m.reason);
      const { qty, total } = getProductDetails(m);

      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { date: dateStr, salesAmt: 0, restockQty: 0, salesQty: 0 };
      }

      if (action === 'Sale') {
        trendMap[dateStr].salesAmt += total;
        trendMap[dateStr].salesQty += qty;
      } else if (action === 'Restock') {
        trendMap[dateStr].restockQty += qty;
      }

      actionDist[action] = (actionDist[action] || 0) + 1;
    });

    const trendArray = Object.values(trendMap).sort((a,b) => a.date.localeCompare(b.date));
    const pieArray = Object.entries(actionDist).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

    return { trendArray, pieArray };
  }, [filteredLogs]);

  // Export methods
  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'Category', 'Action', 'Quantity', 'Price', 'Total', 'User', 'Role', 'Remarks'];
    const rows = filteredLogs.map(m => {
      const { name, categoryName, price, qty, total } = getProductDetails(m);
      return [
        `"${new Date(m.createdAt).toLocaleString()}"`,
        `"${name}"`,
        `"${categoryName}"`,
        `"${getActionCategory(m.reason)}"`,
        qty,
        price.toFixed(2),
        total.toFixed(2),
        `"${m.movedBy?.fullName || 'Unknown'}"`,
        `"${m.movedBy?.role || 'Unknown'}"`,
        `"${m.reason || ''}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `log_analysis_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Activity className="animate-pulse" size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ margin: 0, color: '#64748b' }}>Loading Analytics Engine...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="log-analysis-container" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Hide controls from print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-report, .printable-report * { visibility: visible; }
          .printable-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
          .no-print { display: none !important; }
          @page { size: landscape; margin: 10mm; }
        }
      `}</style>
      
      <div className="printable-report">
        
        {/* Top Header & Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b', fontWeight: 800 }}>Comprehensive Log Analysis</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Deep-dive tracking of all historic product movements and transactions.</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '12px' }}>
            <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='white'}>
              <FileSpreadsheet size={18} color="#10b981" /> Export Excel
            </button>
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#4338ca'} onMouseOut={e=>e.currentTarget.style.background='#4f46e5'}>
              <Printer size={18} /> Print PDF
            </button>
          </div>
        </div>

        {/* Professional Filters Panel */}
        <div className="no-print" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Time Filter</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', background: '#f8fafc' }}>
                <Calendar size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
                <select value={timeFilter} onChange={e => { setTimeFilter(e.target.value); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#1e293b', fontWeight: 500 }}>
                  {['All', 'Today', 'This Week', 'This Month', 'This Year', 'Custom'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {timeFilter === 'Custom' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>From</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>To</label>
                  <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} />
                </div>
              </div>
            )}

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Action</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', background: '#f8fafc' }}>
                <Filter size={16} color="#94a3b8" style={{ marginRight: '8px' }} />
                <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setCurrentPage(1); }} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#1e293b', fontWeight: 500 }}>
                  <option value="All">All Actions</option>
                  {['Sale', 'Restock', 'Delete', 'Update', 'Return', 'Damage'].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Category</label>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', outline: 'none', color: '#1e293b', fontWeight: 500 }}>
                <option value="All">All Categories</option>
                {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>Global Search</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Items, users, remarks..." 
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', outline: 'none', color: '#1e293b' }}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {[
            { label: 'Total Sales Amount', val: `₹${metrics.salesTotal.toLocaleString()}`, color: '#10b981', bg: '#ecfdf5', icon: <TrendingUp/> },
            { label: 'Products Sold', val: metrics.productsSold, color: '#3b82f6', bg: '#eff6ff', icon: <Package/> },
            { label: 'Restocked Quantity', val: metrics.productsRestocked, color: '#8b5cf6', bg: '#faf5ff', icon: <TrendingDown/> },
            { label: 'Deleted / Damaged', val: metrics.productsDeleted, color: '#ef4444', bg: '#fef2f2', icon: <X/> }
          ].map((c, i) => (
            <div key={i} style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{c.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>Sales Trend</h3>
            <div style={{ height: '250px' }}>
              {chartData.trendArray.length === 0 ? <p style={{textAlign:'center', color:'#94a3b8', marginTop:'100px'}}>No data available</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.trendArray}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill:'#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 11, fill:'#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}/>
                    <Line type="monotone" dataKey="salesAmt" name="Revenue (₹)" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill:'#6366f1', strokeWidth:0}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>Stock Movement (Restock vs Sale Qty)</h3>
            <div style={{ height: '250px' }}>
              {chartData.trendArray.length === 0 ? <p style={{textAlign:'center', color:'#94a3b8', marginTop:'100px'}}>No data available</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.trendArray}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill:'#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 11, fill:'#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="restockQty" name="Restocked" fill="#3b82f6" radius={[4,4,0,0]} />
                    <Bar dataKey="salesQty" name="Sold" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>Action Distribution</h3>
            <div style={{ height: '250px' }}>
              {chartData.pieArray.length === 0 ? <p style={{textAlign:'center', color:'#94a3b8', marginTop:'100px'}}>No data available</p> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.pieArray} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {chartData.pieArray.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* Data Table */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>Transaction History ({filteredLogs.length} entries)</h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
            <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left', WebkitUserSelect: 'none' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', zIndex: 10 }}>
                <tr>
                  {[{k:'createdAt', l:'Date & Time'}, {k:'productName', l:'Product'}, {k:'category', l:'Category'}, {k:'reason', l:'Action'}, {k:'quantityMoved', l:'Quantity'}, {k:'price', l:'Price'}, {k:'total', l:'Total'}, {k:'user', l:'User / Role'}, {k:'remarks', l:'Remarks'}].map((h, i) => (
                    <th key={i} onClick={() => ['createdAt','productName','quantityMoved','total'].includes(h.k) && handleSort(h.k)} style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', cursor: ['createdAt','productName','quantityMoved','total'].includes(h.k) ? 'pointer' : 'default', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      {h.l} {sortField === h.k ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentLogs.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No logs match your filters.</td></tr>
                ) : (
                  currentLogs.map((m, i) => {
                    const action = getActionCategory(m.reason);
                    const { name, categoryName, price, qty, total } = getProductDetails(m);
                    const bgClr = ACTION_COLORS[action] || '#f1f5f9';
                    const txtClr = ACTION_TEXT_COLORS[action] || '#475569';

                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'block' }}>{new Date(m.createdAt).toLocaleDateString()}</span>
                          <span style={{ fontSize: '0.75rem' }}>{new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{name}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748b' }}>{categoryName}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ background: bgClr, color: txtClr, padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {action}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 700, color: ['Sale','Delete','Damage'].includes(action) ? '#ef4444' : '#10b981' }}>
                          {['Sale','Delete','Damage'].includes(action) ? '-' : '+'}{qty}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#475569' }}>₹{price.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>₹{total.toLocaleString()}</td>
                        <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                          <span style={{ display: 'block', color: '#1e293b', fontWeight: 500 }}>{m.movedBy?.fullName || 'Unknown'}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{m.movedBy?.role || ''}</span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '0.8rem', color: '#64748b', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.reason}>
                          {m.reason}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="no-print" style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage===1?'not-allowed':'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft size={16} /> Prev
                </button>
                <div style={{ padding: '6px 12px', background: '#6366f1', color: 'white', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' }}>
                  Page {currentPage} of {totalPages}
                </div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ padding: '6px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: currentPage===totalPages?'not-allowed':'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
