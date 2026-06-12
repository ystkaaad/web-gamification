/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Trophy, X, Coins, Sparkles, Frown, Ticket } from 'lucide-react';
import { GameSetting, User } from '../types';
import { dbService } from '../services/dbService';
import { toast } from 'react-hot-toast';

interface Segment {
  label: string;
  value: any;
  type?: 'POINT' | 'VOUCHER';
  color: string;
  probability?: number;
}

interface SpinwheelUserProps {
  game: GameSetting;
  user: User;
  onClose: () => void;
  onUpdateUser: () => void;
}

export default function SpinwheelUser({ game, user, onClose, onUpdateUser }: SpinwheelUserProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Segment | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    try {
      const data = JSON.parse(game.config_data || '[]');
      if (Array.isArray(data) && data.length > 0) {
        // Menerima kotak hadiah dinamis dari Admin
        setSegments(data);
      } else {
        // Fallback default minimal 2 kotak
        setSegments([
          { label: 'Zonk', value: 0, type: 'POINT', color: '#EF4444', probability: 50 },
          { label: '50 XP', value: 50, type: 'POINT', color: '#4F46E5', probability: 50 }
        ]);
      }
    } catch (e) {
      console.error("Invalid spinwheel config", e);
    }
  }, [game.config_data]);

  useEffect(() => {
    if (segments.length > 0 && canvasRef.current) {
      drawWheel();
    }
  }, [segments]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;
    const angleStep = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, size, size);

    segments.forEach((segment, i) => {
      const angle = i * angleStep;
      
      // Draw Slice
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + angleStep);
      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = segment.color || '#FF8A50';
      ctx.fill();
      
      // Light divider between slices for clear "teriris" look in pastel theme
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw Label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + angleStep / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      // Menyesuaikan ukuran font jika jumlah potongan roda terlalu banyak
      const fontSize = segments.length > 8 ? 10 : 14; 
      ctx.font = `900 ${fontSize}px Inter`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fillText(segment.label.toUpperCase(), radius - 30, 5);
      ctx.restore();
    });

    // Draw Outer Border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFEDD5';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Draw Center Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF8A50';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center icon/text placeholder
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('SPIN', centerX, centerY + 4);
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Optimistic Check
    if (user.points < game.cost_points) {
      toast.error('Poin kamu tidak cukup untuk memutar roda!');
      return;
    }

    setIsSpinning(true);
    
    try {
      // Cek Cooldown (Opsional)
      const cooldown = await dbService.canPlayGame(user.id, game.id);
      if (!cooldown.allowed) {
        toast.error(cooldown.message || 'Mesin sedang memproses putaran sebelumnya.');
        setIsSpinning(false);
        return;
      }

      // [PERBAIKAN]: MEMANGGIL API BACKEND UNTUK MENGUNDI (LOGIKA BANDAR)
      // Backend akan otomatis memotong poin, menambah poin/voucher, dan mencatat log.
      const response = await dbService.playSpinwheel(user.id, game.id) as any;
      
      if (!response || !response.success) {
        toast.error(response?.message || 'Gagal terhubung ke mesin Spinwheel.');
        setIsSpinning(false);
        return;
      }

      // Ambil hasil undian dari server
      const { selectedIndex, prizeLabel, rewardType } = response.data;
      const winnerSegment = segments[selectedIndex];

      // Kalkulasi rotasi akurat agar berhentinya tepat di tengah kotak server
      const segmentAngle = 360 / segments.length;
      // Posisi jarum (pointer) adalah di atas (270 derajat / -90 derajat)
      const targetStopAngle = 270 - ((selectedIndex + 0.5) * segmentAngle); 
      const extraSpins = 5 * 360;
      
      // Normalisasi putaran saat ini
      const currentMod = rotation % 360;
      let angleDiff = targetStopAngle - currentMod;
      if (angleDiff <= 0) angleDiff += 360; // Pastikan selalu memutar ke depan
      
      const newRotation = rotation + extraSpins + angleDiff;
      
      setRotation(newRotation);

      // Tunggu animasi roda berputar hingga selesai
      setTimeout(() => {
        // Set hasil menang sesuai dari server
        setWinner({ ...winnerSegment, label: prizeLabel, type: rewardType });
        setShowResult(true);
        setIsSpinning(false);
        
        // PENTING: Refresh data user untuk meng-update saldo poin & tas voucher
        onUpdateUser();
      }, 3500); // Sinkronkan timeout dengan durasi CSS transition (3.5 detik)

    } catch (err) {
      toast.error('Gagal memproses putaran.');
      setIsSpinning(false);
    }
  };

  // Logika membedakan jenis notifikasi popup
  const isVoucher = winner?.type === 'VOUCHER';
  const numericValue = Number(winner?.label.replace(/[^0-9]/g, '')) || 0;
  const isZonk = winner?.type === 'POINT' && numericValue === 0 && !isVoucher;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-orange-950/40 backdrop-blur-md">
      <AnimatePresence>
        {!showResult ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative flex flex-col items-center gap-10"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white drop-shadow-md">{game.name}</h2>
              <div className="flex items-center justify-center gap-2 text-orange-600 font-black bg-white px-6 py-2.5 rounded-2xl border-4 border-orange-200 shadow-xl">
                <Coins className="w-5 h-5 text-orange-500" />
                <span>Biaya Main: {game.cost_points} PTS</span>
              </div>
            </div>

            <div className="relative group">
              {/* Pointer Penunjuk Hadiah */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-10 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-orange-200 drop-shadow-xl">
                   <div className="w-4 h-4 bg-rose-500 rounded-full animate-pulse shadow-inner"></div>
                </div>
              </div>

              <motion.div
                animate={{ rotate: rotation }}
                transition={isSpinning ? { duration: 3.5, ease: [0.15, 0, 0.1, 1] } : { duration: 0 }}
                style={{ transformOrigin: 'center' }}
              >
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={400} 
                  className="rounded-full shadow-[0_20px_60px_-10px_rgba(255,138,80,0.4)] border-8 border-white bg-white"
                />
              </motion.div>
            </div>

            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="px-16 py-6 bg-orange-500 hover:bg-orange-600 text-white rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] shadow-xl shadow-orange-500/30 transition-all active:scale-90 disabled:opacity-50 border-4 border-orange-400"
            >
              {isSpinning ? 'MEMUTAR...' : 'PUTAR RODA SEKARANG'}
            </button>

            <button onClick={onClose} className="absolute -top-4 -right-4 p-3 rounded-full bg-white shadow-xl text-slate-400 hover:text-rose-500 transition-all active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-8 max-w-md p-12 bg-white border border-orange-100 rounded-[3.5rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-orange-400/5 to-transparent pointer-events-none"></div>
            
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 10 }}
              className={`w-32 h-32 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-xl ${!isZonk ? 'bg-orange-500 shadow-orange-200' : 'bg-slate-200 shadow-slate-100'}`}
            >
              {isVoucher ? (
                <Ticket className="w-16 h-16 text-white" />
              ) : !isZonk ? (
                <Trophy className="w-16 h-16 text-white" />
              ) : (
                <Frown className="w-16 h-16 text-slate-400" />
              )}
            </motion.div>

            <div className="space-y-4 relative z-10">
              <h3 className="text-4xl font-black uppercase tracking-tight text-slate-800">
                {isZonk ? 'YAH, ZONK!' : winner?.label}
              </h3>
              
              <p className="text-slate-500 font-medium leading-relaxed">
                {isVoucher ? (
                  <>Selamat! Voucher fisik <span className="text-orange-600 font-bold">{winner?.label}</span> telah otomatis dimasukkan ke dalam Katalog Voucher-mu!</>
                ) : !isZonk ? (
                  <>Keberuntungan berpihak padamu! Hadiah <span className="text-orange-600 font-bold">{winner?.label}</span> telah ditambahkan ke saldo akunmu.</>
                ) : (
                  <>Belum beruntung kali ini. Jangan menyerah, coba putar lagi nanti untuk mendapatkan hadiah menarik!</>
                )}
              </p>
            </div>

            <div className="pt-6 relative z-10">
               <button 
                onClick={() => { setShowResult(false); setWinner(null); }}
                className="w-full py-5 bg-orange-500 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all active:scale-95 mb-4 shadow-lg shadow-orange-200"
              >
                Coba Putar Lagi
              </button>
              <button 
                onClick={onClose}
                className="w-full py-5 border border-orange-200 rounded-3xl font-black uppercase tracking-widest text-[10px] text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
              >
                Kembali Ke Menu
              </button>
            </div>

            {/* Sparkles hanya muncul jika menang */}
            {!isZonk && (
              <>
                <Sparkles className="absolute top-8 left-8 w-8 h-8 text-orange-400 opacity-30" />
                <Sparkles className="absolute bottom-8 right-8 w-12 h-12 text-orange-600 opacity-30" />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}