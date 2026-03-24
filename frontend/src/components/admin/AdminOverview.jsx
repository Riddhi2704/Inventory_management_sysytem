import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import AdminCharts from '../AdminCharts';
import AdminAlerts from '../AdminAlerts';
import AdminAuditLogs from '../AdminAuditLogs';

export default function AdminOverview({ onNavigate }) {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user.token]);

    const StatCard = ({ label, value, icon: Icon, type, change, isDown }) => (
        <div className="ap-stat-card">
            <div className={`ap-stat-icon ap-badge-${type}`}>
                <Icon size={22} />
            </div>
            <div>
                <div className="ap-stat-label">{label}</div>
                <div className="ap-stat-value">{value}</div>
            </div>
            {change && (
                <div className={`ap-stat-change ${isDown ? 'down' : 'up'}`}>
                    {isDown ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                    {change}
                </div>
            )}
        </div>
    );

    if (loading) return <div className="ap-fade-in">Loading overview...</div>;

    return (
        <div className="ap-fade-in">
            <div className="ap-page-header">
                <h1 className="ap-page-title">Welcome back, {user?.fullName || 'Admin'}</h1>
                <p className="ap-page-subtitle">Here's what's happening with your system today.</p>
            </div>

            <div className="ap-stats-grid">
                <StatCard 
                    label="Total Products" 
                    value={stats?.totalProducts || 0} 
                    icon={Package} 
                    type="blue" 
                    change="+2.4%" 
                />
                <StatCard 
                    label="Inventory Value" 
                    value={`₹${(stats?.totalInventoryValue || 0).toLocaleString()}`} 
                    icon={DollarSign} 
                    type="green" 
                    change="+1.2%" 
                />
                <StatCard 
                    label="Active Categories" 
                    value={stats?.totalCategories || 0} 
                    icon={LayoutDashboard} 
                    type="purple" 
                />
                <StatCard 
                    label="Critical Alerts" 
                    value={stats?.outOfStockProducts || 0} 
                    icon={AlertTriangle} 
                    type="red" 
                    change={stats?.outOfStockProducts > 0 ? "Action required" : "All good"}
                    isDown={stats?.outOfStockProducts > 0}
                />
            </div>

            <div className="ap-charts-row">
                <div className="ap-card">
                    <div className="ap-card-title">System Analytics</div>
                    <AdminCharts />
                </div>
                <div className="ap-card">
                    <div className="ap-card-title">Critical Monitoring</div>
                    <AdminAlerts />
                </div>
            </div>

            <div className="ap-card">
                <div className="ap-card-title">
                    <span>Recent System Activity</span>
                    <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => onNavigate('reports')}>
                        View all logs
                    </button>
                </div>
                <div className="ap-table-wrap">
                    <AdminAuditLogs />
                </div>
            </div>
        </div>
    );
}
