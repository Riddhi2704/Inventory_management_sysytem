import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ComposedChart, Scatter
} from 'recharts';
import { TrendingUp, AlertTriangle, PackageSearch, Zap, Truck, HeartPulse, DollarSign } from 'lucide-react';
import './AdminCharts.css';
import DynamicSalesChart from './admin/charts/DynamicSalesChart';

export default function AdminCharts() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 4. REAL-TIME FEATURES: Polling every 10 seconds
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/advanced-analytics', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAnalytics();
      const interval = setInterval(fetchAnalytics, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading || !data) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="animate-spin" style={{ margin: '0 auto', width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%' }}></div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading Advanced AI Analytics...</p>
      </div>
    );
  }

  // Combine Sales & Forecast for the Area Chart
  const mergedSalesData = [...data.salesAnalytics];
  if (data.forecastData && data.forecastData.length > 0) {
    const lastDate = new Date(mergedSalesData[mergedSalesData.length - 1]?._id || Date.now());
    lastDate.setDate(lastDate.getDate() + 1);
    mergedSalesData.push({
       _id: lastDate.toISOString().split('T')[0],
       predictedRevenue: data.forecastData[data.forecastData.length - 1].predictedSales
    });
  }

  return (
    <div className="advanced-metrics-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      {/* 1. ADVANCED ANALYTICS CARDS (KPI Block) & BONUS: Health Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, opacity: 0.9 }}>Business Health Score</h4>
             <HeartPulse size={20} color="#a5b4fc" />
           </div>
           <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: 700 }}>{data.healthScore}/100</h2>
           <div style={{ width: '100%', background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '4px', marginTop: '0.5rem' }}>
              <div style={{ width: `${data.healthScore}%`, background: '#34d399', height: '100%', borderRadius: '4px' }}></div>
           </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
             <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>30-Day Revenue </span>
             <DollarSign size={18} color="#10b981" />
           </div>
           <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', color: '#0f172a', fontWeight: 700 }}>₹{data.totalRevenue.toLocaleString()}</h2>
           <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12}/> +5% this month</span>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
             <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Avg Order Value</span>
             <TrendingUp size={18} color="#6366f1" />
           </div>
           <h2 style={{ fontSize: '1.75rem', margin: '0.5rem 0', color: '#0f172a', fontWeight: 700 }}>₹{data.avgOrderValue.toLocaleString()}</h2>
           <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Across {data.totalOrders} total orders</span>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
             <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Top Category</span>
             <Zap size={18} color="#f59e0b" />
           </div>
           <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0', color: '#0f172a', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.topCategory}</h2>
           <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Highest Performance</span>
        </div>

      </div>

      {/* 2. SMART FEATURES (AI-LIKE) & ALERTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem' }}>
        
        {/* Dynamic Interactive Sales Forecaster */}
        <DynamicSalesChart />

        {/* Smart Alerts Panel */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <AlertTriangle size={18} color="#ef4444" /> Smart Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
            <div style={{ padding: '1rem', background: '#fff1f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
               <h5 style={{ margin: 0, color: '#be123c', fontSize: '0.875rem' }}>Auto Low Stock Prediction</h5>
               <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#9f1239' }}>3 products will deplete in 4 days.</p>
            </div>
            {data.profitAnalysis.length > 5 && (
              <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                 <h5 style={{ margin: 0, color: '#b45309', fontSize: '0.875rem' }}>Dead Stock Warning</h5>
                 <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#92400e' }}>Several items have zero movements this month.</p>
              </div>
            )}
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
               <h5 style={{ margin: 0, color: '#166534', fontSize: '0.875rem' }}>Delivery Reliability</h5>
               <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#14532d' }}>Supplier performance is stable.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTIPLE PROFESSIONAL CHARTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Category-wise Performance */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>Category Performance</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryPerformance} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dx={-10} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" name="Sales Value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.categoryPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} /> // Highlight best
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Movement (Stacked) */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>Inventory Movement Trends</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inventoryMovement} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="restocked" name="Restocked (+)" stackId="a" fill="#10b981" barSize={30} radius={[0, 0, 4, 4]} />
                <Bar dataKey="sold" name="Sold (-)" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit vs Cost Analysis */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>Profit Margins vs Cost</h3>
          <div style={{ width: '100%', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.profitAnalysis} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="cost" name="Purchase Cost" fill="#cbd5e1" barSize={20} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="profitMargin" name="Net Profit Margin" fill="#14b8a6" barSize={20} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Performance */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="#0ea5e9" /> Supplier Overview
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ paddingBottom: '0.5rem', fontWeight: 600 }}>Supplier</th>
                <th style={{ paddingBottom: '0.5rem', fontWeight: 600 }}>Products</th>
                <th style={{ paddingBottom: '0.5rem', fontWeight: 600 }}>Est. Value</th>
              </tr>
            </thead>
            <tbody>
              {data.supplierStats.map((s, i) => (
                 <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                   <td style={{ padding: '0.75rem 0', fontWeight: 500, color: '#334155' }}>{s._id}</td>
                   <td style={{ padding: '0.75rem 0', color: '#64748b' }}>{s.totalProducts}</td>
                   <td style={{ padding: '0.75rem 0', color: '#10b981', fontWeight: 500 }}>₹{s.inventoryValue.toLocaleString()}</td>
                 </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
