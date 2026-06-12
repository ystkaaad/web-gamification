/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Target, 
  Ticket, 
  History, 
  TrendingUp, 
  LogOut, 
  Menu,
  X,
  Zap,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminView, AdminRole } from './types';
import DashboardView from './components/Dashboard';
import MissionsView from './components/Missions';
import VouchersView from './components/Vouchers';
import GameManagerView from './components/GameManager';
import UserGamificationManager from './components/UserGamificationManager';
import UserMissionsView from './components/UserMissionsView';
import RedemptionsView from './components/Redemptions';
import LoginPage from './components/LoginPage';
import AuditPoin from './components/AuditPoin'; 
import { dbService } from './services/dbService';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<AdminRole>(AdminRole.PIC);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      setToken(storedToken);
      dbService.seedSystem();
    }
    setAuthLoading(false);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
    dbService.seedSystem();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setActiveView('dashboard');
    navigate('/login');
  };

  const navGroups = [
    {
      label: '📊 DASHBOARD UTAMA',
      items: [
        { id: 'dashboard', name: 'Dashboard Kontrol', icon: BarChart3 },
      ]
    },
    {
      label: '🎮 MANAJEMEN CORE',
      items: [
        { id: 'games', name: 'Manajemen Game', icon: Gamepad2 },
        { id: 'missions', name: 'Manajemen Misi', icon: Target },
        { id: 'vouchers', name: 'Manajemen Voucher', icon: Ticket },
      ]
    },
    {
      label: '👥 DATA PENGGUNA',
      items: [
        { id: 'user-gamification', name: 'User Gamification', icon: Users },
        { id: 'user-missions', name: 'Status Misi User', icon: Target },
        { id: 'voucher-history', name: 'Klaim Voucher', icon: History },
      ]
    },
    {
      label: '💰 AUDIT & TRANSAKSI',
      items: [
        { id: 'points-history', name: 'Audit Mutasi Poin', icon: TrendingUp },
      ]
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'missions': return <MissionsView />;
      case 'vouchers': return <VouchersView role={role} />;
      case 'games': return <GameManagerView />;
      case 'user-gamification': return <UserGamificationManager />;
      case 'user-missions': return <UserMissionsView />;
      case 'voucher-history': return <RedemptionsView readonly />;
      case 'points-history': return <AuditPoin />;
      default: return (
        <div className="flex flex-col items-center justify-center h-96 premium-card p-12 text-center">
          <h2 className="text-2xl font-black mb-2 opacity-50">Modul Belum Tersedia</h2>
          <p className="text-[#8E9299]">Halaman {activeView} sedang dalam pengembangan.</p>
        </div>
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-premium)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent-premium)]/20 border-t-[var(--accent-premium)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!token ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/*" 
        element={token ? (
          <div className="flex min-h-screen bg-[var(--bg-premium)] text-[var(--text-premium)]">
            <Toaster position="top-right" reverseOrder={false} />
            {/* Sidebar */}
            <motion.aside 
              initial={false}
              animate={{ width: isSidebarOpen ? 280 : 80 }}
              className="fixed left-0 top-0 bottom-0 bg-white border-r border-[var(--border-premium)] z-50 flex flex-col overflow-hidden shadow-xl shadow-orange-900/5"
            >
              <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-premium)] flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-black text-xl tracking-tighter text-[var(--text-premium)]"
                  >
                    GAMIFY<span className="text-[var(--accent-premium)]">ADMIN</span>
                  </motion.span>
                )}
              </div>

              <nav className="flex-1 px-4 py-2 space-y-4 overflow-y-auto premium-scrollbar">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    {isSidebarOpen && (
                      <p className="text-[10px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] mb-2 px-3">
                        {group.label}
                      </p>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveView(item.id as AdminView)}
                          className={`premium-sidebar-item w-full ${activeView === item.id ? 'active' : ''}`}
                          title={item.name}
                        >
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                          {isSidebarOpen && (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="font-medium whitespace-nowrap text-sm"
                            >
                              {item.name}
                            </motion.span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="p-4 border-t border-[var(--border-premium)]">
                <div className="space-y-3">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-[var(--text-muted-premium)] hover:bg-rose-50 hover:text-rose-500 transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    {isSidebarOpen && <span className="text-sm">Keluar</span>}
                  </button>
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <main 
              className="flex-1 transition-all duration-300 ease-in-out"
              style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
            >
              <header className="h-20 border-b border-[var(--border-premium)] bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-[#FF8A50]/5 rounded-lg text-[var(--text-muted-premium)]"
                  >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <h1 className="text-lg font-bold text-[var(--text-muted-premium)] uppercase tracking-[0.2em]">{activeView.replace('-', ' ')}</h1>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br border border-[var(--border-premium)] from-orange-100 to-orange-200`}></div>
                </div>
              </header>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* FUNGSI INI AKAN MERENDER HALAMAN SESUAI MENU YANG DIKLIK */}
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        ) : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}