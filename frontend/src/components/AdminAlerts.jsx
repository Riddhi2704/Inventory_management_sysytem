import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, AlertCircle, PackageX, Loader2 } from 'lucide-react';

export default function AdminAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        // Fetch all products, we'll filter them locally for now, 
        // though a dedicated /api/products/alerts route would be better at scale.
        const res = await axios.get('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        const activeProducts = res.data.filter(p => p.status === 'Active');
        
        const lowStockAndOut = activeProducts.filter(p => p.quantity <= p.minStockLevel);
        
        // Sort: Out of stock first, then by how far below minimum they are
        lowStockAndOut.sort((a, b) => {
          if (a.quantity === 0 && b.quantity !== 0) return -1;
          if (b.quantity === 0 && a.quantity !== 0) return 1;
          return (a.quantity - a.minStockLevel) - (b.quantity - b.minStockLevel);
        });

        setAlerts(lowStockAndOut);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [user.token]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
        <div>
          <h2 className="text-xl font-bold text-red-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Inventory Action Required
          </h2>
          <p className="text-sm text-red-700/70 mt-1">Products currently at or below their defined minimum stock threshold.</p>
        </div>
        <div className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full">{alerts.length} Warnings</div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50/30">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
             <Loader2 className="animate-spin h-8 w-8 mb-4 border-slate-200 border-t-brand-500" />
             <p>Analyzing inventory levels...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-emerald-600 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-500 shadow-sm border border-emerald-200">
               <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-bold mb-1">Stock Levels Healthy!</h3>
            <p className="text-emerald-600/70 text-sm">No active products are below their minimum threshold.</p>
          </div>
        ) : (
          alerts.map(item => (
            <div 
              key={item._id} 
              className={`p-5 rounded-2xl border transition-all ${
                item.quantity === 0 
                  ? 'bg-red-50 border-red-200 hover:shadow-red-500/10' 
                  : 'bg-amber-50 border-amber-200 hover:shadow-amber-500/10'
              } hover:shadow-lg flex justify-between items-center`}
            >
               <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-xl ${item.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {item.quantity === 0 ? <PackageX size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500 font-mono mt-0.5 mb-2">SKU: {item.productId}</p>
                    <div className="flex gap-4">
                       <span className="text-xs font-semibold text-slate-500">Category: <span className="text-slate-700">{item.category?.name || 'N/A'}</span></span>
                       <span className="text-xs font-semibold text-slate-500">Supplier: <span className="text-slate-700">{item.supplier?.name || 'N/A'}</span></span>
                    </div>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Current Stock</div>
                  <div className={`text-4xl font-black ${item.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.quantity}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">
                    Req Min: {item.minStockLevel}
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
