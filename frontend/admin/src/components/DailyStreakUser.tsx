/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Zap, TrendingUp, CheckCircle2, Star } from 'lucide-react';
import { GameSetting, User } from '../types';
import { dbService } from '../services/dbService';
import { toast } from 'react-hot-toast';

interface DailyStreakUserProps {
  game: GameSetting;
  user: User;
  onClose: () => void;
  onUpdateUser: () => void;
}

export default function DailyStreakUser({ game, user, onClose, onUpdateUser }: DailyStreakUserProps) {
  const [config, setConfig] = useState({ baseReward: 100, streakBonus: 1000, maxDays: 7 });
  const [loading, setLoading] = useState(false);
  const [isCheckInAvailable, setIsCheckInAvailable] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(game.config_data || '{}');
      setConfig({
        baseReward: data.baseReward || 100,
        streakBonus: data.streakBonus || 1000,
        maxDays: data.maxDays || 7
      });
    } catch (e) {
      console.error("Invalid daily streak config", e);
    }
  }, [game.config_data]);

  useEffect(() => {
    // Check if user can check-in today
    if (!user.last_checkin_at) {
      setIsCheckInAvailable(true);
      return;
    }

    const lastCheckin = new Date(user.last_checkin_at);
    const today = new Date();
    
    // reset to midnight for comparison
    lastCheckin.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (today.getTime() > lastCheckin.getTime()) {
      setIsCheckInAvailable(true);
    } else {
      setIsCheckInAvailable(false);
    }
  }, [user.last_checkin_at]);

  const handleCheckIn = async () => {
    if (!isCheckInAvailable || loading) return;

    setLoading(true);
    try {
      const lastCheckin = user.last_checkin_at ? new Date(user.last_checkin_at) : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let newStreak = 1;
      if (lastCheckin) {
        lastCheckin.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastCheckin.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          newStreak = (user.current_streak || 0) + 1;
        } else if (diffDays > 1) {
          // Streak broken
          newStreak = 1;
        } else if (diffDays === 0) {
          toast.error('Sudah absen hari ini!');
          setLoading(false);
          return;
        }
      }

      // Calculate rewards
      let reward = config.baseReward;
      const isMilestone = newStreak % config.maxDays === 0;
      if (isMilestone) {
        reward += config.streakBonus;
      }

      await Promise.all([
        dbService.updateUser(user.id, {
          current_streak: newStreak,
          max_streak: Math.max(user.max_streak || 0, newStreak),
          last_checkin_at: new Date().toISOString()
        }),
        dbService.updatePoints(user.id, reward, `Daily Check-in Day ${newStreak}`)
      ]);

      // Mematikan state absen seketika agar mencegah multiple klik sebelum refresh data
      setIsCheckInAvailable(false);

      onUpdateUser();
      toast.success(`Absen Berhasil! +${reward} Poin`);
      if (isMilestone) {
        toast.success(`Bonus Streak ${config.maxDays} Hari: +${config.streakBonus} Poin!`, {
          icon: '🎉',
          duration: 4000
        });
      }
    } catch (err) {
      toast.error('Gagal melakukan absen');
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: config.maxDays }, (_, i) => i + 1);
  const currentDayInCycle = ((user.current_streak || 0) % config.maxDays) || (user.current_streak ? config.maxDays : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/20 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border border-indigo-100 w-full max-w-xl rounded-[3rem] shadow-[0_20px_70px_-10px_rgba(99,102,241,0.2)] p-10 space-y-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-premium)]">Daily Streak</h2>
              <p className="text-xs text-[var(--text-muted-premium)] font-bold uppercase tracking-widest mt-1">Konsistensi Mendapatkan Reward</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-indigo-50 text-indigo-300 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Streak Aktif</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <span className="text-2xl font-black text-indigo-600">{user.current_streak || 0} Hari</span>
            </div>
          </div>
          <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl space-y-1">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Total Poin</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-black text-amber-600">{(user.points || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
              Progress Minggu Ini
            </h4>
            <span className="text-[10px] font-bold text-indigo-300 cursor-help">Reset setiap {config.maxDays} hari</span>
          </div>
          
          <div className="flex justify-between gap-2 p-2 bg-indigo-50/30 border border-indigo-100 rounded-3xl">
            {days.map((day) => {
              const isToday = isCheckInAvailable && day === (currentDayInCycle + 1);
              const isPast = day <= currentDayInCycle;
              const isBonus = day === config.maxDays;

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-3 py-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isPast ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-100' :
                    isToday ? 'bg-white border-2 border-dashed border-indigo-400 text-indigo-400 animate-pulse' :
                    'bg-white border border-indigo-100 text-indigo-200'
                  }`}>
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-black">{day}</span>}
                  </div>
                  {isBonus && (
                    <div className="flex items-center gap-1">
                      <Zap className={`w-3 h-3 ${isPast ? 'text-amber-500' : 'text-indigo-200'}`} />
                      <span className={`text-[8px] font-black ${isPast ? 'text-amber-500' : 'text-indigo-200'}`}>BONUS</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 pt-4">
          {isCheckInAvailable ? (
            <button 
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full py-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-[2rem] font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Meproses Absen...' : 'Klik Untuk Ambil Poin'}
            </button>
          ) : (
            <div className="w-full py-6 bg-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center gap-3 border border-slate-200">
               <CheckCircle2 className="w-6 h-6" />
               <span className="font-black text-sm uppercase tracking-widest">Sudah Absen Hari Ini</span>
            </div>
          )}
          <p className="text-center mt-6 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Status: Siap Memberikan Reward Berkelanjutan</p>
        </div>
      </motion.div>
    </div>
  );
}