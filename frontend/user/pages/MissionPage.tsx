
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from '../types';
import { 
  Trophy, Dices, Star, RotateCw, Hand, 
  Gift, CheckCircle2, ChevronRight, Zap,
  ArrowRight, Sparkles, Target, X,
  LayoutGrid, ListTodo, Calendar,
  Lock, AlertTriangle, Coins,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Spinwheel from '../components/Spinwheel';
import SpinwheelGame from '../components/SpinwheelGame';
import DailyStreak from '../components/DailyStreak';
import { apiService } from '../services/apiService';

interface GameConfig {
  id: string;
  name: string;
  type: 'wheel' | 'scratch';
  cost_points: number;
  start_date: string;
  end_date: string;
  prizes: any[];
}

interface StreakConfig {
  day: number;
  reward: string;
  type: string;
  value: any;
}

const MissionPage: React.FC = () => {
  const { user, addPoints, isLoading: appLoading, missions, setPointsAndStreak, games: ctxGames, checkIn, completeMission } = useApp();
  const navigate = useNavigate();
  
  // States
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGame, setShowGame] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  // Group games by type for unified display
  const spinGame = games.find(g => g.type === 'SPINWHEEL');
  const otherGames = games.filter(g => g.type !== 'SPINWHEEL');

  // Find dynamic streak config from games
  const streakGame = ctxGames.find(g => g.type === 'DAILY_STREAK');
  const isStreakActive = streakGame?.is_active === true;

  // Sync local games with context games
  useEffect(() => {
    // If games are fetched (even if empty), we can stop local loading
    // We check ctxGames directly. ctxGames is initialized to [] in context.
    // If refreshData finished (lastSyncStatus is not idle), we can stop loading.
    if (ctxGames) {
      setGames(ctxGames.filter(g => g.type !== 'DAILY_STREAK'));
      setLoading(false);
    }
  }, [ctxGames]);

  const activeGame = games.find(g => g.id === showGame);

  const handlePlay = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game || !user) return;

    // Explicitly cast to numbers to avoid type issues
    const userPoints = Math.round(Number(user.points) || 0);
    const gameCost = Math.round(Number(game.cost_points) || 0);

    if (!game.is_active) {
      setErrorModal('Game sedang ditutup sementara.');
      return;
    }

    if (gameCost > 0 && userPoints < gameCost) {
      setErrorModal(`Poin Anda tidak mencukupi. Biaya main adalah ${gameCost} Poin.`);
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    try {
      const cooldownCheckRes = await apiService.checkGameCooldown(user.id, game.id);
      const cooldownCheck = cooldownCheckRes.data;
      if (!cooldownCheck.allowed) {
        setErrorModal(cooldownCheck.message || 'Anda masih dalam cooldown.');
        setIsPlaying(false);
        return;
      }

      // 1. Deduct cost first
      if (game.cost_points > 0) {
        await addPoints(-game.cost_points, "Bermain Game");
      }

      // 2. Calculate dynamic result from config_data probabilities
      const segments = Array.isArray(game.config_data) ? game.config_data : [];
      
      if (segments.length === 0) {
        setErrorModal('Hadiah game belum dikonfigurasi oleh admin. Silakan coba game lain.');
        setIsPlaying(false);
        return;
      }
      
      const getSegmentProbability = (segment: Record<string, unknown>) =>
        Number(segment.probability ?? segment.Probability ?? segment.probabilitas ?? 0) || 0;

      const getRandomReward = (rewards: any[]) => {
        const totalProb = rewards.reduce((acc, s) => acc + getSegmentProbability(s), 0);
        if (totalProb <= 0) return rewards[Math.floor(Math.random() * rewards.length)];
        
        let random = Math.random() * totalProb;
        for (const segment of rewards) {
          const prob = getSegmentProbability(segment);
          if (random < prob) return segment;
          random -= prob;
        }
        return rewards[rewards.length - 1];
      };

      const winReward = getRandomReward(segments);
      const prizeValue = Number(winReward.Value || winReward.value || 0) || 0;
      const prizeLabel = winReward.Label || winReward.label || 'Zonk';
      const prizeType = prizeValue > 0 ? 'POINTS' : 'ZONK';

      // 3. Animation Logic
      if (game.type === 'SPINWHEEL') {
        const idx = segments.indexOf(winReward);
        const segmentsCount = segments.length || 6;
        const segmentAngle = 360 / segmentsCount;
        const targetStopAngle = 360 - (idx * segmentAngle);
        
        const extraSpins = 5 * 360; 
        const nextRotation = rotation + extraSpins + (targetStopAngle - (rotation % 360));
        setRotation(nextRotation);
        
        await new Promise(r => setTimeout(r, 4500)); // Wait for spin
      } else {
        await new Promise(r => setTimeout(r, 2000)); 
      }

      // 4. Update Result and Add Points
      const resultData = {
        success: true,
        prizeLabel,
        prizeValue,
        prizeType,
        message: prizeValue > 0 ? `Selamat! Anda memenangkan ${prizeLabel}` : 'Yah, coba lagi lain kali ya!'
      };

      setGameResult(resultData);
      
      // NOTE: playGame menggunakan placeholder karena endpoint backend belum tersedia
      // Logika game tetap dijalankan di frontend untuk development
      // await apiService.playGame(user.id, game.id);

      if (prizeValue > 0) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FB923C', '#FFFFFF', '#FFEDD5']
        });
      }
    } catch (err) {
      console.error(err);
      setErrorModal('Terjadi kesalahan saat memproses game. Silakan coba lagi.');
    } finally {
      setIsPlaying(false);
    }
  };

  const isExpired = (endDate: string) => new Date() > new Date(endDate);

  if (loading || appLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 md:p-8 space-y-8 pb-32">
      
      {/* 1. PREMIUM HEADER */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-orange-50 border border-orange-100 p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-12 opacity-10 text-orange-200 pointer-events-none">
          <Sparkles size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white border border-orange-200 text-orange-600 px-4 py-1.5 rounded-full w-fit">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Member Play Area</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-900">
              GAME <span className="text-orange-500 italic">& MISI</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-sm text-sm">
              Selesaikan misi harian dan mainkan game seru untuk mengumpulkan poin reward.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white border border-orange-100 px-8 py-4 rounded-3xl shadow-sm">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Saldo Poin</p>
              <div className="flex items-center gap-2">
                <Coins size={20} className="text-orange-500" />
                <span className="text-2xl font-black text-slate-900">{user?.points?.toLocaleString() ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DAILY STREAK SECTION */}
      <DailyStreak />

      {/* 3. ELITE PLAY ZONE */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="w-10 h-10 bg-orange-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100">
            <Trophy size={20} />
          </div>
          <h2 className="text-xl font-black tracking-tight uppercase text-slate-800">Area Bermain</h2>
        </div>

        {/* UNIFIED GAMES GRID */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {games.map((game, idx) => {
              const hasExpired = isExpired(game.end_date);
              const isSpin = game.type === 'SPINWHEEL';
              const Icon = isSpin ? RotateCw : Hand;
              
              return (
                <motion.div
                  key={`${game.id}-${idx}`}
                  whileHover={!hasExpired && game.is_active ? { y: -8 } : {}}
                  onClick={() => !hasExpired && game.is_active && setShowGame(game.id)}
                  className={`group relative h-[260px] rounded-[3rem] overflow-hidden border transition-all duration-500 cursor-pointer shadow-xl ${
                    hasExpired || !game.is_active
                    ? 'border-slate-100 grayscale cursor-not-allowed opacity-60 bg-slate-50' 
                    : 'border-orange-50 bg-white'
                  }`}
                >
                  {/* Decorative Background Icon */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <Icon size={300} className="absolute -top-10 -right-10 text-orange-400" />
                  </div>

                  <div className="relative h-full p-10 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center">
                        <Icon size={20} className="text-orange-500" />
                      </div>
                      {(hasExpired || !game.is_active) && (
                        <div className="bg-slate-100 text-slate-400 border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          Selesai
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight mb-1 uppercase text-slate-900">{game.name}</h3>
                        <p className="text-slate-500 text-xs font-medium">
                          {isSpin ? 'Putar roda dan menangkan hadiah menarik!' : 'Uji keberuntungan scratching Anda sekarang.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          disabled={!game.is_active || hasExpired || (user && Math.round(Number(user.points) || 0) < Math.round(Number(game.cost_points) || 0))}
                          className={`px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            !game.is_active || hasExpired || (user && Math.round(Number(user.points) || 0) < Math.round(Number(game.cost_points) || 0))
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-orange-400 text-white hover:bg-orange-500 shadow-md shadow-orange-100'
                          }`}
                        >
                          {user && Math.round(Number(user.points) || 0) < Math.round(Number(game.cost_points) || 0) ? 'Poin Kurang' : `Main - ${Math.round(Number(game.cost_points) || 0).toLocaleString()} Poin`}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] p-16 text-center text-slate-400 italic">
             Tidak ada game aktif saat ini.
          </div>
        )}
      </section>

      {/* 4. MISSIONS BOARD */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-orange-100 text-orange-500 rounded-2xl flex items-center justify-center shadow-sm">
              <ListTodo size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase text-slate-800">Daftar Misi</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((m, idx) => (
            <div 
              key={`${m.id}-${idx}`}
              className={`bg-white border p-6 rounded-[2rem] space-y-6 transition-all group shadow-sm hover:shadow-md ${m.completed ? 'border-green-100 opacity-70' : 'border-orange-50 hover:border-orange-200'}`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.completed ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {m.completed ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                </div>
<div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-100">
                   +{Number(m.rewardPoints ?? m.reward_points ?? 0)} PTS
                 </div>
              </div>
              
              <div>
                <h3 className={`text-lg font-black ${m.completed ? 'text-slate-400' : 'text-slate-900'}`}>{m.title}</h3>
                <p className="text-slate-500 text-xs font-medium mt-1">{m.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Progress</span>
                  <span className="text-slate-900">{Number(m.progress ?? m.progress ?? 0)} / {Number(m.total ?? m.target ?? 0)}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${m.completed ? 'bg-green-500' : 'bg-orange-400'}`}
                    style={{ width: `${Math.min(100, ((m.progress ?? 0) / (m.total ?? m.target ?? 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                disabled={m.completed || (m.progress ?? 0) < (m.total ?? m.target ?? 0)}
                onClick={() => completeMission(m.id)}
                className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  m.completed 
                  ? 'bg-slate-50 border border-slate-100 text-slate-400 cursor-not-allowed' 
                  : ((m.progress ?? 0) >= (m.total ?? m.target ?? 0)
                    ? 'bg-orange-400 text-white hover:bg-orange-500 shadow-lg shadow-orange-100 active:scale-95 border-none' 
                    : 'bg-white border border-slate-100 text-slate-400 opacity-50 cursor-not-allowed')
                }`}
              >
                {m.completed ? 'Selesai' : ((m.progress ?? 0) >= (m.total ?? m.target ?? 0) ? 'Klaim Hadiah!' : 'Proses')}
              </button>
            </div>
          ))}
          {missions.length === 0 && (
            <div className="md:col-span-3 bg-slate-50 border border-dashed border-slate-200 rounded-[3rem] p-16 text-center text-slate-400 italic">
               Tidak ada misi aktif saat ini.
            </div>
          )}
        </div>
      </section>

      {/* GAME MODAL */}
      <AnimatePresence>
        {activeGame && (
          activeGame.type === 'SPINWHEEL' ? (
            <SpinwheelGame 
              game={activeGame} 
              onClose={() => setShowGame(null)} 
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/90 z-[500] flex items-center justify-center p-6 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[3rem] p-10 border border-orange-100 shadow-2xl relative overflow-hidden"
              >
                {/* Orange Glow Decor */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-100 rounded-full blur-[80px]"></div>
                
                <button 
                  onClick={() => !isPlaying && setShowGame(null)} 
                  className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
                  disabled={isPlaying}
                >
                   <X size={24} />
                </button>

                <div className="text-center space-y-10 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">{activeGame.name}</h2>
                    <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Elite Reward Level</p>
                  </div>

                  <div className="relative flex items-center justify-center py-6">
                    <div className="w-full h-48 bg-slate-50 rounded-3xl border-2 border-orange-50 flex flex-col items-center justify-center relative overflow-hidden group">
                       {!gameResult && !isPlaying ? (
                         <div className="absolute inset-0 bg-orange-400 flex flex-col items-center justify-center text-white font-black p-6 text-center">
                            <Hand size={40} className="mb-4 animate-bounce" />
                            <p className="text-[10px] uppercase tracking-[0.3em]">Surface</p>
                            <p className="text-xs mt-2 opacity-70">Konfirmasi untuk menggosok</p>
                         </div>
                       ) : isPlaying ? (
                         <div className="text-center space-y-4">
                            <motion.div
                              animate={{ 
                                x: [0, 10, -10, 10, 0],
                                y: [0, -10, 10, -10, 0]
                              }}
                              transition={{ repeat: Infinity, duration: 0.5 }}
                            >
                              <Hand size={48} className="mx-auto text-orange-400" />
                            </motion.div>
                            <p className="font-black text-orange-500 uppercase text-[10px] tracking-[0.3em]">GOSOK AREA...</p>
                         </div>
                       ) : (
                         <motion.div 
                           initial={{ scale: 0.5, opacity: 0 }} 
                           animate={{ scale: 1, opacity: 1 }}
                           className="text-center"
                         >
                            <p className="text-orange-500 font-black text-[10px] uppercase tracking-widest mb-2">You Won!</p>
                            <h3 className="text-4xl font-black text-slate-900 italic">{gameResult.prizeLabel}</h3>
                         </motion.div>
                       )}
                    </div>
                  </div>

                  {gameResult ? (
                    <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 shadow-sm">
                      <div className="text-center space-y-2">
                         <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">HASIL PERMAINAN</p>
                         <p className={`text-2xl font-black ${gameResult.prizeType === 'ZONK' ? 'text-slate-500' : 'text-orange-600'}`}>
                           {gameResult.prizeLabel}
                         </p>
                         <p className="text-slate-500 text-xs font-medium leading-relaxed">
                            {gameResult.message}
                         </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={() => {
                            setGameResult(null);
                            setShowGame(null);
                          }}
                          className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all bg-orange-400 text-white hover:bg-orange-500 shadow-md shadow-orange-100`}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      disabled={isPlaying || (user && Math.round(Number(user.points) || 0) < Math.round(Number(activeGame.cost_points) || 0))}
                      onClick={() => handlePlay(activeGame.id)}
                      className="w-full py-5 bg-orange-400 text-white rounded-2xl font-black text-sm hover:bg-orange-500 disabled:opacity-50 transition-all shadow-xl shadow-orange-100 uppercase tracking-[0.2em] active:scale-95"
                    >
                      {isPlaying ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RotateCw size={18} /></motion.div>
                          Tunggu...
                        </span>
                      ) : (
                        user && Math.round(Number(user.points) || 0) < Math.round(Number(activeGame.cost_points) || 0)
                        ? 'Poin Tidak Mencukupi'
                        : 'Konfirmasi Main'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* ERROR MODAL (NOTIFIKASI) */}
      <AnimatePresence>
        {errorModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/90 z-[600] flex items-center justify-center p-6 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white w-full max-w-sm rounded-[3rem] p-10 border text-center space-y-6 shadow-2xl relative overflow-hidden ${
                errorModal.includes('mencukupi') ? 'border-red-100' : 'border-orange-100'
              }`}
            >
              <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] ${
                errorModal.includes('mencukupi') ? 'bg-red-50' : 'bg-orange-50'
              }`}></div>

              <div className={`w-20 h-20 border rounded-full flex items-center justify-center mx-auto shadow-sm ${
                errorModal.includes('mencukupi') || errorModal.includes('Poin') 
                ? 'bg-red-50 border-red-100 text-red-500 shadow-red-50' 
                : 'bg-orange-50 border-orange-100 text-orange-500 shadow-orange-50'
              }`}>
                {errorModal.includes('mencukupi') || errorModal.includes('Poin') ? <AlertTriangle size={36} /> : <Lock size={36} />}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase text-slate-900 tracking-tight">
                  {errorModal.includes('mencukupi') || errorModal.includes('Poin') ? 'Akses Terbatas' : 'Pemberitahuan'}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  {errorModal}
                </p>
              </div>

              <button 
                onClick={() => setErrorModal(null)}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg ${
                  errorModal.includes('mencukupi') || errorModal.includes('Poin')
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-100'
                  : 'bg-orange-400 text-white hover:bg-orange-500 shadow-orange-100'
                }`}
              >
                Kembali
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MissionPage;
