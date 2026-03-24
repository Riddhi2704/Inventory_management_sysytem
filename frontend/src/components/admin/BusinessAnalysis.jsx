import React from 'react';
import AdminCharts from '../AdminCharts';
import { BarChart2, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function BusinessAnalysis() {
    return (
        <div className="ap-fade-in">
            <div className="ap-page-header">
                <h1 className="ap-page-title">Business Analysis</h1>
                <p className="ap-page-subtitle">In-depth insights into system performance and growth trends.</p>
            </div>

            <div className="ap-stats-grid">
                <div className="ap-stat-card">
                    <div className="ap-stat-icon ap-badge-blue"><DollarSign size={20}/></div>
                    <div className="ap-stat-label">Projected Revenue</div>
                    <div className="ap-stat-value">₹4.2M</div>
                    <div className="ap-stat-change up"><TrendingUp size={14}/> +8.5%</div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon ap-badge-purple"><BarChart2 size={20}/></div>
                    <div className="ap-stat-label">Conversion Rate</div>
                    <div className="ap-stat-value">64.2%</div>
                    <div className="ap-stat-change up"><TrendingUp size={14}/> +2.1%</div>
                </div>
                <div className="ap-stat-card">
                    <div className="ap-stat-icon ap-badge-green"><Package size={20}/></div>
                    <div className="ap-stat-label">Stock Turnover</div>
                    <div className="ap-stat-value">4.2x</div>
                </div>
            </div>

            <div className="ap-card">
                <div className="ap-card-title">Advanced Performance Metrics</div>
                <AdminCharts />
            </div>
        </div>
    );
}
