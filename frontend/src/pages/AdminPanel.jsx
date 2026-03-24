import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Package, AlertTriangle, TrendingUp,
    LogOut, Bell, Settings, BarChart2, FileText, Search, X, Menu, ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import AdminReports from '../components/admin/AdminReports';
import BusinessAnalysis from '../components/admin/BusinessAnalysis';
import SystemConfig from '../components/admin/SystemConfig';
import SystemAuditLogs from '../components/admin/SystemAuditLogs';

const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
    { id: 'users', label: 'User Management', icon: Users, section: 'main' },
    { id: 'inventory', label: 'Inventory Reports', icon: Package, section: 'main' },
    { id: 'alerts', label: 'Product Monitoring', icon: AlertTriangle, section: 'main' },
    { id: 'analysis', label: 'Business Analysis', icon: BarChart2, section: 'insights' },
    { id: 'reports', label: 'Reports & Exports', icon: FileText, section: 'insights' },
    { id: 'audit', label: 'System Audit Logs', icon: ClipboardList, section: 'system' },
    { id: 'config', label: 'System Config', icon: Settings, section: 'system' },
];

export default function AdminPanel() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [search, setSearch] = useState('');

    const handleLogout = () => { logout(); navigate('/login'); };

    const sections = ['main', 'insights', 'system'];
    const sectionLabels = { main: 'Main Menu', insights: 'Analytics', system: 'Administration' };

    return (
        <div className="ap-root">
            {/* ===== SIDEBAR ===== */}
            <aside className="ap-sidebar" style={{ width: sidebarOpen ? 'var(--ap-sidebar-width)' : '72px' }}>
                <div className="ap-sidebar-logo">
                    <div className="ap-sidebar-logo-icon">IMS</div>
                    {sidebarOpen && (
                        <div>
                            <div className="ap-sidebar-logo-text">Admin Panel</div>
                            <div className="ap-sidebar-logo-sub">Inventory System</div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}
                    >
                        <Menu size={18} />
                    </button>
                </div>

                <nav className="ap-sidebar-nav">
                    {sections.map(section => (
                        <div key={section}>
                            {sidebarOpen && <div className="ap-nav-label">{sectionLabels[section]}</div>}
                            {NAV_ITEMS.filter(i => i.section === section).map(item => (
                                <button
                                    key={item.id}
                                    className={`ap-nav-btn${activeTab === item.id ? ' active' : ''}`}
                                    onClick={() => setActiveTab(item.id)}
                                    title={!sidebarOpen ? item.label : ''}
                                >
                                    <item.icon size={18} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="ap-sidebar-footer">
                    <button className="ap-nav-btn" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
                        <LogOut size={18} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ===== MAIN ===== */}
            <main className="ap-main" style={{ marginLeft: sidebarOpen ? 'var(--ap-sidebar-width)' : '72px' }}>
                {/* Header */}
                <header className="ap-header">
                    <div className="ap-header-left">
                        <span className="ap-header-title">
                            {NAV_ITEMS.find(i => i.id === activeTab)?.label || 'Dashboard'}
                        </span>
                        <div className="ap-search-wrap" style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
                            <Search className="ap-search-icon" size={16} />
                            <input
                                className="ap-search-input"
                                placeholder="Search anything..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="ap-header-right">
                        <button className="ap-icon-btn">
                            <Bell size={17} />
                            <span className="ap-notif-dot" />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid var(--ap-border)', paddingLeft: '14px' }}>
                            <div className="ap-avatar">{user?.fullName?.charAt(0) || 'A'}</div>
                            <div className="ap-user-info">
                                <span className="ap-user-name">{user?.fullName || 'Admin'}</span>
                                <span className="ap-user-role">System Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="ap-content ap-fade-in" key={activeTab}>
                    {activeTab === 'overview' && <AdminOverview onNavigate={setActiveTab} />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'inventory' && <AdminReports mode="inventory" />}
                    {activeTab === 'alerts' && <AdminReports mode="alerts" />}
                    {activeTab === 'analysis' && <BusinessAnalysis />}
                    {activeTab === 'reports' && <AdminReports mode="reports" />}
                    {activeTab === 'audit' && <SystemAuditLogs />}
                    {activeTab === 'config' && <SystemConfig />}
                </div>
            </main>
        </div>
    );
}