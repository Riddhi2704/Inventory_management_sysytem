import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp } from 'lucide-react';

export default function OrdersChart({ data, loading }) {
  if (loading) return <div className="ac-chart-container ac-skeleton"></div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ac-tooltip">
          <div className="ac-tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="ac-tooltip-item" style={{ color: entry.color }}>
              <span className="ac-tooltip-color" style={{ backgroundColor: entry.color }}></span>
              Orders: {entry.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  return (
    <div className="ac-panel ac-panel-wide">
      <div className="ac-panel-header">
        <div className="ac-panel-title-wrapper">
          <div className="ac-icon-box purple"><Package size={20} /></div>
          <div>
            <h3 className="ac-panel-title">Orders Overview</h3>
            <div className="ac-panel-subtitle">Volume of orders processed</div>
          </div>
        </div>
        <div className="ac-growth up"><TrendingUp size={14} /> +8.2%</div>
      </div>
      
      <div className="ac-value-huge">
        {totalOrders.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--ac-text-muted)', fontWeight: 500 }}>units</span>
      </div>

      <div className="ac-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ac-border)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--ac-bg-main)', opacity: 0.5 }} />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
