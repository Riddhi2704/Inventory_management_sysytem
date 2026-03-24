import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Download, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import './AdminAuditLogs.css';

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5001/api/logs/movement', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs dynamically", err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.token) {
      fetchLogs();
    }
  }, [user]);

  // Determine Badge Styling Rules Based on Keyword
  const getBadgeType = (reason) => {
    const lowerReason = (reason || '').toLowerCase();
    if (lowerReason.includes('restock') || lowerReason.includes('return') || lowerReason.includes('found')) return 'restock';
    if (lowerReason.includes('delete') || lowerReason.includes('damage') || lowerReason.includes('sent out')) return 'deleted';
    if (lowerReason.includes('sale') || lowerReason.includes('sold')) return 'sale';
    if (lowerReason.includes('used')) return 'used';
    if (lowerReason.includes('edit')) return 'edited';
    return 'default';
  };

  // Filter application
  const filteredLogs = logs.filter(log => {
    // 1. Search filter
    const searchVal = search.toLowerCase();
    const actionSearch = (log.reason || '').toLowerCase().includes(searchVal);
    const productSearch = (log.product?.name || log.productName || '').toLowerCase().includes(searchVal);
    const matchesSearch = actionSearch || productSearch;

    // 2. Action dropdown filter
    let matchesAction = true;
    if (actionFilter !== 'All') {
      const type = getBadgeType(log.reason);
      matchesAction = type === actionFilter.toLowerCase();
    }

    // 3. Date dropdown filter
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const logDate = new Date(log.createdAt);
      const today = new Date();
      if (dateFilter === 'Today') {
        matchesDate = logDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'Last 7 Days') {
        const last7 = new Date();
        last7.setDate(today.getDate() - 7);
        matchesDate = logDate >= last7;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  // Calculate Pagination Data
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const currentData = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  
  useEffect(() => {
    // Reset page whenever filter changes
    setCurrentPage(1);
  }, [search, dateFilter, actionFilter]);

  // Export to CSV Functionality
  const exportCSV = () => {
    const headers = ['Date & Time', 'Action/Reason', 'Product Detail', 'Quantity', 'Performed By', 'Role'];
    const rows = filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleString(),
        log.reason || 'Movement',
        `"${log.product?.name || log.productName || 'Unknown Item'}"`,
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
    link.setAttribute("download", `System_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="audit-container">
      <div className="audit-card">
        
        {/* Header Section */}
        <div className="audit-header">
          <div className="audit-title-section">
            <h2>
              <ShieldAlert size={22} className="text-slate-800" style={{ color: '#1f2937' }} /> 
              System Audit Logs
            </h2>
            <p className="audit-subtitle">Track comprehensive movement and inventory adjustments</p>
          </div>
          
          <div className="audit-toolbar">
            <div className="audit-search-wrapper">
              <Search size={18} className="audit-search-icon" />
              <input 
                type="text" 
                className="audit-search-input"
                placeholder="Search product or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="audit-filters">
              <select className="audit-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="All">All Actions</option>
                <option value="Restock">Restock</option>
                <option value="Sale">Sale</option>
                <option value="Deleted">Deleted</option>
                <option value="Used">Used</option>
                <option value="Edited">Edited</option>
              </select>
              
              <select className="audit-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
              </select>
              
              <button className="audit-btn-export" onClick={exportCSV}>
                <Download size={16} /> Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Action/Reason</th>
                <th>Product Detail</th>
                <th>Quantity</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="audit-skeleton">
                    <td><div className="audit-skeleton-line" /><div className="audit-skeleton-line short" /></td>
                    <td><div className="audit-skeleton-line" /></td>
                    <td><div className="audit-skeleton-line" /><div className="audit-skeleton-line short" /></td>
                    <td><div className="audit-skeleton-line short" /></td>
                    <td><div className="audit-skeleton-line" /><div className="audit-skeleton-line short" /></td>
                  </tr>
                ))
              ) : currentData.length > 0 ? (
                currentData.map(log => {
                  const type = getBadgeType(log.reason);
                  const dateObj = new Date(log.createdAt);
                  
                  let badgeText = log.reason || 'Movement';
                  let productName = log.product?.name || log.productName;
                  let productCategory = log.product?.category || (log.categoryName ? log.categoryName : 'Uncategorized');
                  let displayQuantity = log.quantityMoved;
                  let displayUnit = log.product?.unitType || 'pcs';

                  if (!log.product && typeof badgeText === 'string' && badgeText.startsWith('Deleted: ')) {
                    productName = badgeText.substring(9).trim();
                    badgeText = 'Deleted';
                    displayQuantity = '-';
                    displayUnit = '';
                  } else if (!productName) {
                    productName = 'Unknown Item';
                  }

                  const displayName = productName.length > 30 ? productName.substring(0, 30) + '...' : productName;

                  return (
                    <tr key={log._id}>
                      <td>
                        <div style={{ fontWeight: 500, color: '#111827' }}>
                          {dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div className={`audit-badge audit-badge-${type}`}>
                          <div className="audit-dot"></div>
                          {badgeText}
                        </div>
                      </td>
                      <td>
                        <div className="product-detail-cell">
                          <span 
                            className="product-name has-tooltip" 
                            title={productName}
                          >
                            {displayName}
                          </span>
                          <span className="product-sku">{productCategory}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#111827' }}>{displayQuantity}</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                          {displayUnit}
                        </span>
                      </td>
                      <td>
                        <div className="user-detail-cell">
                          <span className="user-name">{log.movedBy?.fullName || 'System'}</span>
                          <span className="user-role">{log.movedBy?.role || 'Automated'}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="5">
                    <div className="audit-empty-state">
                      <div className="audit-empty-icon">
                        <FileText size={28} />
                      </div>
                      <div className="audit-empty-text">No Data Found</div>
                      <div className="audit-empty-subtext">There are no audit logs matching your current filters. Try adjusting your search.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredLogs.length > 0 && (
          <div className="audit-pagination">
            <div className="audit-page-info">
              Showing <span>{((currentPage - 1) * itemsPerPage) + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span>{filteredLogs.length}</span> logs
            </div>
            <div className="audit-page-controls">
              <button 
                className="audit-page-btn" 
                onClick={handlePrev} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="audit-page-btn" 
                onClick={handleNext} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
