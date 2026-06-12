import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  History, Target, ArrowRight, Zap, 
  ShieldCheck, Trophy, Star, Award, Crown 
} from 'lucide-react';
import { Transaction, Mission, LoyaltyLevel } from '../types';

// ==========================================
// UTILITY HELPERS (Type-Safe Strict Mode)
// ==========================================
const safeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isValidLoyaltyLevel = (value: unknown): value is LoyaltyLevel => {
  return Object.values(LoyaltyLevel)
    .filter(v => typeof v === 'string')
    .includes(value as LoyaltyLevel);
};

const getTimestamp = (date?: string): number => {
  if (!date) return 0;
  const timestamp = new Date(date).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatActivityDate = (date?: string): string => {
  if (!date) return 'Baru saja';
  
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) {
    return 'Baru saja';
  }

  const parsedDate = new Date(timestamp);
  const day = parsedDate.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[parsedDate.getMonth()];
  const year = parsedDate.getFullYear();
  const hours = parsedDate.getHours().toString().padStart(2, '0');
  const minutes = parsedDate.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

// ==========================================
// VIEW MODELS & CONFIGS
// ==========================================
interface LevelConfig {
  target: number;
  label: string;
  next: string;
  perk: string;
  color: string;
  accent: string;
}

interface MissionViewModel {
  id: string;
  title: string;
  progressValue: number;
  totalValue: number;
  rewardValue: number;
  missionProgress: number;
}

interface ActivityViewModel {
  id: string;
  description: string;
  points: number;
  isPositive: boolean;
  formattedDate: string;
}

const getLevelConfig = (level: LoyaltyLevel): LevelConfig => {
  switch(level) {
    case LoyaltyLevel.PLATINUM: 
      return { target: 1000, label: 'Platinum', next: 'MAX', perk: 'Eksklusif Platinum Rewards', color: 'from-orange-700 to-orange-950', accent: 'bg-orange-600' };
    case LoyaltyLevel.GOLD: 
      return { target: 1000, label: 'Gold', next: 'Platinum', perk: 'Spesial Gold Rewards', color: 'from-orange-500 to-orange-700', accent: 'bg-orange-400' };
    case LoyaltyLevel.SILVER: 
      return { target: 500, label: 'Silver', next: 'Gold', perk: 'Basic Member Rewards', color: 'from-orange-400 to-orange-500', accent: 'bg-orange-300' };
    default: {
      const exhaustiveCheck: never = level;
      throw new Error(`Unhandled LoyaltyLevel: ${String(exhaustiveCheck)}`);
    }
  }
};

const Dashboard: React.FC = () => {
  const { 
    user, 
    missions, 
    transactions, 
    isLoading: appLoading, 
    isSyncing, 
    refreshData, 
    logout 
  } = useApp();
  
  const navigate = useNavigate();
  const previousUserId = useRef<string | null>(null);

  // Mencegah infinite loop & optimasi React re-renders
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      previousUserId.current = null;
      return;
    }

    if (previousUserId.current === userId) {
      return;
    }

    previousUserId.current = userId;
    void refreshData();
  }, [userId, refreshData]);

  // Hook sebelum early return (Mematuhi Aturan React Hooks)
  const totalPoints = useMemo(() => safeNumber(user?.points), [user?.points]);
  
  const { config, progress } = useMemo(() => {
    if (!user) {
      return { config: getLevelConfig(LoyaltyLevel.SILVER), progress: 0 };
    }
    
    const memberLevel = isValidLoyaltyLevel(user.memberLevel) ? user.memberLevel : LoyaltyLevel.SILVER;
    const lvlConfig = getLevelConfig(memberLevel);
    
    const calculatedProgress = memberLevel === LoyaltyLevel.PLATINUM 
      ? 100 
      : lvlConfig.target > 0 
        ? Math.min((totalPoints / lvlConfig.target) * 100, 100) 
        : 0;
        
    return { config: lvlConfig, progress: calculatedProgress };
  }, [user, totalPoints]);

  const activeMissions: MissionViewModel[] = useMemo(() => {
    return missions
      .filter((m: Mission) => !m.completed)
      .slice(0, 2)
      .map((m: Mission, idx: number) => {
        const progressValue = safeNumber(m.progress);
        const totalValue = safeNumber(m.total ?? m.target);
        const rewardValue = safeNumber(m.rewardPoints ?? m.reward_points);
        
        const missionProgress = totalValue > 0 
          ? Math.min((progressValue / totalValue) * 100, 100) 
          : 0;

        return { 
          id: String(m.id ?? `mission-fallback-${idx}`), 
          title: m.title ?? 'Misi Rahasia', 
          progressValue, 
          totalValue, 
          rewardValue, 
          missionProgress 
        };
      });
  }, [missions]);

  const activities: ActivityViewModel[] = useMemo(() => {
    return [...transactions]
      .sort((a: Transaction, b: Transaction) => {
        const dateA = a.createdAt ?? a.timestamp ?? a.date;
        const dateB = b.createdAt ?? b.timestamp ?? b.date;
        return getTimestamp(dateB) - getTimestamp(dateA);
      })
      .slice(0, 5)
      .map((t: Transaction, idx: number) => {
        const pointsValue = safeNumber(t.pointsChange ?? t.points);
        const isPositive = pointsValue > 0;
        const description = t.description ?? t.item ?? t.source ?? 'Aktivitas Gamifikasi';
        const rawDate = t.createdAt ?? t.timestamp ?? t.date;
        
        return { 
          id: String(t.id ?? `activity-fallback-${idx}`), 
          description, 
          points: pointsValue, 
          isPositive, 
          formattedDate: formatActivityDate(rawDate) 
        };
      });
  }, [transactions]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  // State Pemuatan
  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Guard Clause Akhir, TypeScript mengetahui `user` valid sepenuhnya
  if (!user || !user.id) {
    return <Navigate to="/login" replace />;
  }

  // Akses langsung yang aman berkat guard
  const userName = user.name ?? 'Member';
  const currentLevelLabel = isValidLoyaltyLevel(user.memberLevel) ? user.memberLevel : LoyaltyLevel.SILVER;
  const isAffiliate = user.isAffiliate === true || user.role === 'MEMBER_AFFILIATE';

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-slate-50 pb-32 antialiased"
    >
      {/* Editorial Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-40 px-6 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-100/20 blur-[150px] rounded-full -mr-[20%] -mt-[10%] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.6]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="space-y-6 flex-1">
               <div className="inline-flex items-center gap-2 bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 px-4 py-2 rounded-full">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
                  </span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System Online</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.85]">
                 Mulai Hari <br />
                 <span className="text-orange-600 italic">Favorite-mu.</span>
               </h1>
               <p className="text-slate-400 font-medium text-lg md:text-xl max-w-xl leading-relaxed">
                 Temukan menu terbaik dengan diskon spesial eksklusif untuk member <span className="text-slate-900 font-black">{config.label}</span>.
               </p>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
               <div className={`p-1 rounded-2xl bg-gradient-to-br ${config.color} shadow-lg`}>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 md:px-8 md:py-5 flex items-center gap-4 border border-white/20">
                    <Crown size={20} className="text-white" fill="currentColor" />
                    <div>
                      <p className="text-[10px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Status</p>
                      <p className="text-sm md:text-xl font-black text-white tracking-widest uppercase italic leading-none">{currentLevelLabel}</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Stats */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-white rounded-[3rem] p-1 shadow-2xl shadow-orange-100/50 group">
            <div className="bg-white border border-slate-100 rounded-[2.8rem] p-8 h-full relative overflow-hidden flex flex-col justify-between">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                      <Star size={24} fill="currentColor" />
                    </div>
                    <div className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">XP Balance</p>
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter tabular-nums">{totalPoints.toLocaleString()}</h3>
                        <span className="text-xs md:text-sm font-black text-orange-500 italic">XP</span>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100/50">
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total XP</p>
                        <p className="text-base font-black text-slate-700">{totalPoints.toLocaleString()}</p>
                     </div>
                     <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Misi Selesai</p>
                        <p className="text-base font-black text-orange-600">{missions.filter((m: Mission) => m.completed).length}</p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="col-span-1 lg:col-span-2 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-1 shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="bg-gradient-to-br from-orange-600/10 to-transparent border border-transparent rounded-2xl p-8 lg:p-10 h-full flex flex-col justify-between relative z-10">
               <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/20 group-hover:scale-110 transition-transform">
                    <Zap size={32} fill="currentColor" />
                  </div>
                  <div className="md:text-right">
                    <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 underline decoration-orange-500 underline-offset-8">Boost Active</p>
                    <h4 className="text-2xl md:text-3xl lg:text-4xl font-black text-white italic tracking-tighter leading-none">Double XP <br/> Zone!</h4>
                  </div>
               </div>
               <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mt-10">
                  <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[280px]">Misi harian memberikan pengganda poin otomatis khusus untuk member <span className="text-white font-black">{config.label}</span>.</p>
                  <button 
                    onClick={() => navigate('/rewards')}
                    className="w-full md:w-auto px-6 py-3 md:px-10 md:py-5 bg-white hover:bg-orange-600 hover:text-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md md:shadow-xl active:scale-95"
                  >
                    Klaim Benefit
                  </button>
               </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-[3rem] border border-slate-100 p-1 shadow-xl group">
             <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-6 md:p-8 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 text-slate-200 group-hover:text-orange-200 transition-colors pointer-events-none">
                  <ShieldCheck size={120} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                   <div className="flex flex-col gap-3 mb-8">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Member Profile</p>
                          <h4 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">{userName}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{currentLevelLabel}</span>
                        </div>
                      </div>
<div className="grid grid-cols-1 gap-4">
                        <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Total Poin</p>
                          <p className="text-2xl md:text-3xl font-black text-orange-600 tracking-tight">{totalPoints.toLocaleString()}</p>
                        </div>
                        {isAffiliate && (user.referralCode ?? user.referral_code) && (
                          <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Referral Code</p>
                            <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
                              {user.referralCode ?? user.referral_code}
                            </p>
                          </div>
                        )}
                      </div>
                   </div>
                   <button onClick={logout} className="w-full px-4 py-3 md:px-5 md:py-4 mt-2 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all">
                     Keluar Akun
                   </button>
                </div>
             </div>
          </motion.div>

        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <motion.div variants={itemVariants} className={`bg-gradient-to-br ${config.color} rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group`}>
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[8000ms]">
                 <Award size={300} />
               </div>
               <div className="relative z-10 space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                     <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Next Goal</div>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black italic tracking-tighter leading-tight">Target <br/> {config.next} Level</h2>
                     </div>
                     <div className="bg-white/10 backdrop-blur-md p-6 rounded-[1.8rem] border border-white/10 max-w-sm">
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Benefit Terdekat</p>
                        <p className="text-base font-black italic">{config.perk}</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                      />
                    </div>
                    <div className="flex justify-between items-center tabular-nums font-black italic">
                       <span className="text-2xl md:text-3xl">{progress.toFixed(0)}%</span>
                       <span className="text-[10px] uppercase tracking-widest opacity-60">Status Progress</span>
                    </div>
                  </div>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
               <div className="flex items-center justify-between px-6">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">Radar Misi</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Selesaikan & Raih Rewards</p>
                 </div>
                 <button onClick={() => navigate('/missions')} className="flex items-center gap-2 text-[11px] font-black text-orange-600 uppercase tracking-widest">
                   Lihat Misi <ArrowRight size={18} />
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {activeMissions.map((m: MissionViewModel) => (
                   <motion.div whileHover={{ y: -5 }} key={m.id} className="bg-white rounded-2xl p-6 md:p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative">
                     <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          <Target size={20} />
                        </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 leading-none">XP Reward</p>
                              <p className="text-lg font-black italic leading-none">{m.rewardValue} XP</p>
                           </div>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 leading-tight uppercase group-hover:text-orange-600 transition-colors italic">{m.title}</h4>
                        <div className="space-y-3 pt-6 border-t border-slate-50">
                           <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                              <span>Progress</span>
                              <span className="text-orange-600">{m.progressValue}/{m.totalValue}</span>
                           </div>
                           <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900 group-hover:bg-orange-600 transition-colors" style={{ width: `${m.missionProgress}%` }} />
                           </div>
                        </div>
                     </div>
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-2xl p-6 md:p-10 text-white relative overflow-hidden shadow-lg md:shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-[80px] rounded-full"></div>
               <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8 relative z-10">
                  <h4 className="text-xl font-black tracking-tight italic uppercase">Top Elite</h4>
                  <Crown size={24} className="text-orange-400" />
               </div>
               <div className="flex flex-col items-center justify-center py-20 opacity-30 relative z-10">
                  <Trophy size={64} strokeWidth={1} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Update In 24h</p>
               </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white border border-slate-100 rounded-2xl p-6 md:p-10 shadow-sm space-y-8 min-h-[320px] md:min-h-[400px]">
               <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <h4 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Activity</h4>
                  <History size={18} className={`${isSyncing ? 'animate-spin text-orange-500' : 'text-slate-300'}`} />
               </div>
               <div className="space-y-1">
                 {activities.length > 0 ? (
                   activities.map((t: ActivityViewModel) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -10 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       transition={{ delay: 0.1 }} 
                       key={t.id} 
                       className="py-4 flex justify-between items-center border-b border-slate-50 last:border-0 group"
                     >
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all ${t.isPositive ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Zap size={16} className={t.isPositive ? 'text-orange-600' : 'text-slate-400'} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-0.5 leading-none">
                              {t.description}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                              {t.formattedDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-black tabular-nums tracking-tighter ${t.isPositive ? 'text-orange-500' : 'text-slate-400'}`}>
                            {t.isPositive ? '+' : ''}{t.points} <span className="text-[10px] italic ml-0.5">XP</span>
                          </p>
                        </div>
                     </motion.div>
                   ))
                 ) : (
                   <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-20">
                     <History size={48} strokeWidth={1} />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Empty Feed</p>
                   </div>
                 )}
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;