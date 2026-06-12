
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, FileText, Target, Gift, Settings, 
  RefreshCw, ChevronRight, Search, X, MoreVertical 
} from 'lucide-react';
import { CONFIG } from './services/config';

/* 
 * UI AdminSuite - Fully API Driven
 */
const AdminSuite = () => {
  // Fix: Defined missing state variables and ensured correct typing to resolve comparison errors
  const [activeTab, setActiveTab] = useState('overview');
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [referralEarnings, setReferralEarnings] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  const fetchLogs = async () => {
    setIsSyncing(true);
    try {
      // TODO: Endpoint backend belum tersedia untuk fitur ini
      console.warn('TODO: Endpoint backend untuk fetchLogs belum tersedia');
      
      setPointsHistory([]);
      setReferralEarnings([]);
    } catch (e) { 
      console.error('Audit Log Fetch Error:', e); 
    }
    finally { setIsSyncing(false); }
  };

  // Fix: Imported missing Lucide icons
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manajemen User', icon: Users },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'missions', label: 'Mission Engine', icon: Target },
    { id: 'rewards', label: 'Reward Market', icon: Gift },
    { id: 'settings', label: 'Konfigurasi', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-100">N</div>
          <span className="text-xl font-bold tracking-tight">Admin<span className="text-orange-600">Suite</span></span>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 scale-[1.02]' 
                  : 'text-slate-400 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Panel Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.4em] italic">System Administration</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          
          {isSyncing && (
            <div className="bg-orange-50 text-orange-600 px-6 py-3 rounded-2xl flex items-center gap-3 border border-orange-100 animate-pulse">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-xs font-black uppercase tracking-widest">Syncing Cloud...</span>
            </div>
          )}
        </header>

        {/* Content Render Engine */}
        <div className="max-w-7xl">
          {/* Audit Logs View - Resolves TS comparison and JSX syntax errors */}
          {activeTab === 'logs' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    Recent Points History
                  </h4>
                  <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:border-orange-200 transition-all" />
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-50">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">User ID</th>
                        <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Source</th>
                        <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Change</th>
                        <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Description</th>
                        <th className="p-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsHistory.length > 0 ? pointsHistory.map((log, i) => (
                        <tr key={i} className="border-b border-slate-50 text-xs hover:bg-orange-50/30 transition-colors group">
                          <td className="p-5 font-bold text-slate-700">{log.userId}</td>
                          <td className="p-5">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-tighter group-hover:bg-white group-hover:text-slate-900 transition-colors">
                              {log.source}
                            </span>
                          </td>
                          <td className={`p-5 font-black text-sm ${Number(log.pointsChange) > 0 ? 'text-orange-500' : 'text-rose-500'}`}>
                            {Number(log.pointsChange) > 0 ? '+' : ''}{log.pointsChange}
                          </td>
                          <td className="p-5 text-slate-500 font-medium">{log.description}</td>
                          <td className="p-5 text-right text-[10px] font-mono text-slate-400">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic">
                            No point logs discovered in cloud database
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Placeholder for sections still in development */
            <div className="py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100 animate-in zoom-in-95 duration-700">
               <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <RefreshCw size={40} className="animate-pulse" />
               </div>
               <h3 className="text-2xl font-black text-slate-200 uppercase italic tracking-widest">Module Under Construction</h3>
               <p className="text-slate-400 mt-2 font-medium">Coming soon with advanced enterprise-grade tools.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSuite;
