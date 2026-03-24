import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tag, TrendingUp } from 'lucide-react';

export default function SalesChart({ data, loading }) {
  if (loading) return <div className="ac-chart-container ac-skeleton"></div>;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="ac-tooltip">
          <div className="ac-tooltip-label">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="ac-tooltip-item" style={{ color: entry.color }}>
              <span className="ac-tooltip-color" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ac-panel ac-panel-narrow">
      <div className="ac-panel-header">
        <div className="ac-panel-title-wrapper">
          <div className="ac-icon-box success"><Tag size={20} /></div>
          <div>
            <h3 className="ac-panel-title">Promotional Sales</h3>
            <div className="ac-panel-subtitle">Visitors vs Store Conversion</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', marginTop: '12px', marginBottom: '16px' }}>
         <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ac-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Visitors</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>24,192</div>
         </div>
         <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--ac-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Store Sales</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>8,421</div>
         </div>
      </div>

      <div className="ac-chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--ac-border)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--ac-text-muted)', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#10b981" fillOpacity={1} fill="url(#colorVisitors)" />
            <Area type="monotone" dataKey="store" name="Store Sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStore)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
