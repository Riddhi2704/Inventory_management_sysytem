import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Package, AlertTriangle, TrendingUp, TrendingDown, DollarSign, UserCog, Building } from 'lucide-react';
import AdminCharts from '../AdminCharts';
import AdminAuditLogs from '../AdminAuditLogs';

export default function AdminOverview({ onNavigate }) {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [extraStats, setExtraStats] = useState({ staff: 0, managers: 0, organizations: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [resStats, resStaff, resManagers, resOrgs] = await Promise.all([
                    axios.get('http://localhost:5001/api/admin/dashboard', { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get('http://localhost:5001/api/admin/total-staff', { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get('http://localhost:5001/api/admin/total-managers', { headers: { Authorization: `Bearer ${user.token}` } }),
                    axios.get('http://localhost:5001/api/admin/total-organizations', { headers: { Authorization: `Bearer ${user.token}` } })
                ]);
                setStats(resStats.data);
                setExtraStats({
                    staff: resStaff.data.count,
                    managers: resManagers.data.count,
                    organizations: resOrgs.data.count
                });
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user.token]);

    const StatCard = ({ label, value, icon: Icon, type, change, isDown, onClick }) => (
        <div className="ap-stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s', ...(onClick ? { ':hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } } : {}) }}>
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
                    value={(stats?.outOfStockProducts || 0) + (stats?.lowStockProducts || 0)} 
                    icon={AlertTriangle} 
                    type="red" 
                    change={((stats?.outOfStockProducts || 0) + (stats?.lowStockProducts || 0)) > 0 ? "Action required" : "All good"}
                    isDown={((stats?.outOfStockProducts || 0) + (stats?.lowStockProducts || 0)) > 0}
                    onClick={() => onNavigate('alerts')}
                />
                <StatCard 
                    label="Total Managers" 
                    value={extraStats.managers} 
                    icon={UserCog} 
                    type="blue" 
                />
                <StatCard 
                    label="Total Staff" 
                    value={extraStats.staff} 
                    icon={Users} 
                    type="purple" 
                />
                <StatCard 
                    label="Total Organizations" 
                    value={extraStats.organizations} 
                    icon={Building} 
                    type="green" 
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <AdminCharts />
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
