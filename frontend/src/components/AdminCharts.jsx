import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, TrendingUp, Package, Tag, Layers } from 'lucide-react';

export default function AdminCharts() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const DONUT_COLORS = ['#3B82F6', '#E2E8F0']; // Blue and light gray for the gauge

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [productsRes, logsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products', { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get('http://localhost:5000/api/logs/movement', { headers: { Authorization: `Bearer ${user.token}` } })
        ]);

        const products = productsRes.data;
        const logs = logsRes.data;

        // 1. Movement Volume (Bar Chart - In vs Out)
        const trendMap = {};
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          trendMap[d.toISOString().split('T')[0]] = { in: 0, out: 0 };
        }

        logs.forEach(log => {
          const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
          if (trendMap[dateStr]) {
             if (['Restock', 'Found', 'Return'].includes(log.reason)) {
                 trendMap[dateStr].in += log.quantityMoved;
             } else {
                 trendMap[dateStr].out += log.quantityMoved;
             }
          }
        });
        const movementData = Object.keys(trendMap).map(k => ({
          name: new Date(k).toLocaleDateString('en-US', { weekday: 'short' }),
          stockIn: trendMap[k].in,
          stockOut: trendMap[k].out
        }));

        // 2. Promotional Sales (Turned into System Health Donut)
        const healthyProducts = products.filter(p => p.quantity > p.minStockLevel).length;
        const lowProducts = products.length - healthyProducts;
        
        const healthData = [
          { name: 'Healthy Stock', value: healthyProducts },
          { name: 'Low/Out of Stock', value: lowProducts }
        ];

        // 3. Top Products (List)
        // Sort products by quantity (just as a placeholder for "Top Sales")
        const topProductsList = [...products]
           .filter(p => p.status === 'Active')
           .sort((a, b) => b.quantity - a.quantity)
           .slice(0, 4);

        setData({ movementData, healthData, topProductsList });
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [user.token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-64 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-100">
        <Loader2 className="animate-spin h-8 w-8 mb-4 border-slate-200 border-t-[#F97316]" />
        <p>Crunching numbers...</p>
      </div>
    );
  }

  if (!data) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-100 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry, index) => (
             <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}: {entry.value}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
      
      {/* Huge Bar Chart (Revenue equivalent) */}
      <div className="lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-800 font-bold text-lg">Revenue</h3>
          <button className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors flex items-center gap-1">Yearly <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </div>
        
        <div className="flex items-center gap-6 mb-6">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
              <div>
                <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Revenue</span>
                <div className="text-xl font-extrabold flex items-center gap-2 text-slate-800">
                  $37,802 <span className="text-emerald-500 text-xs flex items-center"><TrendingUp size={12}/> 0.56%</span>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
              <div>
                <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Order</span>
                <div className="text-xl font-extrabold flex items-center gap-2 text-slate-800">
                  28,305 <span className="text-emerald-500 text-xs flex items-center"><TrendingUp size={12}/> 0.56%</span>
                </div>
              </div>
           </div>
        </div>

        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.movementData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
              <Bar dataKey="stockIn" name="Revenue" fill="#F97316" radius={[4, 4, 4, 4]} barSize={12} />
              <Bar dataKey="stockOut" name="Orders" fill="#8B5CF6" radius={[4, 4, 4, 4]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart (Promotional Sales equivalent) */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-slate-800 font-bold text-lg">Promotional Sales</h3>
          <button className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors flex items-center gap-1">Weekly <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </div>

        <div className="text-left mb-2">
             <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">Visitors</span>
             <div className="text-3xl font-extrabold text-slate-800 flex items-center justify-start gap-2">
               7,802 <span className="text-emerald-500 text-sm flex items-center"><TrendingUp size={14}/> 0.56%</span>
             </div>
        </div>
        
        <div className="flex-1 w-full relative flex items-center justify-center -mt-4">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.healthData}
                cx="50%"
                cy="70%"
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                stroke="none"
                cornerRadius={5}
              >
                {data.healthData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-slate-800">
            <span className="text-2xl font-black">Store</span>
          </div>
        </div>
      </div>

      {/* Top Products List (Top Sale equivalent) */}
      <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100/60 flex flex-col h-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-800 font-bold text-lg">Top sale</h3>
          <button className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors flex items-center gap-1">Weekly <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          {data.topProductsList.map((product, idx) => (
            <div key={product._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100/30">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100/50 overflow-hidden flex items-center justify-center border border-slate-100 shadow-sm text-slate-400 font-bold text-lg">
                     {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/> : (idx % 2 === 0 ? <Package size={20} className="text-slate-400"/> : <Layers size={20} className="text-slate-400"/>)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm truncate max-w-[100px]" title={product.name}>{product.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">${product.purchasePrice?.toFixed(2) || '0.00'}</p>
                  </div>
               </div>
               <div className="text-right">
                 <h4 className="font-extrabold text-slate-800 text-sm">{product.quantity * 2}</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sales</p>
               </div>
            </div>
          ))}
          {data.topProductsList.length === 0 && (
            <div className="text-center text-slate-400 py-10 text-sm font-medium">
              No product data available yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
