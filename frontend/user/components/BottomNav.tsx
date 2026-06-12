
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Target, Gift, Users, Cloud, CloudOff, RefreshCw, Zap, LayoutGrid } from 'lucide-react';
import { useApp } from '../AppContext';

const BottomNav: React.FC = () => {
  const { user, isSyncing, lastSyncStatus } = useApp();

  const navItems = user?.isAffiliate 
    ? [
        { to: '/dashboard', icon: LayoutGrid, label: 'Bisnis' },
        { to: '/commissions', icon: Zap, label: 'Komisi' },
        { to: '/referrals', icon: Users, label: 'Jaringan' },
        { to: '/rewards', icon: Gift, label: 'Elite' },
      ]
    : [
        { to: '/dashboard', icon: Home, label: 'Home' },
        { to: '/missions', icon: Target, label: 'Misi' },
        { to: '/rewards', icon: Gift, label: 'Reward' },
      ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Cloud Status Indicator */}
      <div className="flex justify-center -mb-2 relative z-10 pointer-events-none">
        <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-lg backdrop-blur-md transition-all ${
          isSyncing ? 'bg-orange-600 text-white border-orange-500' : 
          lastSyncStatus === 'success' ? 'bg-orange-500 text-white border-orange-400' :
          lastSyncStatus === 'error' ? 'bg-rose-500 text-white border-rose-400' :
          'bg-white/90 text-slate-400 border-slate-100'
        }`}>
          {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : 
           lastSyncStatus === 'success' ? <Cloud size={10} /> :
           lastSyncStatus === 'error' ? <CloudOff size={10} /> : <Cloud size={10} />}
          {isSyncing ? 'Syncing...' : 
           lastSyncStatus === 'success' ? 'Cloud Synced' :
           lastSyncStatus === 'error' ? 'Sync Failed' : 'Cloud Ready'}
        </div>
      </div>

      <nav className="bg-white border-t border-orange-100 px-2 py-3 md:hidden flex justify-around items-center shadow-[0_-4px_20px_rgba(234,88,12,0.1)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-orange-600 scale-110 font-bold' : 'text-slate-400'}`
            }
          >
            <item.icon size={22} className="nav-icon" />
            <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
