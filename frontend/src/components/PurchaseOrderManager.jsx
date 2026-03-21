import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart, Plus, Minus, Loader2, FileText,
  Search, RefreshCw, CheckCircle2, AlertCircle,
  Package, User as UserIcon, Calendar, IndianRupee,
  Filter, ArrowRight
} from 'lucide-react';
import textData from '../constants/textData';
import './PurchaseOrderManager.css';

export default function PurchaseOrderManager() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    supplier: '',
    productName: '',
    quantity: '1',
    price: '',
    totalAmount: 0
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [supRes, prodRes, orderRes] = await Promise.all([
        axios.get('http://localhost:5001/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5001/api/products', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5001/api/purchase-orders', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);

      const supplierData = Array.isArray(supRes.data) ? supRes.data : (supRes.data.suppliers || []);
      const productData = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []);

      setSuppliers(supplierData);
      setProducts(productData.filter(p => p.status === 'Active'));
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user?.token]);

  // Auto-calculate Total Amount
  useEffect(() => {
    const qty = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    setFormData(prev => ({ ...prev, totalAmount: (qty * price).toFixed(2) }));
  }, [formData.quantity, formData.price]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const adjustQuantity = (amount) => {
    const currentQty = parseInt(formData.quantity) || 0;
    const newQty = Math.max(1, currentQty + amount);
    setFormData({ ...formData, quantity: newQty.toString() });
  };

  const handleReset = () => {
    setFormData({
      supplier: '',
      productName: '',
      quantity: '1',
      price: '',
      totalAmount: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.productName || !formData.quantity || !formData.price) {
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5001/api/purchase-orders', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showToast(textData.purchaseOrder.form.successAlert);
      handleReset();
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.items[0]?.productName || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const isFormValid = formData.supplier && formData.productName && formData.quantity > 0 && formData.price > 0;

  return (
    <div className="po-container">
      {/* Header Section */}
      <div className="po-header">
        <h1 className="po-title">{textData.purchaseOrder.title}</h1>
        <p className="po-subtitle">{textData.purchaseOrder.subtitle}</p>
      </div>

      <div className="po-layout">
        {/* Create Order Card */}
        <div className="po-card">
          <div className="po-card-header">
            <div style={{ background: '#eef2ff', padding: '8px', borderRadius: '8px' }}>
              <Plus size={20} color="#4f46e5" />
            </div>
            <h2 className="po-card-title">{textData.purchaseOrder.newOrder}</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="po-form-group">
              <label className="po-label">{textData.purchaseOrder.form.selectSupplier}</label>
              <select
                required
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="po-select"
              >
                <option value="">{suppliers.length === 0 ? "No Suppliers Found" : textData.purchaseOrder.form.chooseSupplier}</option>
                {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>

            <div className="po-form-group">
              <label className="po-label">{textData.purchaseOrder.form.selectProduct}</label>
              <select
                required
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="po-select"
              >
                <option value="">{products.length === 0 ? "No Active Products" : textData.purchaseOrder.form.chooseProduct}</option>
                {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="po-form-group">
                <label className="po-label">{textData.purchaseOrder.form.qty}</label>
                <div className="po-qty-control">
                  <button type="button" className="po-qty-btn" onClick={() => adjustQuantity(-1)}><Minus size={14} /></button>
                  <input
                    required
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="po-input po-qty-input"
                  />
                  <button type="button" className="po-qty-btn" onClick={() => adjustQuantity(1)}><Plus size={14} /></button>
                </div>
              </div>
              <div className="po-form-group">
                <label className="po-label">{textData.purchaseOrder.form.price}</label>
                <div className="po-price-wrapper">
                  <span className="po-price-icon">₹</span>
                  <input
                    required
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="po-input po-price-input"
                  />
                </div>
              </div>
            </div>

            <div className="po-total-box">
              <span className="po-total-label">{textData.purchaseOrder.form.total}</span>
              <span className="po-total-value">₹{formData.totalAmount}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="po-submit-btn"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> {textData.purchaseOrder.form.createButton}</>}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="po-list-area">
          <div className="po-table-controls">
            <div className="po-search-wrapper">
              <Search className="po-search-icon" size={18} />
              <input
                type="text"
                placeholder={textData.purchaseOrder.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="po-input po-search-input"
              />
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={16} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
              <select
                className="po-select po-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ paddingLeft: '36px' }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Created (Pending)</option>
                <option value="Approved">Approved</option>
                <option value="Received">Received</option>
              </select>
            </div>
            <button className="po-qty-btn" onClick={fetchData} title="Refresh List">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="po-table-container">
            <div style={{ overflowX: 'auto' }}>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                  <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 16px', color: '#4f46e5' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Fetching purchase orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <ShoppingCart size={32} color="#cbd5e1" style={{ margin: '0 auto' }} />
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1e293b' }}>{textData.purchaseOrder.empty.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>{textData.purchaseOrder.empty.message}</p>
                </div>
              ) : (
                <table className="po-table">
                  <thead>
                    <tr>
                      <th>{textData.purchaseOrder.table.orderId}</th>
                      <th>{textData.purchaseOrder.table.supplier}</th>
                      <th>{textData.purchaseOrder.table.product}</th>
                      <th>{textData.purchaseOrder.table.qty}</th>
                      <th style={{ textAlign: 'right' }}>{textData.purchaseOrder.table.total}</th>
                      <th style={{ textAlign: 'center' }}>{textData.purchaseOrder.table.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <span style={{ fontWeight: '700', color: '#4f46e5', background: '#eef2ff', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                            {order.orderId}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#64748b' }}>
                              {order.supplier?.name?.charAt(0) || 'S'}
                            </div>
                            <span style={{ fontWeight: '600' }}>{order.supplier?.name || "N/A"}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Package size={14} color="#94a3b8" />
                            <span>{order.items[0]?.productName}</span>
                          </div>
                        </td>
                        <td><span style={{ fontWeight: '600' }}>{order.items[0]?.quantity}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: '800', color: '#1e293b' }}>₹{order.totalAmount}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`po-badge badge-${order.status?.toLowerCase() || 'created'}`}>
                            {order.status || 'Created'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="po-toast animate-fade-in">
          <CheckCircle2 size={20} color="#22c55e" />
          <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
