import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, Calendar, Filter, Activity, BarChart2, 
  Download, ChevronLeft, ChevronRight, FileX,
  Trash2, RefreshCw, ShoppingCart, Edit3, ArrowUpDown 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell 
} from 'recharts';

import './SystemAuditLogs.css';

export default function SystemAuditLogs() {
  const { user } = useAuth();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [dateRange, setDateRange] = useState('7'); // days
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5001/api/logs/movement', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) {
      fetchLogs();
    }
  }, [user]);

  // Derived Data & Filtering
  const filteredLogs = useMemo(() => {
    let result = [...logs];
    
    // Apply Action Filter
    if (actionFilter !== 'All') {
      result = result.filter(log => {
        // Map backend reasons to our explicit filter types
        const reason = log.reason?.toLowerCase() || '';
        if (actionFilter === 'Restock') return reason.includes('restock') || reason.includes('found') || reason.includes('return');
        if (actionFilter === 'Sale') return reason.includes('sale') || reason.includes('sold');
        if (actionFilter === 'Delete') return reason.includes('delete') || reason.includes('damage') || reason.includes('sent out') || reason.includes('used');
        if (actionFilter === 'Edited') return reason.includes('edit');
        return true;
      });
    }

    // Apply Date Range
    if (dateRange !== 'All') {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(log => new Date(log.createdAt) >= cutoff);
    }

    // Apply Search Query
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(log => {
        const prodName = (log.product?.name || log.productName || '').toLowerCase();
        const userName = (log.movedBy?.fullName || '').toLowerCase();
        const action = (log.reason || '').toLowerCase();
        return prodName.includes(lowerQ) || userName.includes(lowerQ) || action.includes(lowerQ);
      });
    }

    // Apply Sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dA = new Date(a.createdAt).getTime();
        const dB = new Date(b.createdAt).getTime();
        return sortConfig.direction === 'asc' ? dA - dB : dB - dA;
      }
      if (sortConfig.key === 'quantity') {
        const qA = a.quantityMoved || 0;
        const qB = b.quantityMoved || 0;
        return sortConfig.direction === 'asc' ? qA - qB : qB - qA;
      }
      return 0;
    });

    return result;
  }, [logs, actionFilter, dateRange, searchQuery, sortConfig]);

  const toggleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter, dateRange]);

  // Chart Data Generation
  const chartData = useMemo(() => {
    const actionCounts = { Restock: 0, Sale: 0, Delete: 0, Edited: 0, Other: 0 };
    const timeline = {};

    filteredLogs.forEach(log => {
      // Bar Chart Categorization
      const reason = log.reason?.toLowerCase() || '';
      let mappedAction = 'Other';
      if (reason.includes('restock') || reason.includes('found') || reason.includes('return')) mappedAction = 'Restock';
      else if (reason.includes('sale') || reason.includes('sold')) mappedAction = 'Sale';
      else if (reason.includes('delete') || reason.includes('damage') || reason.includes('sent out') || reason.includes('used')) mappedAction = 'Delete';
      else if (reason.includes('edit')) mappedAction = 'Edited';
      
      actionCounts[mappedAction]++;

      // Line Chart Categorization
      const d = new Date(log.createdAt);
      const dateKey = `${d.getMonth() + 1}/${d.getDate()}`;
      if (!timeline[dateKey]) timeline[dateKey] = { date: dateKey, actions: 0 };
      timeline[dateKey].actions++;
    });

    const barData = [
      { name: 'Restock', value: actionCounts.Restock, color: 'var(--sal-success)' },
      { name: 'Sale', value: actionCounts.Sale, color: 'var(--sal-primary)' },
      { name: 'Delete', value: actionCounts.Delete, color: 'var(--sal-danger)' },
      { name: 'Edited', value: actionCounts.Edited, color: 'var(--sal-warning)' },
    ].filter(item => item.value > 0);

    const lineData = Object.keys(timeline)
       .map(k => timeline[k])
       .reverse(); // assuming logs are newest-first, we want timeline oldest-first

    return { barData, lineData };
  }, [filteredLogs]);

  // Helper styles
  const getBadgeClass = (reason) => {
    const r = (reason || '').toLowerCase();
    if (r.includes('restock') || r.includes('return') || r.includes('found')) return { className: 'sal-badge-restock', icon: <RefreshCw size={12} /> };
    if (r.includes('sale') || r.includes('sold')) return { className: 'sal-badge-sale', icon: <ShoppingCart size={12} /> };
    if (r.includes('delete') || r.includes('damage') || r.includes('used')) return { className: 'sal-badge-deleted', icon: <Trash2 size={12} /> };
    if (r.includes('edit')) return { className: 'sal-badge-edited', icon: <Edit3 size={12} /> };
    return { className: 'sal-badge-default', icon: <Activity size={12} /> };
  };

  const exportCSV = () => {
    const headers = ['Date', 'Action', 'Product', 'Quantity', 'Performed By', 'Role'];
    const rows = filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.reason || 'Movement',
        log.product?.name || log.productName || 'Unknown Product',
        log.quantityMoved || 0,
        log.movedBy?.fullName || 'System',
        log.movedBy?.role || 'Staff'
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sal-layout">
      
      {/* Header section */}
      <div className="sal-header">
        <div>
          <h1 className="sal-title">System Audit Logs</h1>
          <p className="sal-subtitle">Track comprehensive movement and inventory adjustments</p>
        </div>
        <div className="sal-filters">
          <div className="sal-input-group">
            <Search className="sal-input-icon" size={16} />
            <input 
              type="text" 
              className="sal-input"
              placeholder="Search product, action, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="sal-input-group" style={{ width: 'auto' }}>
            <Filter className="sal-input-icon" size={16} style={{ left: 10 }} />
            <select 
              className="sal-select" 
              style={{ paddingLeft: '32px' }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="All">All Actions</option>
              <option value="Restock">Restock / Return</option>
              <option value="Sale">Sales</option>
              <option value="Delete">Delete / Damage</option>
              <option value="Edited">Edited</option>
            </select>
          </div>

          <div className="sal-input-group" style={{ width: 'auto' }}>
            <Calendar className="sal-input-icon" size={16} style={{ left: 10 }} />
            <select 
              className="sal-select" 
              style={{ paddingLeft: '32px' }}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="All">All Time</option>
            </select>
          </div>

          <button className="sal-btn sal-btn-primary" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Charts section */}
      {!loading && filteredLogs.length > 0 && (
        <div className="sal-charts-grid">
          {/* Bar Chart: Action Distribution */}
          <div className="sal-card">
            <h3 className="sal-card-title"><BarChart2 size={18} /> Actions Breakdown</h3>
            <div className="sal-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sal-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--sal-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--sal-text-muted)' }} />
                  <RechartsTooltip cursor={{ fill: 'var(--sal-bg)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--sal-border)' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {chartData.barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart: Activity Timeline */}
          <div className="sal-card">
            <h3 className="sal-card-title"><Activity size={18} /> Activity Timeline</h3>
            <div className="sal-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--sal-border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--sal-text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--sal-text-muted)' }} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--sal-border)' }} />
                  <Line type="monotone" dataKey="actions" stroke="var(--sal-primary)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Table section */}
      <div className="sal-table-container">
        <div className="sal-table-scroll">
          <table className="sal-table">
            <thead>
              <tr>
                <th className="sal-th-sortable" onClick={() => toggleSort('date')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Date & Time <ArrowUpDown size={12} style={{ opacity: sortConfig.key === 'date' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th>Action</th>
                <th>Product</th>
                <th className="sal-th-sortable" onClick={() => toggleSort('quantity')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Quantity <ArrowUpDown size={12} style={{ opacity: sortConfig.key === 'quantity' ? 1 : 0.4 }} />
                  </div>
                </th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="5" style={{ padding: 0 }}>
                    <div className="sal-skeleton-row"></div>
                  </td>
                </tr>
              ))}
              
              {!loading && paginatedLogs.map((log) => {
                 const date = new Date(log.createdAt);
                 const badge = getBadgeClass(log.reason);
                 return (
                  <tr key={log._id}>
                    <td>
                      <div className="sal-cell-time">{date.toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sal-text-muted)' }}>{date.toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <span className={`sal-badge ${badge.className}`}>
                        {badge.icon} {log.reason || 'Movement'}
                      </span>
                    </td>
                    <td className="sal-cell-product">
                      {log.product?.name || log.productName || 'Unknown Product'}
                    </td>
                    <td>
                      <span className="sal-qty-pill">{log.quantityMoved || 0}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{log.movedBy?.fullName || 'System'}</span>
                        {log.movedBy?.role && (
                          <span className="sal-role-badge">{log.movedBy.role}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
          
          {!loading && filteredLogs.length === 0 && (
            <div className="sal-empty">
              <div className="sal-empty-icon">
                <FileX size={32} color="var(--sal-text-lighter)" />
              </div>
              <h3>No logs found</h3>
              <p>We couldn't find any audit logs matching your current filters.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="sal-pagination">
            <div className="sal-page-info">
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</strong> of <strong>{filteredLogs.length}</strong> logs
            </div>
            <div className="sal-page-actions">
              <button 
                className="sal-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                className="sal-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
