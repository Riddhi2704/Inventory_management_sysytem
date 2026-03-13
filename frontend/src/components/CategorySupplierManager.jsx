import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Plus, Loader2, Trash2 } from 'lucide-react';

export default function CategorySupplierManager() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'suppliers'
  
  // Generic form state
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, supRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories', { headers: { Authorization: `Bearer ${user.token}` } }),
        axios.get('http://localhost:5000/api/suppliers', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = activeTab === 'categories' ? '/api/categories' : '/api/suppliers';
      await axios.post(`http://localhost:5000${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setFormData({});
      fetchData(); // Refresh lists
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = activeTab === 'categories' ? `/api/categories/${id}` : `/api/suppliers/${id}`;
      await axios.delete(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete item. It may be in use.');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      
      {/* Header and Tabs */}
      <div className="border-b border-gray-100 bg-gray-50/50">
        <div className="p-6 pb-0 flex gap-6">
          <button 
            onClick={() => { setActiveTab('categories'); setFormData({}); setError(''); }}
            className={`flex items-center gap-2 pb-4 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'categories' ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <LayoutDashboard size={18} /> Categories
          </button>
          <button 
            onClick={() => { setActiveTab('suppliers'); setFormData({}); setError(''); }}
            className={`flex items-center gap-2 pb-4 px-2 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'suppliers' ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Users size={18} /> Suppliers
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
        
        {/* Form Section */}
        <div className="w-full md:w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Plus size={18} className="mr-2 text-brand-500" />
            Add New {activeTab === 'categories' ? 'Category' : 'Supplier'}
          </h3>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Name</label>
              <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder={`e.g. ${activeTab === 'categories' ? 'Electronics' : 'Acme Corp'}`}/>
            </div>

            {activeTab === 'categories' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows="3" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="Optional details..."></textarea>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Contact Person</label>
                  <input required name="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="John Doe"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="john@acme.com"/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Phone</label>
                  <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500" placeholder="555-0199"/>
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center mt-4">
              {isSubmitting ? <Loader2 className="animate-spin h-4 w-4" /> : 'Create'}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="w-full md:w-2/3 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                 <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    {activeTab === 'categories' ? (
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    ) : (
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact Info</th>
                    )}
                    <th className="px-6 py-3 text-right"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr><td colSpan="3" className="p-8 text-center text-gray-400"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></td></tr>
                ) : activeTab === 'categories' ? (
                  categories.length === 0 ? <tr><td colSpan="3" className="p-6 text-center text-gray-500">No categories found</td></tr> :
                  categories.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.description || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  suppliers.length === 0 ? <tr><td colSpan="3" className="p-6 text-center text-gray-500">No suppliers found</td></tr> :
                  suppliers.map(s => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{s.contactPerson}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>

      </div>
    </div>
  );
}
