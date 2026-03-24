import React from 'react';
import { Settings, Shield, Bell, Database, Globe, RefreshCcw } from 'lucide-react';

export default function SystemConfig() {
    const configItems = [
        { icon: Settings, title: "General Settings", desc: "System name, timezone, and regional defaults." },
        { icon: SecurityPolicy, title: "Security & Permissions", desc: "Password policies and session management." },
        { icon: Bell, title: "Notification Center", desc: "Email and real-time alert configurations." },
        { icon: Database, title: "Database & Backups", desc: "Maintenance tasks and automated backup scheduling." },
        { icon: Globe, title: "API Configuration", desc: "Manage external integrations and API keys." },
        { icon: RefreshCcw, title: "System Updates", desc: "Check for new versions and review update logs." }
    ];

    function SecurityPolicy({ size }) { return <Shield size={size} />; } // Local component fix

    return (
        <div className="ap-fade-in">
            <div className="ap-page-header">
                <h1 className="ap-page-title">System Configuration</h1>
                <p className="ap-page-subtitle">Fine-tune internal parameters and security policies.</p>
            </div>

            <div className="ap-stats-grid">
                {configItems.map((item, idx) => (
                    <div key={idx} className="ap-card ap-stat-card" style={{ cursor: 'pointer', textAlign: 'left', minHeight: '140px' }}>
                        <div className="ap-stat-icon ap-badge-blue">
                            <item.icon size={22} />
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <div className="ap-card-title" style={{ marginBottom: '4px', fontSize: '14px' }}>{item.title}</div>
                            <p style={{ fontSize: '12px', color: 'var(--ap-text-muted)', lineHeight: '1.4' }}>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ap-card">
                <div className="ap-card-title">System Status</div>
                <div style={{ display: 'flex', gap: '30px', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="ap-dot ap-dot-green"></span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Backend Server: Online</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="ap-dot ap-dot-green"></span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Database: Connected</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="ap-dot ap-dot-green"></span>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Storage: Healthy (42%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
