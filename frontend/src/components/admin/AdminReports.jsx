import React from 'react';
import ProductList from '../ProductList';
import AdminAlerts from '../AdminAlerts';
import AdminAuditLogs from '../AdminAuditLogs';

export default function AdminReports({ mode }) {
    return (
        <div className="ap-fade-in">
            <div className="ap-page-header">
                <h1 className="ap-page-title">
                    {mode === 'inventory' ? 'Inventory Reports' : 
                     mode === 'alerts' ? 'Product Monitoring' : 
                     'System Audit Logs'}
                </h1>
                <p className="ap-page-subtitle">
                    {mode === 'inventory' ? 'View and manage the complete product catalog.' : 
                     mode === 'alerts' ? 'Monitor low stock, out-of-stock, and expiration alerts.' : 
                     'Review security events and system changes.'}
                </p>
            </div>

            <div className="ap-card">
                {mode === 'inventory' && <ProductList />}
                {mode === 'alerts' && <AdminAlerts />}
                {mode === 'reports' && <AdminAuditLogs />}
            </div>
        </div>
    );
}
