import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, AlertTriangle, TrendingUp, LogOut, History, Search, Bell, Moon, Settings, Layers, Tag, FileText, Globe, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import AdminAuditLogs from '../components/AdminAuditLogs';
import AdminAlerts from '../components/AdminAlerts';
import AdminCharts from '../components/AdminCharts';
import textData from '../constants/textData';

const MOCK_TRENDS = [
  [ {v:10}, {v:15}, {v:12}, {v:25}, {v:18}, {v:30}, {v:28} ], // Green trend
  [ {v:20}, {v:15}, {v:25}, {v:10}, {v:18}, {v:12}, {v:22} ], // Orange trend
  [ {v:5}, {v:10}, {v:8}, {v:15}, {v:20}, {v:18}, {v:25} ],   // Purple trend
  [ {v:30}, {v:25}, {v:28}, {v:15}, {v:20}, {v:25}, {v:30} ]  // Blue trend
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ title, value, icon: Icon, mainColor, bgColor, pctInfo, trendData, onClick, active }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border ${active ? `border-[${mainColor}] ring-2 ring-[${mainColor}]/20` : 'border-slate-100'} hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
         <div className="flex items-center gap-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: bgColor, color: mainColor }}>
             <Icon size={20} strokeWidth={2.5} />
           </div>
           <div>
             <h3 className="text-slate-500 font-medium text-sm">{title}</h3>
           </div>
         </div>
         <div className={`text-xs font-bold ${pctInfo.startsWith('+') ? 'text-emerald-500' : 'text-red-500'} flex items-center`}>
            {pctInfo.startsWith('+') ? <TrendingUp size={12} className="mr-1"/> : null} 
            {pctInfo}
         </div>
      </div>
      
      <div className="mt-4 flex items-end justify-between">
         <p className="text-3xl font-extrabold text-slate-800">{value ?? '...'}</p>
         <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={mainColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={mainColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={mainColor} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${title})`} />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
         <span>{textData.common.weekly}</span> 
         <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-800">
      
      {/* Dynamic Sidebar (Ecomus Style) */}
      <div className="w-64 bg-white border-r border-slate-100 shadow-sm flex flex-col fixed h-full z-20">
        
        {/* Brand Logo */}
        <div className="h-20 px-6 flex items-center mb-2 flex-shrink-0">
          <span className="text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900">
            {textData.adminDashboard.sidebarTitle}
          </span>
          <button className="ml-auto text-slate-400 hover:text-slate-600">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
        
        <div className="px-4 flex-1 overflow-y-auto ecomus-scroll">
          
          <nav className="space-y-1">
             {/* Active link (Dashboard) */}
             <div className="relative mb-2">
               <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-orange-500 rounded-r-full"></div>
               <button onClick={() => setActiveTab('overview')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-orange-500 bg-orange-50/50 transition-all">
                 <span className="flex items-center gap-3">
                   <LayoutDashboard size={18} />
                   <span>{textData.adminDashboard.tabs.dashboard}</span>
                 </span>
               </button>
             </div>

             {/* Inactive links with Chevrons */}
             <button onClick={() => setActiveTab('inventory')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Package size={18} />
                 <span>{textData.adminDashboard.tabs.products}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>

             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Layers size={18} />
                 <span>{textData.adminDashboard.tabs.category}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>

             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Tag size={18} />
                 <span>{textData.adminDashboard.tabs.attributes}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>

             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <FileText size={18} />
                 <span>{textData.adminDashboard.tabs.orders}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>

             <button onClick={() => setActiveTab('users')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Users size={18} />
                 <span>{textData.adminDashboard.tabs.users}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>

             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Globe size={18} />
                 <span>{textData.adminDashboard.tabs.onlineStore}</span>
               </span>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-slate-600 transition-colors"><path d="m9 18 6-6-6-6"/></svg>
             </button>
             
             <button onClick={() => setActiveTab('logs')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <History size={18} />
                 <span>{textData.adminDashboard.tabs.reports}</span>
               </span>
             </button>

             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <Settings size={18} />
                 <span>{textData.adminDashboard.tabs.settings}</span>
               </span>
             </button>
             
             <button className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <HelpCircle size={18} />
                 <span>{textData.adminDashboard.tabs.faq}</span>
               </span>
             </button>

             <button onClick={handleLogout} className="w-full flex items-center justify-between px-4 py-2.5 mt-2 rounded-xl font-medium text-slate-600 hover:text-slate-900 transition-all group">
               <span className="flex items-center gap-3">
                 <LogOut size={18} />
                 <span>{textData.common.logout}</span>
               </span>
             </button>
             
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Header Navbar */}
        <header className="h-20 bg-[#F8F9FA] px-8 flex justify-between items-center flex-shrink-0 animate-fade-in z-10 sticky top-0">
          
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder={textData.adminDashboard.searchPlaceholder} 
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm shadow-sm"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 transition-colors"><Moon size={22} /></button>
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
               <Bell size={22} />
               <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#F8F9FA]"></span>
            </button>
            
            <div className="flex items-center gap-3 ml-4 border-l border-slate-200 pl-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">
                 {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.fullName || textData.adminDashboard.adminUser}</p>
                <p className="text-xs text-slate-500 font-medium">{textData.adminDashboard.systemAdmin}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto flex-1 h-full pb-20">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in"> {/* Reduced space-y slightly for tighter layout */}
              
              {/* Top Row Cards matching Ecomus layout and colors */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                   title={textData.adminDashboard.statCards.earnings} 
                   value={stats ? `₹${(stats.totalInventoryValue || 0).toLocaleString()}` : null} 
                   icon={TrendingUp} 
                   mainColor="#22C55E" // Green
                   bgColor="#DCFCE7"
                   pctInfo="+1.56%"
                   trendData={MOCK_TRENDS[0]}
                />
                <StatCard 
                   title={textData.adminDashboard.statCards.orders} 
                   value={stats?.totalProducts} 
                   icon={Package} 
                   mainColor="#F97316" // Orange
                   bgColor="#FFEDD5"
                   pctInfo="-1.56%"
                   trendData={MOCK_TRENDS[1]}
                   onClick={() => setActiveTab('inventory')} 
                />
                <StatCard 
                   title={textData.adminDashboard.statCards.customers} 
                   value={stats?.totalCategories} 
                   icon={Users} 
                   mainColor="#8B5CF6" // Purple
                   bgColor="#EDE9FE"
                   pctInfo="+1.56%"
                   trendData={MOCK_TRENDS[2]}
                />
                <StatCard 
                   title={textData.adminDashboard.statCards.balance} 
                   value={stats?.outOfStockProducts} 
                   icon={AlertTriangle} 
                   mainColor="#3B82F6" // Blue
                   bgColor="#DBEAFE"
                   pctInfo="+1.56%"
                   trendData={MOCK_TRENDS[3]}
                   onClick={() => setActiveTab('alerts')} 
                />
              </div>

              {/* Data Visualizations */}
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                 <AdminCharts />
              </div>

               {/* Summary Previews */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 truncate">{textData.adminDashboard.recentAudit}</h3>
                    <button onClick={() => setActiveTab('logs')} className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors flex items-center gap-1">{textData.common.weekly} <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 pb-16 pointer-events-none z-10 bg-gradient-to-t from-white via-transparent to-transparent fade-out"></div>
                    <AdminAuditLogs />
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100/60 flex flex-col h-[400px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">{textData.adminDashboard.criticalAlerts}</h3>
                    <button onClick={() => setActiveTab('alerts')} className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 hover:bg-slate-100 transition-colors flex items-center gap-1">{textData.common.weekly} <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  </div>
                  <div className="flex-1 overflow-hidden relative border border-slate-100 rounded-xl bg-[#F8F9FA]/50"> {/* Very subtle background for internal lists */}
                    <div className="absolute inset-0 pb-16 pointer-events-none z-10 bg-gradient-to-t from-[#F8F9FA]/50 relative via-transparent to-transparent fade-out"></div>
                    <AdminAlerts />
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'logs' && (
             <div className="h-full pb-8 animate-fade-in relative">
               <AdminAuditLogs />
             </div>
          )}

          {activeTab === 'alerts' && (
             <div className="h-full pb-8 animate-fade-in relative">
               <AdminAlerts />
             </div>
          )}

          {(activeTab !== 'overview' && activeTab !== 'logs' && activeTab !== 'alerts') && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-slate-500 h-full flex flex-col justify-center animate-fade-in">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{textData.adminDashboard.phase3Note}</h3>
              <p>{textData.adminDashboard.phase3Desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
