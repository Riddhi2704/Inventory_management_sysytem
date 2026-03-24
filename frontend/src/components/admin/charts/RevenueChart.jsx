import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

export default function RevenueChart({ data, loading }) {
  if (loading) return <div className="ac-chart-container ac-skeleton"></div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="ac-tooltip">
          <div className="ac-tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="ac-tooltip-item" style={{ color: entry.color }}>
              <span className="ac-tooltip-color" style={{ backgroundColor: entry.color }}></span>
              Revenue: ₹{entry.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="ac-panel ac-panel-wide">
      <div className="ac-panel-header">
        <div className="ac-panel-title-wrapper">
          <div className="ac-icon-box primary"><IndianRupee size={20} /></div>
          <div>
            <h3 className="ac-panel-title">Revenue Trend</h3>
            <div className="ac-panel-subtitle">Earnings comparison timeline</div>
          </div>
        </div>
        <div className="ac-growth up"><TrendingUp size={14} /> +12.5%</div>
      </div>
      
      <div className="ac-value-huge">
        ₹{totalRevenue.toLocaleString()}
      </div>

      <div className="ac-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ac-border)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--ac-border)', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'var(--ac-card-bg)' }} activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
