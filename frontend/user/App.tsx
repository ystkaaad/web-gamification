import React, { useState, useRef, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MissionPage from './pages/MissionPage';
import ClaimReward from './pages/ClaimReward';
import AffiliateClaimReward from './pages/AffiliateClaimReward';
import AffiliateDashboard from './pages/AffiliateDashboard';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Profile from './pages/Profile'; 
import { X, Sparkles, Bell, Home, Target, Gift, Users, User, LogOut, Zap, ChevronDown, Settings, Shield } from 'lucide-react';

const TopNavbar: React.FC = () => {
  const { user, logout } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/missions', icon: Target, label: 'Misi & Game' },
    { to: '/rewards', icon: Gift, label: 'Klaim Reward' },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
        <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">N</div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Ngolabify <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-1 rounded-lg ml-2">{user.isAffiliate ? 'AFFILIATE' : 'MEMBER'}</span></span>
        </div>

        <nav className="flex-1 flex justify-center items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-100' 
                    : 'text-slate-500 hover:bg-orange-50 hover:text-orange-700'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-700 border-2 border-transparent group-hover:border-orange-600 transition-all">
                <User size={20} />
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-orange-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-6 bg-orange-50/50 border-b border-orange-50">
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-2">Akun {user?.isAffiliate ? 'Afiliator' : 'Member'}</p>
                   <p className="font-black text-slate-900 truncate">{user?.name}</p>
                </div>
                <div className="p-2">
                  <button onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }} className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 text-orange-700 rounded-xl text-sm font-bold">
                    <Settings size={18} /> Profil Saya
                  </button>
                  <button onClick={logout} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-500 rounded-xl text-sm font-bold">
                    <LogOut size={18} /> Keluar Akun
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Komponen Protected Route untuk mencegah akses tidak sah
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useApp();
  const isAuthenticated = localStorage.getItem('ngolabify_user_v1');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-orange-900 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">
            Menghubungkan ke Membership...
          </p>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useApp();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          <p className="text-orange-900 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Menghubungkan ke Membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-800">
      <TopNavbar />
      
      {/* Mobile Top Header */}
      {user && (
        <header className="md:hidden sticky top-0 z-[100] bg-white border-b border-orange-100 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-orange-100 text-sm">N</div>
            <span className="font-black text-slate-900 tracking-tight text-lg">Ngolabify</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-orange-600 transition-colors">
              <Bell size={20} />
            </button>
            <div onClick={() => navigate('/profile')} className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-100 italic font-black text-xs cursor-pointer hover:bg-orange-100 transition-colors">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 pb-24 md:pb-12 overflow-y-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
<Route path="/dashboard" element={
             <ProtectedRoute>
               <Dashboard />
             </ProtectedRoute>
           } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/missions" element={
            <ProtectedRoute>
              <MissionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/rewards" element={
            <ProtectedRoute>
              {user?.isAffiliate ? <AffiliateClaimReward /> : <ClaimReward />}
            </ProtectedRoute>
          } />

          {/* Affiliate specific routes */}
          <Route path="/commissions" element={
            <ProtectedRoute>
              {user?.isAffiliate ? <AffiliateDashboard /> : <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } />
          
          <Route path="/referrals" element={
            <ProtectedRoute>
              {user?.isAffiliate ? <AffiliateDashboard /> : <Navigate to="/dashboard" />}
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {user && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;