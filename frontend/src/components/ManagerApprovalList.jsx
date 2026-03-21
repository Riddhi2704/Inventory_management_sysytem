import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import textData from '../constants/textData';

export default function ManagerApprovalList() {
  const { user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores the product ID being acted upon

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/products?status=Pending Approval', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleStatusUpdate = async (productId, newStatus) => {
    setActionLoading(productId);
    try {
      await axios.put(`http://localhost:5001/api/products/${productId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Remove from list or refresh
      fetchPendingProducts();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="table-card" style={{ border: '1px solid var(--sd-border-color, #e5e7eb)', boxShadow: 'var(--sd-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))' }}>
      
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--sd-border-color, #e5e7eb)', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary, #111827)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock className="w-5 h-5 text-indigo-600" />
            {textData.managerApprovals.title}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #6b7280)', marginTop: '0.25rem' }}>{textData.managerApprovals.subtitle}</p>
        </div>
        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' }}>
          {pendingProducts.length} {textData.managerApprovals.pendingLabel}
        </div>
      </div>

      {/* Table Area */}
      <div style={{ overflowX: 'auto' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>{textData.managerApprovals.table.img}</th>
              <th>{textData.managerApprovals.table.sku}</th>
              <th>{textData.managerApprovals.table.name}</th>
              <th>{textData.managerApprovals.table.category}</th>
              <th>{textData.managerApprovals.table.brand}</th>
              <th style={{ textAlign: 'right' }}>{textData.managerApprovals.table.buyPrice}</th>
              <th style={{ textAlign: 'right' }}>{textData.managerApprovals.table.sellPrice}</th>
              <th style={{ textAlign: 'center' }}>{textData.managerApprovals.table.qty}</th>
              <th>{textData.managerApprovals.table.addedBy}</th>
              <th>{textData.managerApprovals.table.dateAdded}</th>
              <th style={{ textAlign: 'center' }}>{textData.managerApprovals.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '4rem' }}>
                  <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#6366f1' }} />
                  <p style={{ color: '#64748b' }}>{textData.managerApprovals.loading}</p>
                </td>
              </tr>
            ) : pendingProducts.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '50%' }}>
                      <CheckCircle size={40} color="#10b981" />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>{textData.managerApprovals.empty.title}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{textData.managerApprovals.empty.message}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              pendingProducts.map((product) => (
                <tr key={product._id} className="row-hover">
                  <td style={{ paddingLeft: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      {product.productImage ? (
                        <img src={product.productImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Search size={16} color="#94a3b8" />
                      )}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5' }}>{product.productId}</td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>{product.name}</td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', color: '#475569' }}>
                      {product.category?.name || 'Misc'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{product.brand || '---'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>₹{product.purchasePrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>₹{product.sellingPrice.toLocaleString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                      {product.quantity}
                      <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '0.25rem', textTransform: 'uppercase' }}>{product.unitType || 'pcs'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#ffedd5', color: '#9a3412', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {(product.addedBy?.fullName || 'S')[0]}
                      </div>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{product.addedBy?.fullName || 'Staff'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>{formatDate(product.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                      {actionLoading === product._id ? (
                        <Loader2 className="animate-spin" size={20} color="#6366f1" />
                      ) : (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(product._id, 'Active')}
                            style={{ padding: '0.5rem', border: 'none', background: '#dcfce7', color: '#166534', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
                            title={textData.managerApprovals.tooltips.approve}
                            onMouseOver={(e) => e.currentTarget.style.background = '#bbf7d0'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#dcfce7'}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(product._id, 'Rejected')}
                            style={{ padding: '0.5rem', border: 'none', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}
                            title={textData.managerApprovals.tooltips.reject}
                            onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Styles for row hover */}
      <style>{`
        .modern-table .row-hover:hover td {
          background-color: #f8fafc !important;
          cursor: pointer;
        }
        .modern-table th {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
