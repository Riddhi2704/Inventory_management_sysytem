import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';

export default function ManagerApprovalList() {
  const { user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores the product ID being acted upon

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/products?status=Pending Approval', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPendingProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const handleStatusUpdate = async (productId, newStatus) => {
    setActionLoading(productId);
    try {
      await axios.put(`http://localhost:5000/api/products/${productId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Remove from list or refresh
      fetchPendingProducts();
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-indigo-500" />
            Pending Approvals
          </h2>
          <p className="text-sm text-gray-500 mt-1">Review products added by Staff before they enter active inventory.</p>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-4">SKU / Name</th>
              <th className="p-4">Category / Brand</th>
              <th className="p-4">Pricing (Buy/Sell)</th>
              <th className="p-4">Qty</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" /> Loading pending products...
                </td>
              </tr>
            ) : pendingProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center p-6">
                    <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                    <p>All caught up! No pending approvals at this time.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pendingProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.productId}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-800">{product.category?.name || 'Uncategorized'}</div>
                    <div className="text-xs text-gray-500">{product.brand || 'No Brand'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">Buy: ${product.purchasePrice}</div>
                    <div className="text-sm font-medium text-green-600">Sell: ${product.sellingPrice}</div>
                  </td>
                  <td className="p-4 font-semibold text-gray-900">{product.quantity}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                       {actionLoading === product._id ? (
                         <Loader2 className="animate-spin w-5 h-5 text-indigo-600" />
                       ) : (
                         <>
                          <button 
                            onClick={() => handleStatusUpdate(product._id, 'Active')}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:text-green-700 transition"
                            title="Approve"
                          >
                             <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(product._id, 'Rejected')}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition"
                            title="Reject"
                          >
                             <XCircle className="w-5 h-5" />
                          </button>
                         </>
                       )}
                    </div>
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
