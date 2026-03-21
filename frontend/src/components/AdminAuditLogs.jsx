import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { History, Loader2, ArrowRight } from 'lucide-react';
import textData from '../constants/textData';

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/logs/movement', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user.token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <History className="w-5 h-5 mr-2 text-brand-500" />
            {textData.adminAuditLogs.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{textData.adminAuditLogs.subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold sticky top-0">
              <th className="p-4">{textData.adminAuditLogs.table.dateTime}</th>
              <th className="p-4">{textData.adminAuditLogs.table.action}</th>
              <th className="p-4">{textData.adminAuditLogs.table.product}</th>
              <th className="p-4">{textData.adminAuditLogs.table.qty}</th>
              <th className="p-4">{textData.adminAuditLogs.table.location}</th>
              <th className="p-4">{textData.adminAuditLogs.table.performedBy}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
               <tr>
                 <td colSpan="6" className="p-8 text-center text-slate-400">
                   <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" /> {textData.adminAuditLogs.loading}
                 </td>
               </tr>
            ) : logs.length === 0 ? (
               <tr>
                 <td colSpan="6" className="p-8 text-center text-slate-500">{textData.adminAuditLogs.empty}</td>
               </tr>
            ) : (
               logs.map((log) => (
                 <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="p-4 text-sm text-slate-600 font-medium">{formatDate(log.createdAt)}</td>
                   <td className="p-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                       ['Restock', 'Found', 'Return'].includes(log.reason) ? 'bg-green-100 text-green-700' :
                       ['Damage', 'Sent Out', 'Used', 'Sale'].includes(log.reason) ? 'bg-red-100 text-red-700' :
                       'bg-blue-100 text-blue-700'
                     }`}>
                       {log.reason || 'Moved'}
                     </span>
                   </td>
                   <td className="p-4 text-sm font-semibold text-slate-800">{log.product?.name || 'Unknown Item'}</td>
                   <td className="p-4 text-sm font-bold text-slate-900">{log.quantityMoved} {log.product?.unitType || 'pcs'}</td>
                   <td className="p-4 text-xs text-slate-500 flex items-center gap-2 mt-1">
                     <span className="truncate max-w-[80px] bg-slate-100 px-1 rounded">{log.fromLocation || 'N/A'}</span>
                     <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                     <span className="truncate max-w-[80px] bg-slate-100 px-1 rounded">{log.toLocation || 'N/A'}</span>
                   </td>
                   <td className="p-4">
                     <div className="text-sm font-medium text-slate-800">{log.movedBy?.fullName || 'System'}</div>
                     <div className="text-xs text-brand-600 font-medium">{log.movedBy?.role}</div>
                   </td>
                 </tr>
               ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
