import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Moon, Sun } from 'lucide-react';

import './AdminCharts.css';
import RevenueChart from './admin/charts/RevenueChart';
import OrdersChart from './admin/charts/OrdersChart';
import InventoryChart from './admin/charts/InventoryChart';
import TopProductsChart from './admin/charts/TopProductsChart';

export default function AdminCharts() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Monthly');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [theme, setTheme] = useState('light');

  const [rawProducts, setRawProducts] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) setTheme('dark');
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Fetch data ONCE on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, logsRes, catRes] = await Promise.all([
          axios.get('http://localhost:5001/api/products', { headers: { Authorization: `Bearer ${user?.token}` } }),
          axios.get('http://localhost:5001/api/logs/movement', { headers: { Authorization: `Bearer ${user?.token}` } }),
          axios.get('http://localhost:5001/api/categories', { headers: { Authorization: `Bearer ${user?.token}` } })
        ]);
        setRawProducts(productsRes.data);
        setRawLogs(logsRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load chart data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) {
        fetchData();
    }
  }, [user]);

  // 2. Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    let fp = rawProducts;
    if (categoryFilter !== 'All Categories') {
       fp = fp.filter(p => {
          const catId = p.category?._id || p.category;
          return String(catId) === String(categoryFilter);
       });
    }
    if (searchQuery) {
       fp = fp.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return fp;
  }, [rawProducts, categoryFilter, searchQuery]);

  // 3. Autocomplete suggestions (ignores category filter so they can search anything, but follows current query)
  const searchSuggestions = useMemo(() => {
     if (!searchQuery) return [];
     return rawProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [rawProducts, searchQuery]);

  // 4. Derive graph data
  const { revenueData, ordersData, inventoryData, topProductsData } = useMemo(() => {
    // Inventory
    let inStock = 0, lowStock = 0, outOfStock = 0;
    filteredProducts.forEach(p => {
        if (p.quantity === 0) outOfStock++;
        else if (p.quantity <= (p.minStockLevel || 5)) lowStock++;
        else inStock++;
    });
    const invData = [
      { name: 'In Stock', value: inStock },
      { name: 'Low Stock', value: lowStock },
      { name: 'Out of Stock', value: outOfStock }
    ];

    // Top Products
    const topData = [...filteredProducts]
        .filter(p => p.status === 'Active')
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(p => ({
            name: p.name,
            sales: p.quantity * 2,
            price: p.purchasePrice || p.sellingPrice || p.price || 0
        }));

    // Filter Logs (must relate to filteredProducts)
    const validProductIds = new Set(filteredProducts.map(p => String(p._id)));
    const filteredLogs = rawLogs.filter(log => {
      const pId = log.product?._id || log.product || log.productId;
      return validProductIds.has(String(pId));
    });

    // Revenue & Orders
    const trendMap = {};
    const today = new Date();

    if (timeFilter === 'Daily') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            trendMap[dateKey] = { date: d.toLocaleDateString('en-US', { weekday: 'short' }), revenue: 0, orders: 0 };
        }
    } else if (timeFilter === 'Weekly') {
        for (let i = 3; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - (i * 7));
            const weekStart = new Date(d);
            weekStart.setDate(d.getDate() - d.getDay()); // Sunday
            const dateKey = weekStart.toISOString().split('T')[0];
            trendMap[dateKey] = { date: `Wk of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, revenue: 0, orders: 0 };
        }
    } else if (timeFilter === 'Monthly') {
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            trendMap[dateKey] = { date: d.toLocaleDateString('en-US', { month: 'short' }), revenue: 0, orders: 0 };
        }
    } else if (timeFilter === 'Yearly') {
        for (let i = 2; i >= 0; i--) {
            const year = today.getFullYear() - i;
            const dateKey = `${year}`;
            trendMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
        }
    }

    filteredLogs.forEach(log => {
        const logDate = new Date(log.createdAt);
        let dateKey = '';
        
        if (timeFilter === 'Daily') {
            dateKey = logDate.toISOString().split('T')[0];
        } else if (timeFilter === 'Weekly') {
            const weekStart = new Date(logDate);
            weekStart.setDate(logDate.getDate() - logDate.getDay());
            dateKey = weekStart.toISOString().split('T')[0];
        } else if (timeFilter === 'Monthly') {
            dateKey = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
        } else if (timeFilter === 'Yearly') {
            dateKey = `${logDate.getFullYear()}`;
        }

        if (trendMap[dateKey]) {
            if (log.reason && log.reason.toLowerCase().includes('sale')) {
                trendMap[dateKey].orders += log.quantityMoved;
                const pId = log.product?._id || log.product || log.productId;
                const relProduct = filteredProducts.find(p => String(p._id) === String(pId));
                const price = relProduct ? (relProduct.sellingPrice || relProduct.purchasePrice || 10) : 10;
                trendMap[dateKey].revenue += log.quantityMoved * price;
            }
        }
    });

    const sortedKeys = Object.keys(trendMap).sort((a, b) => a.localeCompare(b));
    const rData = sortedKeys.map(k => ({ date: trendMap[k].date, revenue: trendMap[k].revenue }));
    const oData = sortedKeys.map(k => ({ date: trendMap[k].date, orders: trendMap[k].orders }));

    return { revenueData: rData, ordersData: oData, inventoryData: invData, topProductsData: topData };
  }, [filteredProducts, rawLogs, timeFilter]);

  return (
    <div className="ac-container">
      <div className="ac-header">
        <h2 className="ac-title">System Analytics</h2>
        <div className="ac-controls">
          
          <div className="ac-search-wrapper" style={{ position: 'relative' }}>
            <Search className="ac-search-icon" size={16} />
            <input 
              type="text" 
              className="ac-search-input" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && searchSuggestions.length > 0 && (
              <ul style={{
                 position: 'absolute', top: '100%', left: 0, width: '100%', backgroundColor: 'var(--ac-card-bg)', 
                 border: '1px solid var(--ac-border)', borderRadius: 'var(--ac-radius-sm)', listStyle: 'none', 
                 padding: 0, margin: '4px 0 0', zIndex: 10, boxShadow: 'var(--ac-card-shadow)' 
              }}>
                 {searchSuggestions.map(s => (
                   <li 
                      key={s._id} 
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.875rem', borderBottom: '1px solid var(--ac-border)', color: 'var(--ac-text-main)' }} 
                      onClick={() => { setSearchQuery(s.name); setShowSuggestions(false); }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--ac-bg-main)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                   >
                     {s.name}
                   </li>
                 ))}
              </ul>
            )}
          </div>
          
          <select 
            className="ac-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          
          <select 
            className="ac-select"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <button className="ac-theme-toggle" onClick={toggleTheme} title="Toggle Dark Mode">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      <div className="ac-grid-top">
        <RevenueChart data={revenueData} loading={loading} />
        <OrdersChart data={ordersData} loading={loading} />
      </div>

      <div className="ac-grid-bottom">
        <InventoryChart data={inventoryData} loading={loading} />
        <TopProductsChart data={topProductsData} loading={loading} />
      </div>

    </div>
  );
}
