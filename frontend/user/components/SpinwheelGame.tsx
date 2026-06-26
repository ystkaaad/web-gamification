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
      const response: any = await apiService.spinGame(user.id, game.id);
      const resData = response?.data?.data;
      
      if (!response?.data?.success) {
        addNotification(
          response?.data?.message ?? 'Game sedang dalam pengembangan',
          'info'
        );
        setIsPlaying(false);
        return;
      }
      
      if (!resData) {
        addNotification('Tidak ada data hadiah dari server', 'error');
        setIsPlaying(false);
        return;
      }

      let segments = [];
      try {
        segments = Array.isArray(game.config_data) 
          ? game.config_data 
          : (typeof game.config_data === 'string' ? JSON.parse(game.config_data) : []);
      } catch (e) {
        segments = [];
      }
      const segmentsCount = segments.length || 6;
      
      const selectedIdx = resData?.selectedIndex ?? resData?.prizeId ?? 0;
      console.log('=== SPIN RUNTIME DEBUG ===');
      console.log('SELECTED INDEX', selectedIdx);
      console.log('SEGMENTS LENGTH', segments.length);
      console.log('SEGMENTS', segments);
      console.log('SEGMENT SELECTED', segments[selectedIdx]);
      const segmentAngle = 360 / segmentsCount;
      const targetStopAngle = ((selectedIdx + 0.5) * segmentAngle) - 90; 
      const extraSpins = 8 * 360; 
      
      const currentMod = rotation % 360;
      let angleDiff = targetStopAngle - currentMod;
      if (angleDiff <= 0) angleDiff += 360; 
      
      const nextRotation = rotation + extraSpins + angleDiff;
      console.log('SPIN VISUAL DEBUG', {
        selectedIdx,
        segmentAngle,
        targetStopAngle,
        rotation,
        nextRotation,
        segments
      });
      setRotation(nextRotation);
      
      await new Promise(r => setTimeout(r, 4500));
      
      if (typeof refreshData === 'function') {
        await refreshData();
      } else if (typeof onUpdateUser === 'function') {
        onUpdateUser();
      }

      const prizeLabel = resData?.prizeLabel ?? 'Tidak ada hadiah';
      const rewardType = resData?.rewardType ?? resData?.prizeType ?? 'POINT';
      const isVoucher = rewardType === 'VOUCHER';
      const prizeValue = Number(resData?.prizeValue ?? resData?.rewardValue ?? (isVoucher ? resData?.voucherValue ?? 0 : 0));
      const finalPoints = Number(resData?.finalPoints ?? resData?.newPoints ?? 0);
      const isZonk = Number(prizeValue) <= 0 && rewardType !== 'VOUCHER';

      if (!isZonk) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      let resultMessage = 'Yah, coba lagi lain kali ya!';
      if (isVoucher) {
        resultMessage = `Keren! Voucher "${prizeLabel}" otomatis masuk ke Koleksi Anda.`;
      } else if (prizeValue > 0) {
        resultMessage = `Selamat! Saldo Anda bertambah sebesar ${prizeValue} Poin.`;
      } else if (isZonk) {
        resultMessage = 'Yah, zonk! Coba lagi nanti.';
      }

      setGameResult({
        prizeLabel,
        prizeValue,
        rewardType,
        isZonk,
        message: resultMessage,
        finalPoints
      });

    } catch (err: any) {
      console.error(err);
      addNotification(err.message || 'Terjadi kesalahan saat memutar roda.', 'error');
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 z-[500] flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-[420px] md:max-w-md my-4 rounded-[3rem] p-6 md:p-8 border border-orange-100 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-orange-50 blur-[60px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-orange-50 blur-[60px] rounded-full"></div>
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 md:top-8 md:right-8 text-slate-400 hover:text-slate-900 transition-colors z-20"
          disabled={isPlaying}
        >
          <X size={20} className="md:w-6 md:h-6" />
        </button>

        <div className="text-center space-y-6 md:space-y-8 relative z-10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-900">{game.name}</h2>
            <div className="flex items-center justify-center gap-2 text-orange-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={10} className="md:w-3 md:h-3" />
              <span>Lucky Play Mode</span>
              <Sparkles size={10} className="md:w-3 md:h-3" />
            </div>
          </div>

          <div className="flex justify-center py-2 md:py-4">
            <Spinwheel 
              configData={game.config_data} 
              rotation={rotation} 
              isPlaying={isPlaying} 
            />
          </div>

          <div className="space-y-4 md:space-y-6">
            <AnimatePresence mode="wait">
              {gameResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-orange-50 border border-orange-100 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4"
                >
                  <div className="flex justify-center -mt-2">
                    {gameResult.rewardType === 'VOUCHER' ? (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center"><Ticket size={20} className="md:w-6 md:h-6" /></div>
                    ) : gameResult.isZonk ? (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center"><Frown size={20} className="md:w-6 md:h-6" /></div>
                    ) : (
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-200 text-orange-600 rounded-full flex items-center justify-center"><Trophy size={20} className="md:w-6 md:h-6" /></div>
                    )}
                  </div>

                  <p className="text-orange-600 text-[9px] md:text-xs font-black uppercase tracking-wider">Poin Didapat: +{gameResult.prizeValue.toLocaleString()}</p>
                  <p className="text-slate-500 text-[9px] md:text-xs font-medium px-2">Total Poin: {gameResult.finalPoints?.toLocaleString() ?? 0}</p>
                  
                  <p className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Game Selesai</p>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 italic">{gameResult.prizeLabel}</h3>
                  <p className="text-slate-500 text-[9px] md:text-xs font-medium px-2">{gameResult.message}</p>
                  
                  <button 
                    onClick={onClose}
                    className="w-full py-3 md:py-4 bg-orange-400 text-white rounded-xl font-black uppercase text-[9px] md:text-xs tracking-widest hover:bg-orange-500 transition-all shadow-md shadow-orange-100"
                  >
                    Tutup Game
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-3 md:p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Coins size={16} className="md:w-5 md:h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Saldo Poin</p>
                        <p className="text-base md:text-lg font-black text-slate-900 tabular-nums">{user?.points?.toLocaleString() ?? 0}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Biaya Main</p>
                       <p className="text-base md:text-lg font-black text-orange-600 tabular-nums">-{Math.round(Number(game.cost_points) || 0)}</p>
                    </div>
                  </div>

                  <button 
                    disabled={isPlaying || (user && Math.round(Number(user.points) || 0) < Math.round(Number(game.cost_points) || 0))}
                    onClick={handlePlay}
                    className="w-full py-4 md:py-5 bg-orange-400 text-white rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-orange-100 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isPlaying ? (
                      <span className="flex items-center justify-center gap-2 md:gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RotateCw size={16} className="md:w-4.5 md:h-5" /></motion.div>
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