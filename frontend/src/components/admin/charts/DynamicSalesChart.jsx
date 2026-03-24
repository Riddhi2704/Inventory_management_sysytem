import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Search, Loader2, Download, CheckCircle, BarChart2, Star } from 'lucide-react';

export default function DynamicSalesChart() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [timeFilter, setTimeFilter] = useState('month');
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [compare, setCompare] = useState('false');
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    // fetch distinct categories from existing endpoints or just raw list
    axios.get('http://localhost:5001/api/categories', { headers: { Authorization: `Bearer ${user?.token}` } })
       .then(res => setCategoriesList(res.data))
       .catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchGraphData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5001/api/admin/analytics/revenue`, {
          params: { timeFilter, category, search: debouncedSearch, compare },
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("Dynamic chart err:", err);
        setError("Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchGraphData();
  }, [timeFilter, category, debouncedSearch, compare, user]);

  const exportChart = () => {
     if (!data || !data.chartData) return;
     const headers = Object.keys(data.chartData[0] || {}).join(",");
     const csv = [headers, ...data.chartData.map(d => Object.values(d).join(","))].join("\\n");
     const blob = new Blob([csv], { type: 'text/csv' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `Sales_Export_${new Date().toISOString().split('T')[0]}.csv`;
     a.click();
  };

  const getLines = () => {
     if (!data || !data.chartData || data.chartData.length === 0) return [];
     const currentKeys = Object.keys(data.chartData[0]).filter(k => k !== 'date' && k !== 'PreviousPeriod');
     return currentKeys;
  };

  const chartKeys = getLines();

  return (
    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      
      {/* HEADER & FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
           <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0, display:'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#4f46e5" /> Dynamic Revenue Forecaster 
           </h3>
           <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b' }}>Interactive time-series analysis</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
           <select style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
           </select>

           <select style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }} value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
              <option value="day">Past 24 Hours</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
           </select>

           <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                 type="text" 
                 placeholder="Search product..." 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 style={{ padding: '0.5rem 0.5rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', width: '200px' }} 
              />
           </div>

           <button onClick={() => setCompare(c => c === 'true' ? 'false' : 'true')} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: compare === 'true' ? 'none' : '1px solid #cbd5e1', background: compare === 'true' ? '#4f46e5' : 'white', color: compare === 'true' ? 'white' : '#475569', fontSize: '0.875rem', cursor: 'pointer', transition: '0.2s' }}>
              {compare === 'true' ? 'Comparing...' : 'Compare vs Prev'}
           </button>

           <button onClick={exportChart} style={{ display:'flex', alignItems:'center', gap:'6px', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', color: '#0f172a', fontSize: '0.875rem', cursor: 'pointer' }}>
              <Download size={14} /> Export
           </button>
        </div>
      </div>

      {/* GRAPH DATA */}
      <div style={{ position: 'relative', width: '100%', height: '350px', background: '#f8fafc', borderRadius: '8px', padding: '1rem 1rem 0 0' }}>
         {loading ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)', zIndex: 10, borderRadius: '8px' }}>
                <Loader2 className="animate-spin" size={32} color="#4f46e5" />
                <span style={{ marginTop: '0.5rem', color: '#4f46e5', fontWeight: 500 }}>Crunching Data...</span>
            </div>
         ) : error ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>{error}</div>
         ) : !data || data.chartData.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                <span>No statistical data found for this selection</span>
            </div>
         ) : (
            <ResponsiveContainer width="100%" height="100%">
               <LineChart data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} wrapperStyle={{ zIndex: 100 }} />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', fontSize: '13px' }} />
                  
                  {chartKeys.map((k, i) => (
                    <Line 
                      key={k} 
                      type="monotone" 
                      dataKey={k} 
                      stroke={k === 'Total' ? '#4f46e5' : `hsl(${(i * 137) % 360}, 70%, 50%)`} 
                      strokeWidth={k === 'Total' ? 3 : 2} 
                      dot={k === 'Total' ? { r: 4, strokeWidth: 2 } : false}
                      activeDot={{ r: 6 }} 
                    />
                  ))}
                  
                  {compare === 'true' && (
                    <Line 
                       type="monotone" 
                       dataKey="PreviousPeriod" 
                       stroke="#94a3b8" 
                       strokeWidth={2} 
                       strokeDasharray="5 5" 
                       dot={false}
                    />
                  )}
               </LineChart>
            </ResponsiveContainer>
         )}
      </div>

      {/* AI INSIGHT TEXT */}
      {!loading && data && data.chartData.length > 0 && (
         <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(to right, #eef2ff, #e0e7ff)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Star size={24} color="#6366f1" style={{ flexShrink: 0 }} />
            <div>
               <h4 style={{ margin: 0, color: '#3730a3', fontSize: '0.875rem', fontWeight: 600 }}>AI Strategic Insight</h4>
               <p style={{ margin: '4px 0 0 0', color: '#4338ca', fontSize: '0.875rem' }}>{data.insight}</p>
            </div>
         </div>
      )}
    </div>
  );
}
