import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export default function InventoryChart({ data, loading }) {
  if (loading) return <div className="ac-chart-container ac-skeleton"></div>;

  const COLORS = {
    'In Stock': '#10b981',
    'Low Stock': '#f59e0b',
    'Out of Stock': '#ef4444'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="ac-tooltip">
          <div className="ac-tooltip-label">{data.name}</div>
          <div className="ac-tooltip-item" style={{ color: COLORS[data.name] }}>
            <span className="ac-tooltip-color" style={{ backgroundColor: COLORS[data.name] }}></span>
            {data.value} Products
          </div>
        </div>
      );
    }
    return null;
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="ac-panel ac-panel-half">
      <div className="ac-panel-header">
        <div className="ac-panel-title-wrapper">
          <div className="ac-icon-box warning"><AlertTriangle size={20} /></div>
          <div>
            <h3 className="ac-panel-title">Inventory Status</h3>
            <div className="ac-panel-subtitle">Current stock health</div>
          </div>
        </div>
      </div>

      <div className="ac-chart-container" style={{ minHeight: '220px', position: 'relative', marginTop: '16px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ac-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Items</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {data.map(item => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[item.name] }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{item.value}</span>
              {item.name === 'Out of Stock' && item.value > 0 && <span className="ac-badge danger">Action Req</span>}
              {item.name === 'Low Stock' && item.value > 0 && <span className="ac-badge warning">Warning</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
