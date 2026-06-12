/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Target, Ticket, Star, Trophy, ArrowRight, Zap, History, User as UserIcon, DollarSign, Gamepad2 } from 'lucide-react';
import { dbService } from '../services/dbService';
import { Mission, Voucher, User, GameSetting } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import SpinwheelUser from './SpinwheelUser';
import ScratchCard from './ScratchCard';
import DailyStreakUser from './DailyStreakUser';
import { toast } from 'react-hot-toast';

export default function UserView() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [games, setGames] = useState<GameSetting[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<GameSetting | null>(null);
  const [exchanging, setExchanging] = useState<string | null>(null);
  const [claimingMission, setClaimingMission] = useState<string | null>(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [m, v, u, g] = await Promise.all([
        dbService.getMissions(),
        dbService.getVouchers(),
        dbService.getUsers(),
        dbService.getGames()
      ]);
      setMissions(m);
      setVouchers(v);
      setGames(g.filter(game => game.is_active));
      
      // HARDCODED TESTING USER: USR-999
      const testerId = "USR-999";
      let currentUser = u.find(user => user.userId === testerId || user.id === testerId);
      
      if (!currentUser) {
        // If tester not in DB, create initial record or use first user as template but override ID
        currentUser = {
          id: testerId,
          userId: testerId,
          name: "User Tester",
          points: 1000,
          cashback: 0,
          level: "GOLD",
          streakCount: 0,
          referralCode: "TESTER999",
          is_active: true
        } as any;
      } else {
        // Ensure name and level are as requested for the test
        currentUser = {
          ...currentUser,
          name: "User Tester",
          level: "GOLD"
        };
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("User view error:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleExchange = async (voucher: Voucher) => {
    if (!user) return;
    const userId = user.userId || user.id || 'USR-999';
    if (user.points < voucher.points_cost) {
      toast.error('Poin tidak cukup!');
      return;
    }

    setExchanging(voucher.id);
    try {
      // 1. Deduct points with history
      await dbService.updatePoints(
        userId, 
        -voucher.points_cost, 
        `Tukar Voucher: ${voucher.title}`
      );
      
      toast.success('Voucher berhasil ditukar!');
      loadData(true);
    } catch (err) {
      toast.error('Gagal menukar voucher');
    } finally {
      setExchanging(null);
    }
  };

  const handleClaimMission = async (mission: Mission) => {
    if (!user) return;
    const userId = user.userId || user.id || 'USR-999';
    setClaimingMission(mission.id);
    try {
      // Add points
      await dbService.updatePoints(
        userId, 
        mission.reward_points, 
        `Klaim Misi: ${mission.title}`
      );
      
      toast.success(`Misi "${mission.title}" diklaim! +${mission.reward_points} PTS`);
      loadData(true);
    } catch (err) {
      toast.error('Gagal mengklaim misi');
    } finally {
      setClaimingMission(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-[var(--text-muted-premium)] font-bold uppercase tracking-widest text-xs animate-pulse">Menyingkronkan Profil Pengguna...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="relative premium-card overflow-hidden p-8 sm:p-12 bg-white shadow-xl shadow-orange-100/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-3xl bg-[var(--accent-premium)] flex items-center justify-center text-white shadow-2xl shadow-orange-200">
            <UserIcon className="w-12 h-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[var(--text-muted-premium)] text-xs font-black uppercase tracking-[0.3em] mb-2">{user?.level || 'Memulai...'}</p>
            <h2 className="text-4xl font-black tracking-tight mb-4 text-[var(--text-premium)]">{user?.name || 'Penjelajah'}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 text-[var(--text-premium)]">
                <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span className="text-sm font-bold tracking-tight">{user?.points?.toLocaleString() || 0} PTS</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 text-[var(--text-premium)]">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold tracking-tight">Rp {user?.cashback?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 text-[var(--text-premium)]">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold tracking-tight">{user?.streakCount || 0} STREAK</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-xl border border-orange-100 font-mono text-[10px] uppercase tracking-wider text-orange-400">
                REF: {user?.referralCode}
              </div>
            </div>
            
            {user?.badges && user.badges.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {user.badges.map((badge, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-orange-500 border border-orange-200 shadow-sm">
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Games Section */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 text-[var(--text-premium)]">
              <Gamepad2 className="w-6 h-6 text-orange-500" />
              Hiburan & Gacha
            </h3>
            <span className="text-[10px] font-black text-orange-600 px-3 py-1 bg-orange-100 rounded-full border border-orange-200">{games.length} Game Aktif</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {games.map(game => (
              <motion.div 
                key={game.id}
                whileHover={{ y: -5 }}
                onClick={() => {
                  if (game.type === 'SPINWHEEL' || game.type === 'SCRATCHCARD' || game.type === 'DAILY_STREAK') {
                    setActiveGame(game);
                  }
                }}
                className="premium-card p-8 group cursor-pointer relative overflow-hidden bg-white shadow-lg shadow-orange-100/50"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-100 transition-colors"></div>
                
                <div className="flex flex-col gap-6 items-start relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${game.type === 'SPINWHEEL' ? 'bg-orange-50 text-orange-500 border border-orange-100' : 'bg-orange-50 text-orange-400 border border-orange-100'}`}>
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tighter uppercase mb-2 text-[var(--text-premium)]">{game.name}</h4>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-black text-orange-600">{game.cost_points} PTS</span>
                      </div>
                      <p className="text-[10px] font-bold text-orange-300 uppercase tracking-widest">Entry Fee</p>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-orange-50 border border-orange-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-orange-500 group-hover:text-white transition-all text-orange-500">
                    Mulai Main
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Missions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text-premium)]">
              <History className="w-5 h-5 text-orange-500" />
              Operasi
            </h3>
            <span className="text-[10px] font-black text-orange-600 px-2 py-1 bg-orange-100 rounded-full">{missions.length} Terdaftar</span>
          </div>
          <div className="space-y-3">
            {missions.map((mission) => (
              <motion.div 
                whileHover={{ x: 8 }}
                key={mission.id} 
                onClick={() => handleClaimMission(mission)}
                className={`premium-card p-5 group cursor-pointer flex items-center justify-between hover:border-orange-300 transition-all bg-white ${claimingMission === mission.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-orange-50 text-orange-500`}>
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-premium)]">{mission.title}</h4>
                    <p className="text-[10px] text-[var(--text-muted-premium)] line-clamp-1">{mission.description}</p>
                  </div>
                </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-orange-500">
                      {claimingMission === mission.id ? 'CLAIMING...' : `+${mission.reward_points} PTS`}
                    </p>
                  </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rewards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text-premium)]">
              <Ticket className="w-5 h-5 text-orange-500" />
              Hadiah
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {vouchers.map((voucher) => (
              <div key={voucher.id} className="premium-card overflow-hidden group bg-white shadow-md shadow-orange-100/50">
                <div className="aspect-[16/9] bg-orange-50 relative">
                  {voucher.image_url ? (
                    <img src={voucher.image_url} alt={voucher.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-100">
                      <Ticket className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-black text-orange-500 border border-orange-100 shadow-sm">
                    {voucher.points_cost} PTS
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[11px] mb-3 line-clamp-1 h-4 text-[var(--text-premium)] uppercase">{voucher.title}</h4>
                  <button 
                    onClick={() => handleExchange(voucher)}
                    disabled={exchanging === voucher.id}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg shadow-orange-100"
                  >
                    {exchanging === voucher.id ? 'Exchanging...' : 'Exchange'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {activeGame && user && activeGame.type === 'SPINWHEEL' && (
          <SpinwheelUser 
            game={activeGame} 
            user={user} 
            onClose={() => setActiveGame(null)} 
            onUpdateUser={() => loadData(true)}
          />
        )}
        {activeGame && user && activeGame.type === 'SCRATCHCARD' && (
          <ScratchCard 
            game={activeGame} 
            user={user} 
            onClose={() => setActiveGame(null)} 
            onUpdateUser={() => loadData(true)}
          />
        )}
        {activeGame && user && activeGame.type === 'DAILY_STREAK' && (
          <DailyStreakUser 
            game={activeGame} 
            user={user} 
            onClose={() => setActiveGame(null)} 
            onUpdateUser={() => loadData(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
