/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles, Coins, Zap } from 'lucide-react';
import { dbService } from '../services/dbService';
import { GameSetting, User } from '../types';
import { toast } from 'react-hot-toast';

interface Reward {
  label: string;
  value: number;
  probability: number;
}

interface ScratchCardProps {
  game: GameSetting;
  user: User;
  onClose: () => void;
  onUpdateUser: () => void;
}

export default function ScratchCard({ game, user, onClose, onUpdateUser }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<Reward | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    try {
      const data = JSON.parse(game.config_data || '[]');
      setRewards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to parse rewards", e);
    }
  }, [game.config_data]);

  // Weighted Random Logic
  const selectWinner = () => {
    if (rewards.length === 0) return null;
    
    const totalWeight = rewards.reduce((sum, r) => sum + (r.probability || 0), 0);
    let random = Math.random() * totalWeight;
    
    for (const reward of rewards) {
      if (random < (reward.probability || 0)) {
        return reward;
      }
      random -= (reward.probability || 0);
    }
    return rewards[0];
  };

  useEffect(() => {
    if (winner || !rewards.length) return;
    setWinner(selectWinner());
  }, [rewards, winner]);

  // Canvas Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set up canvas
    const width = canvas.width;
    const height = canvas.height;

    // Fill with gray scratchable surface
    ctx.fillStyle = '#D1D5DB';
    ctx.fillRect(0, 0, width, height);

    // Add some texture/pattern
    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 10) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Logo text
    ctx.fillStyle = '#4B5563';
    ctx.font = '900 24px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', width / 2, height / 2);

    // Scratch logic
    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      checkProgress();
    };

    const checkProgress = () => {
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let clearPixels = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) clearPixels++;
      }
      const progress = (clearPixels / (pixels.length / 4)) * 100;
      setScratchProgress(progress);
      
      if (progress > 50 && !isRevealed) {
        setIsRevealed(true);
      }
    };

    const handleMouseDown = async (e: MouseEvent | TouchEvent) => {
      if (isRevealed || isScratching) return;
      
      // Check points
      if (user.points < game.cost_points) {
        toast.error('Poin tidak cukup!');
        return;
      }

      setIsScratching(true);
      const pos = getMousePos(e);
      scratch(pos.x, pos.y);

      // Deduct cost async
      try {
        await dbService.updatePoints(user.id, -game.cost_points, `Main ${game.name}`);
        onUpdateUser();
      } catch (err) {
        console.error("Deduct error", err);
      }
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isScratching || isRevealed) return;
      const pos = getMousePos(e);
      scratch(pos.x, pos.y);
    };

    const handleMouseUp = () => {
      setIsScratching(false);
    };

    const getMousePos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchmove', handleMouseMove);
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [isRevealed]);

  const handleRevealComplete = async () => {
    if (isCompleted || !winner) return;
    setIsCompleted(true);
    
    try {
      if (winner.value > 0) {
        await dbService.updatePoints(user.id, winner.value, `Hadiah ${game.name}`);
        toast.success(`Selamat! Kamu menang ${winner.value} poin!`);
        onUpdateUser();
      } else {
        toast.error('Yah, belum beruntung kali ini.');
      }
    } catch (error) {
      console.error("Failed to update points", error);
      toast.error('Gagal mencatat hadiah');
    }
  };

  useEffect(() => {
    if (isRevealed && !isCompleted) {
      handleRevealComplete();
    }
  }, [isRevealed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-md">
      <AnimatePresence>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-sm w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-orange-100 flex flex-col items-center p-8 text-center"
        >
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-orange-50 rounded-full text-orange-200 transition-all">
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 rounded-full border border-amber-100 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Scratch & Win</span>
            </div>
            <h2 className="text-3xl font-black text-[var(--text-premium)] uppercase tracking-tighter">{game.name}</h2>
            <div className="flex items-center justify-center gap-1 text-orange-400 font-bold text-xs mt-1">
              <Zap className="w-3 h-3" />
              <span>Biaya: {game.cost_points} PTS</span>
            </div>
          </div>

          <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-xl border-4 border-orange-50 bg-orange-50/10">
            {/* The Reward Result (Hidden underneath) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white p-6">
               {winner && (
                 <motion.div
                   initial={{ scale: 0.5, opacity: 0 }}
                   animate={isRevealed ? { scale: 1, opacity: 1 } : {}}
                   className="flex flex-col items-center"
                 >
                   <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center mb-4 shadow-inner">
                     <Trophy className="w-10 h-10 text-orange-500" />
                   </div>
                   <h3 className="text-xl font-black text-orange-600 uppercase mb-1">{winner.label}</h3>
                   <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100">
                     <Coins className="w-4 h-4 text-orange-400" />
                     <span className="text-sm font-black text-orange-500">{winner.value} Poin</span>
                   </div>
                 </motion.div>
               )}
            </div>

            {/* The Scratchable Canvas */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                width={256}
                height={256}
                className="absolute inset-0 z-10 cursor-crosshair touch-none"
              />
            )}
          </div>

          <div className="mt-8 w-full space-y-4">
             {isRevealed ? (
               <motion.button
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 onClick={onClose}
                 className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg active:scale-95"
               >
                 Ambil Hadiah
               </motion.button>
             ) : (
               <div className="space-y-4">
                  <p className="text-[10px] text-[var(--text-muted-premium)] font-black uppercase tracking-widest animate-pulse">
                    GOSOK AREA DI ATAS UNTUK MELIHAT KEBERUNTUNGANMU!
                  </p>
                  <div className="w-full h-2 bg-orange-50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${scratchProgress}%` }}
                    />
                  </div>
               </div>
             )}
          </div>

          {!isRevealed && (
             <Sparkles className="absolute bottom-10 left-10 w-6 h-6 text-orange-200 opacity-30" />
          )}
          <Sparkles className="absolute top-20 right-10 w-8 h-8 text-orange-100 opacity-20" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
