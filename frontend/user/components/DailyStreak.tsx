import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { Calendar, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/apiService';

const DailyStreak: React.FC = () => {
  const {
    user,
    refreshData,
    addNotification,
    games,
  } = useApp();

  const [isClaiming, setIsClaiming] = useState(false);
  
  // State lokal untuk me-lock tombol instan setelah sukses
  // agar user tidak klik 2x saat menunggu refreshData dari server
  const [localCheckedIn, setLocalCheckedIn] = useState(false);

  const streakConfig = games.find(
    g => g.type === 'DAILY_STREAK'
  );

  let streakConfigParsed: {
    baseReward?: number;
    streakBonus?: number;
    maxDays?: number;
  } = {};

  try {
    const raw = streakConfig?.config_data;

    streakConfigParsed =
      typeof raw === 'string'
        ? JSON.parse(raw)
        : (raw || {});
  } catch {
    streakConfigParsed = {};
  }

  // Fallback disesuaikan dengan nilai standar di Admin
  const maxDays = Number(streakConfigParsed.maxDays) || 7;
  const baseReward = Number(streakConfigParsed.baseReward) || 100;
  const streakBonus = Number(streakConfigParsed.streakBonus) || 1000;

  const streakRewards = Array.from(
    { length: maxDays },
    (_, index) =>
      index === maxDays - 1
        ? baseReward + streakBonus
        : baseReward
  );

  const today = new Date().toLocaleDateString(
    'en-CA',
    { timeZone: 'Asia/Jakarta' }
  );

  // 1. PERBAIKAN: Format tanggal dari DB agar sama persis dengan variabel 'today' (YYYY-MM-DD)
  let userLastCheckInDate = '';
  if (user?.lastCheckIn) {
    try {
      userLastCheckInDate = new Date(user.lastCheckIn).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    } catch (e) {}
  }

  // Gunakan tanggal yang sudah diformat untuk perbandingan
  const isCheckedInToday = (userLastCheckInDate === today) || localCheckedIn;

  const canClaim = !isCheckedInToday;
  
  const handleClaim = async () => {
    if (!user || isClaiming) return;

    if (!canClaim) {
      addNotification('Streak sudah diclaim, coba lagi besok ya', 'error');
      return;
    }

    setIsClaiming(true);

    try {
      console.log('Claiming streak for user:', user.id);

      const currentDay = Math.min(
        user?.streakCount || 0,
        streakRewards.length - 1
      );

      const rewardPoints = streakRewards[currentDay] || baseReward;

      const response: any = await apiService.dailyCheckIn(user.id);
      const result = response.data;

      if (result) {
        setLocalCheckedIn(true);
        
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFD700', '#FFFFFF'],
        });

        if (refreshData) {
          await refreshData();
        }
      } else {
        addNotification(
          result?.message || 'Gagal check-in.',
          'error'
        );
      }
    } catch (error: any) {
      console.error('Streak claim error:', error);

      addNotification(
        `Gagal check-in: ${
          error?.response?.data?.message || error?.message || 'Error Sistem'
        }`,
        'error'
      );
    } finally {
      setIsClaiming(false);
    }
  };
  
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-orange-50 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,165,0,0.05),transparent)] pointer-events-none"></div>
      
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-100">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Daily <span className="text-orange-500">Streak</span></h2>
              <p className="text-slate-500 text-xs font-medium">
                Absen setiap hari untuk mendapatkan bonus poin yang terus meningkat!
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Streak</p>
              <p className="text-lg font-black text-orange-500">{user?.streakCount ?? 0} Hari</p>
            </div>
            
            <button 
              onClick={handleClaim}
              disabled={isClaiming}
              className={`min-w-[200px] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isCheckedInToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-orange-400 text-white hover:bg-orange-500 shadow-xl shadow-orange-100 active:scale-95'
              }`}
            >
              {isClaiming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : isCheckedInToday ? (
                'Kembali Besok!'
              ) : (
                'Klaim Poin Hari Ini'
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {streakRewards.map((points, index) => {
            const dayNum = index + 1;
            const isClaimed = (user?.streakCount || 0) >= dayNum;
            const isNext = (user?.streakCount || 0) + 1 === dayNum && !isCheckedInToday;

            return (
              <motion.div 
                key={dayNum}
                whileHover={isNext ? { scale: 1.05 } : {}}
                className={`relative p-5 rounded-3xl border transition-all duration-500 flex flex-col items-center justify-center gap-3 ${
                  isClaimed 
                  ? 'bg-orange-50 border-orange-200 shadow-sm' 
                  : isNext
                    ? 'bg-white border-orange-300 border-dashed animate-pulse shadow-md shadow-orange-50'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <p className={`text-[9px] font-black uppercase tracking-widest ${isClaimed ? 'text-orange-600' : 'text-slate-400'}`}>
                  Hari {dayNum}
                </p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isClaimed ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {isClaimed ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                </div>
                <p className={`text-xs font-black ${isClaimed ? 'text-slate-900' : 'text-slate-400'}`}>+{points} Pts</p>
                
                {isClaimed && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <CheckCircle2 size={12} className="text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DailyStreak;