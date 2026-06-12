/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RotateCw, Sparkles, Coins, Ticket, Trophy, Frown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../AppContext';
import { Game } from '../types';
import Spinwheel from './Spinwheel';
import { apiService } from '../services/apiService';

interface SpinwheelGameProps {
  game: Game;
  onClose: () => void;
  onUpdateUser?: () => void;
}

const SpinwheelGame: React.FC<SpinwheelGameProps> = ({ game, onClose, onUpdateUser }) => {
  // Menggunakan addNotification bawaan Anda sebagai pengganti react-hot-toast
  const { user, addNotification, refreshData } = useApp(); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);

  const handlePlay = async () => {
    if (!user || isPlaying) return;

    const userPoints = Math.round(Number(user.points) || 0);
    const gameCost = Math.round(Number(game.cost_points) || 0);

    if (gameCost > 0 && userPoints < gameCost) {
      addNotification(`Poin Anda tidak mencukupi (Butuh ${gameCost} Poin)`, 'error');
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    try {
      // 1. Panggil Backend via apiService untuk Acak & Potong Poin (Anti-Cheat)
      const response: any = await apiService.playGame(user.id, game.id);
      const resData = response?.data;
      
      // Validasi jika backend belum tersedia
      if (!resData?.success) {
        addNotification(
          resData?.message ?? 'Game sedang dalam pengembangan',
          'info'
        );
        setIsPlaying(false);
        return;
      }

      const resultData = resData.data;
      
      // Validasi data hadiah ada
      if (!resultData) {
        addNotification('Tidak ada data hadiah dari server', 'error');
        setIsPlaying(false);
        return;
      }

      // 2. Parsing config_data untuk mencocokkan jumlah potongan roda
      let segments = [];
      try {
        segments = Array.isArray(game.config_data) 
          ? game.config_data 
          : (typeof game.config_data === 'string' ? JSON.parse(game.config_data) : []);
      } catch (e) {
        segments = [];
      }
      const segmentsCount = segments.length || 6;
      
      // 3. Kalkulasi Animasi (Math) dengan nilai aman
      const selectedIdx = resultData?.selectedIndex ?? 0;
      const segmentAngle = 360 / segmentsCount;
      const targetStopAngle = 270 - ((selectedIdx + 0.5) * segmentAngle); 
      const extraSpins = 8 * 360; 
      
      const currentMod = rotation % 360;
      let angleDiff = targetStopAngle - currentMod;
      if (angleDiff <= 0) angleDiff += 360; 
      
      const nextRotation = rotation + extraSpins + angleDiff;
      setRotation(nextRotation);
      
      // Tunggu animasi roda berhenti (4.5 detik sesuai durasi di Spinwheel component)
      await new Promise(r => setTimeout(r, 4500));

      // 4. Update UI & Refresh Saldo Poin
      if (typeof refreshData === 'function') {
         refreshData(); 
      } else if (typeof onUpdateUser === 'function') {
         onUpdateUser();
      }

      // [PERBAIKAN]: Cek kemenangan berdasarkan Tipe atau Angka (menangani Voucher Teks)
      const prizeLabel = resultData?.prizeLabel ?? 'Tidak ada hadiah';
      const prizeValue = Number(resultData?.prizeValue ?? 0);
      const rewardType = resultData?.rewardType ?? 'POINT';
      const isVoucher = rewardType === 'VOUCHER';
      const numericValue = Number(String(prizeLabel).replace(/[^0-9]/g, '')) || 0;
      const isZonk = rewardType === 'POINT' && numericValue === 0 && !isVoucher;

      // Hapus deklarasi colors agar tidak ada error charCodeAt
      if (!isZonk) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      // [PERBAIKAN TERBARU]: Mengganti kata "Katalog" menjadi "Koleksi"
      let resultMessage = 'Yah, coba lagi lain kali ya!';
      if (isVoucher) {
        resultMessage = `Keren! Voucher "${prizeLabel}" otomatis masuk ke Koleksi Anda.`;
      } else if (!isZonk) {
        resultMessage = `Selamat! Saldo Anda bertambah sebesar ${prizeLabel}.`;
      }

      setGameResult({
        prizeLabel: isZonk ? 'YAH, ZONK!' : prizeLabel,
        prizeValue,
        rewardType,
        isZonk,
        message: resultMessage
      });

    } catch (err: any) {
      console.error(err);
      addNotification(err.message || 'Terjadi kesalahan saat memutar roda.', 'error');
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 z-[500] flex items-center justify-center p-6 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-md rounded-[3rem] p-10 border border-orange-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 blur-[60px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-50 blur-[60px] rounded-full"></div>
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
          disabled={isPlaying}
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{game.name}</h2>
            <div className="flex items-center justify-center gap-2 text-orange-400 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              <span>Lucky Play Mode</span>
              <Sparkles size={12} />
            </div>
          </div>

          <div className="flex justify-center py-4">
            <Spinwheel 
              configData={game.config_data} 
              rotation={rotation} 
              isPlaying={isPlaying} 
            />
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {gameResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 border border-orange-100 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex justify-center -mt-2">
                    {gameResult.rewardType === 'VOUCHER' ? (
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center"><Ticket size={24} /></div>
                    ) : gameResult.isZonk ? (
                      <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center"><Frown size={24} /></div>
                    ) : (
                      <div className="w-12 h-12 bg-orange-200 text-orange-600 rounded-full flex items-center justify-center"><Trophy size={24} /></div>
                    )}
                  </div>

                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Game Selesai</p>
                  <h3 className="text-2xl font-black text-slate-900 italic">{gameResult.prizeLabel}</h3>
                  <p className="text-slate-500 text-xs font-medium px-2">{gameResult.message}</p>
                  
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-orange-400 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 transition-all shadow-md shadow-orange-100"
                  >
                    Tutup Game
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Coins size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saldo Poin</p>
                        <p className="text-lg font-black text-slate-900 tabular-nums">{user?.points?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Biaya Main</p>
                       <p className="text-lg font-black text-orange-600 tabular-nums">-{Math.round(Number(game.cost_points) || 0)}</p>
                    </div>
                  </div>

                  <button 
                    disabled={isPlaying || (user && Math.round(Number(user.points) || 0) < Math.round(Number(game.cost_points) || 0))}
                    onClick={handlePlay}
                    className="w-full py-5 bg-orange-400 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <span className="flex items-center justify-center gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RotateCw size={18} /></motion.div>
                        Sistem Memutar...
                      </span>
                    ) : 'PUTAR SEKARANG'}
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpinwheelGame;