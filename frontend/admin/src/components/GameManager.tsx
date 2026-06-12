/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Settings2, 
  Play, 
  Pause, 
  Shield, 
  Zap,
  Plus,
  Type,
  X,
  Gift,
  TrendingUp,
  Calendar,
  Trash2,
  Info,
  Coins,
  Ticket
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { GameSetting } from '../types';
import { toast } from 'react-hot-toast';
import ScratchManager from './ScratchManager';
import DailyStreakManager from './DailyStreakManager';

interface Segment {
  label: string;
  value: any; 
  type?: 'POINT' | 'VOUCHER';
  color: string;
  probability: number;
}

interface DailyStreakConfig {
  baseReward: number;
  streakBonus: number;
  maxDays: number;
}

export default function GameManager() {
  const [games, setGames] = useState<GameSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGame, setEditingGame] = useState<Partial<GameSetting> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [dailyStreakConfig, setDailyStreakConfig] = useState<DailyStreakConfig>({
    baseReward: 100,
    streakBonus: 1000,
    maxDays: 7
  });
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (editingGame) {
      try {
        const data = JSON.parse(editingGame.config_data || '[]');
        
        if (editingGame.type === 'SPINWHEEL') {
          let initialSegments = Array.isArray(data) ? data : [];
          if (initialSegments.length < 2) {
            initialSegments = [
              { label: 'Zonk', value: 0, type: 'POINT', color: '#EF4444', probability: 50 },
              { label: '55 Poin', value: 55, type: 'POINT', color: '#4F46E5', probability: 50 }
            ];
          }
          setSegments(initialSegments);
        } else if (editingGame.type === 'SCRATCHCARD') {
          let initialRewards = Array.isArray(data) ? data : [];
          if (initialRewards.length < 5) {
            const padding = Array.from({ length: 5 - initialRewards.length }, (_, i) => ({
              label: `Reward ${initialRewards.length + i + 1}`,
              value: 0,
              probability: 20
            }));
            initialRewards = [...initialRewards, ...padding];
          }
          setRewards(initialRewards.slice(0, 5));
        } else if (editingGame.type === 'DAILY_STREAK') {
          const config = JSON.parse(editingGame.config_data || '{}');
          setDailyStreakConfig({
            baseReward: config.baseReward || 100,
            streakBonus: config.streakBonus || 1000,
            maxDays: config.maxDays || 7
          });
        }
      } catch (e) {
        if (editingGame.type === 'SPINWHEEL') {
          const defaultColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          setSegments(defaultColors.map((color, i) => ({
            label: `Hadiah ${i + 1}`,
            value: 0,
            type: 'POINT',
            color,
            probability: 20
          })));
        } else if (editingGame.type === 'SCRATCHCARD') {
          setRewards(Array.from({ length: 5 }, (_, i) => ({
            label: `Reward ${i + 1}`,
            value: 0,
            probability: 20
          })));
        }
      }
    }
  }, [editingGame?.id, editingGame?.type]);

  useEffect(() => {
    if (canvasRef.current && editingGame?.type === 'SPINWHEEL') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 5;
      const angleStep = (2 * Math.PI) / (segments.length || 1);

      ctx.clearRect(0, 0, size, size);

      segments.forEach((segment, i) => {
        const angle = i * angleStep;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + angleStep);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = segment.color || '#4F46E5';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
  }, [segments, editingGame?.type]);

  const loadGames = async () => {
    try {
      const data = await dbService.getGames();
      setGames(data);
    } catch (error) {
      toast.error('Gagal memuat pengaturan game');
    } finally {
      setLoading(false);
    }
  };

  const updateSegment = (index: number, field: keyof Segment, value: any) => {
    const newSegments = [...segments];
    newSegments[index] = { ...newSegments[index], [field]: value };
    setSegments(newSegments);
  };

  const addSegment = () => {
    const defaultColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
    const newColor = defaultColors[segments.length % defaultColors.length];
    setSegments([...segments, { label: 'Hadiah Baru', value: 0, type: 'POINT', color: newColor, probability: 0 }]);
  };

  const removeSegment = (index: number) => {
    if (segments.length <= 2) {
      toast.error("Minimal harus ada 2 kotak hadiah di Roda.");
      return;
    }
    setSegments(segments.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: string, value: any) => {
    const newRewards = [...rewards];
    newRewards[index] = { ...newRewards[index], [field]: value };
    setRewards(newRewards);
  };

  const handleUpdateGame = async (updatedGame: Partial<GameSetting>) => {
    if (updatedGame.type === 'SPINWHEEL') {
      const totalProb = segments.reduce((acc, seg) => acc + (Number(seg.probability) || 0), 0);
      if (totalProb !== 100) {
        toast.error(`Total probabilitas hadiah saat ini ${totalProb}%. Harus pas 100%!`);
        return;
      }
    }

    setSaving(true);
    try {
      const type = updatedGame.type?.toUpperCase() || '';
      const staticId = type === 'SPINWHEEL' ? 'spinwheel' : 
                       type === 'SCRATCHCARD' ? 'scratchcard' : 
                       type === 'DAILY_STREAK' ? 'daily_streak' : updatedGame.id;

      let finalGame = { 
        ...updatedGame, 
        id: staticId,
        is_active: updatedGame.is_active ?? true
      };
      
      if (finalGame.type === 'SPINWHEEL') {
        const syncedSegments = segments.map(seg => ({
          ...seg,
          label: seg.label || String(seg.value)
        }));
        finalGame.config_data = JSON.stringify(syncedSegments);
        finalGame.reward_points = 0; 
      } else if (finalGame.type === 'SCRATCHCARD') {
        finalGame.config_data = JSON.stringify(rewards);
      } else if (finalGame.type === 'DAILY_STREAK') {
        finalGame.config_data = JSON.stringify(dailyStreakConfig);
      }

      try {
        await dbService.updateGame(finalGame.id!, finalGame);
        toast.success(`Game ${finalGame.name} berhasil diperbarui`);
      } catch (e) {
        await dbService.addGame(finalGame as Omit<GameSetting, 'id'>);
        toast.success(`Game ${finalGame.name} berhasil diinisialisasi`);
      }

      setEditingGame(null);
      await loadGames();
    } catch (error) {
      toast.error('Gagal menyimpan perubahan');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleGameStatus = async (game: GameSetting) => {
    try {
      const type = game.type?.toUpperCase() || '';
      const staticId = type === 'SPINWHEEL' ? 'spinwheel' : 
                       type === 'SCRATCHCARD' ? 'scratchcard' : 
                       type === 'DAILY_STREAK' ? 'daily_streak' : game.id;
      
      const updatedStatus = !game.is_active;
      
      await dbService.updateGame(staticId, { ...game, id: staticId, is_active: updatedStatus });
      
      toast.success(`Game ${game.name} ${updatedStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
      loadGames();
    } catch (error) {
      toast.error('Gagal memperbarui status game');
    }
  };

  const totalProbability = segments.reduce((acc, seg) => acc + (Number(seg.probability) || 0), 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter mb-2 text-[var(--text-premium)]">Engine Gamifikasi</h2>
          <p className="text-sm text-[var(--text-muted-premium)] font-medium tracking-wide">Kelola parameter ekonomi, biaya partisipasi, dan algoritma reward sistem.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-orange-100/50 border border-orange-200 rounded-2xl flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Sistem Terenkripsi</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-80 bg-orange-50/10 border border-orange-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {['SPINWHEEL', 'SCRATCHCARD', 'DAILY_STREAK'].map((type) => {
              const allMatchingGames = games.filter(g => g.type.toUpperCase() === type.toUpperCase());
              const game = allMatchingGames.find(g => !g.id.toString().startsWith('game-')) || allMatchingGames[0];
              
              const displayGame = game || {
                name: type === 'SPINWHEEL' ? 'Spin Wheel' : type === 'SCRATCHCARD' ? 'Scratch Card' : 'Daily Streak',
                type: type as any,
                cost_points: 0,
                reward_points: 0,
                is_active: false,
                config_data: '[]'
              };

              return (
                <div key={type} className={`premium-card p-8 flex flex-col justify-between transition-all hover:translate-y-[-4px] active:scale-[0.98] border-t-8 ${displayGame.is_active ? 'border-t-orange-400' : 'border-t-rose-300'}`}>
                  <div className="mb-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        type === 'SPINWHEEL' ? 'bg-orange-100 text-orange-500' : 
                        type === 'DAILY_STREAK' ? 'bg-indigo-100 text-indigo-500' :
                        'bg-amber-100 text-amber-500'
                      }`}>
                        {type === 'DAILY_STREAK' ? <Calendar className="w-7 h-7" /> : <Gamepad2 className="w-7 h-7" />}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border ${displayGame.is_active ? 'bg-orange-50 text-orange-500 border-orange-200' : 'bg-rose-50 text-rose-400 border-rose-100'}`}>
                        {displayGame.is_active ? 'Aktif' : 'Off'}
                      </div>
                    </div>

                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-[var(--text-premium)]">{displayGame.name}</h3>
                    <p className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] mb-6">{type.replace('_', ' ')} ENGINE</p>

                    <div className={`grid ${type === 'SPINWHEEL' ? 'grid-cols-1' : 'grid-cols-2'} gap-3 mb-6`}>
                      <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                        <p className="text-[7px] font-black text-[var(--text-muted-premium)] uppercase tracking-widest mb-1.5">Cost</p>
                        <div className="flex items-center gap-1.5 text-amber-600 font-black text-sm">
                           <Zap className="w-3.5 h-3.5" />
                           {displayGame.cost_points.toLocaleString()} <span className="text-[8px] opacity-40">PTS</span>
                        </div>
                      </div>
                      {type !== 'SPINWHEEL' && (
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                        <p className="text-[7px] font-black text-[var(--text-muted-premium)] uppercase tracking-widest mb-1.5">Max Reward</p>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                           <TrendingUp className="w-3.5 h-3.5" />
                           {displayGame.reward_points.toLocaleString()} <span className="text-[8px] opacity-40">PTS</span>
                        </div>
                      </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => setEditingGame(displayGame)}
                      className="w-full flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white py-4 rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.15em] border border-orange-100 active:scale-95"
                    >
                      <Settings2 className="w-4 h-4" />
                      Konfigurasi Engine
                    </button>
                    <div className="flex gap-3">
                      {game ? (
                        <button 
                          onClick={() => toggleGameStatus(game)}
                          className={`flex-1 py-3.5 rounded-xl text-[8px] font-black uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-2 border ${game.is_active ? 'bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white border-rose-100' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white border-emerald-100'}`}
                        >
                          {game.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {game.is_active ? 'Matikan' : 'Aktifkan'}
                        </button>
                      ) : (
                        <div className="flex-1 py-3.5 rounded-xl text-[8px] font-black uppercase tracking-[0.1em] border border-orange-100 bg-orange-50/30 text-orange-300 flex items-center justify-center">
                          Belum Setup
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-md overflow-y-auto">
          <div className={`bg-white border border-orange-100 w-full ${editingGame.type === 'SPINWHEEL' ? 'max-w-[70rem]' : 'max-w-2xl'} rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]`}>
            <div className="p-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/30 rounded-t-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200">
                  <Settings2 className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-premium)]">Konfigurasi Engine</h3>
                  <p className="text-[9px] text-[var(--text-muted-premium)] mt-0.5 uppercase tracking-[0.2em] font-bold">Parameter Basis {editingGame.name || 'Game Baru'}</p>
                </div>
              </div>
              <button onClick={() => setEditingGame(null)} className="p-2 hover:bg-orange-100 rounded-xl transition-all">
                <X className="w-5 h-5 text-orange-300" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Nama Permainan</label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                      <input 
                        type="text"
                        className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                        value={editingGame.name}
                        onChange={(e) => setEditingGame({...editingGame, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className={`grid ${editingGame.type === 'SPINWHEEL' ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Biaya Main (PTS)</label>
                      <div className="relative">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                        <input 
                          type="number"
                          className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-black text-amber-600 outline-none focus:border-orange-400 focus:bg-white transition-all"
                          value={editingGame.cost_points}
                          onChange={(e) => setEditingGame({...editingGame, cost_points: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    
                    {editingGame.type !== 'SPINWHEEL' && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Max Reward (PTS)</label>
                        <div className="relative">
                          <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                          <input 
                            type="number"
                            className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-emerald-600 outline-none focus:border-orange-400 focus:bg-white transition-all"
                            value={editingGame.reward_points}
                            onChange={(e) => setEditingGame({...editingGame, reward_points: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-orange-50 border border-orange-100 rounded-[2rem] flex flex-col justify-center items-center text-center space-y-4">
                  {editingGame.type === 'SPINWHEEL' ? (
                    <>
                      <div className="relative">
                        <canvas ref={canvasRef} width={140} height={140} className="rounded-full shadow-2xl border-4 border-white" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 w-5 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-orange-100">
                          <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-400">Live Engine Preview</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                        <Gamepad2 className="w-7 h-7 text-orange-500" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-premium)]">Algoritma Ready</h4>
                      <p className="text-[9px] text-[var(--text-muted-premium)] leading-relaxed max-w-[180px]">Mekanik ini menggunakan distribusi standar.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Game Specific Content */}
              {editingGame.type === 'SPINWHEEL' && (
                <div className="pt-8 border-t border-orange-100 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Gift className="w-4 h-4 text-orange-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Kustomisasi Dinamis & Probabilitas</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        totalProbability === 100 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' 
                          : 'bg-rose-50 text-rose-500 border-rose-200 animate-pulse'
                      }`}>
                        Total: {totalProbability}%
                      </div>
                      <button 
                        onClick={addSegment} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition-all rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 border border-orange-200"
                      >
                        <Plus className="w-3 h-3" /> Tambah Slot
                      </button>
                    </div>
                  </div>
                  
                  {/* Tabel Generator Hadiah */}
                  <div className="grid grid-cols-1 gap-3">
                    {segments.map((segment, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center p-4 bg-orange-50/20 border border-orange-100 rounded-2xl hover:bg-white hover:shadow-xl transition-all">
                        
                        <div className="col-span-1 text-[9px] font-black text-orange-300 uppercase truncate">S-{index + 1}</div>
                        
                        <div className="col-span-1 flex justify-center">
                          <input 
                            type="color" 
                            className="w-8 h-8 p-0.5 bg-white border border-orange-100 rounded-lg cursor-pointer" 
                            value={segment.color} 
                            onChange={(e) => updateSegment(index, 'color', e.target.value)} 
                          />
                        </div>
                        
                        {/* INPUT 1: LABEL TEKS DI RODA */}
                        <div className="col-span-3">
                          <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-200" />
                            <input 
                              type="text" 
                              placeholder="Label Roda (Misal: Zonk)" 
                              className="w-full bg-white border border-orange-100 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold text-[var(--text-premium)] outline-none focus:border-orange-300 transition-colors" 
                              value={segment.label || ''} 
                              onChange={(e) => updateSegment(index, 'label', e.target.value)} 
                            />
                          </div>
                        </div>
                        
                        {/* DROPDOWN 2: TIPE HADIAH */}
                        <div className="col-span-2">
                          <select 
                            className="w-full bg-white border border-orange-100 rounded-xl px-2 py-2.5 text-xs font-bold text-orange-600 outline-none focus:border-orange-300 cursor-pointer"
                            value={segment.type || 'POINT'}
                            onChange={(e) => {
                              const newSegments = [...segments];
                              const newType = e.target.value as 'POINT' | 'VOUCHER';
                              newSegments[index] = { 
                                ...newSegments[index], 
                                type: newType, 
                                value: newType === 'POINT' ? 0 : '' 
                              };
                              setSegments(newSegments);
                            }}
                          >
                            <option value="POINT">Poin</option>
                            <option value="VOUCHER">Voucher</option>
                          </select>
                        </div>

                        {/* INPUT 3: FORM ISI HADIAH DINAMIS (BERUBAH SETIAP TIPE DIGANTI) */}
                        <div className="col-span-3">
                          <div className="relative">
                            {segment.type === 'VOUCHER' ? (
                              <>
                                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
                                <input 
                                  type="text" 
                                  placeholder="Ketik Nama Voucher..." 
                                  className="w-full bg-white border border-orange-100 rounded-xl pl-8 pr-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-orange-300 transition-colors" 
                                  value={segment.value || ''} 
                                  onChange={(e) => updateSegment(index, 'value', e.target.value)} 
                                />
                              </>
                            ) : (
                              <>
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400" />
                                <input 
                                  type="number" 
                                  placeholder="Jumlah Poin" 
                                  className="w-full bg-white border border-orange-100 rounded-xl pl-8 pr-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-orange-300 transition-colors" 
                                  value={segment.value || 0} 
                                  onChange={(e) => updateSegment(index, 'value', parseInt(e.target.value) || 0)} 
                                />
                              </>
                            )}
                          </div>
                        </div>

                        {/* INPUT 4: PROBABILITAS / PELUANG */}
                        <div className="col-span-1">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-orange-300 opacity-50">%</span>
                            <input 
                              type="number" 
                              placeholder="%"
                              className={`w-full bg-white border rounded-xl pl-4 pr-1 py-2.5 text-xs font-black outline-none text-right transition-colors ${
                                totalProbability !== 100 ? 'border-rose-200 text-rose-500 focus:border-rose-400' : 'border-orange-100 text-orange-500 focus:border-orange-300'
                              }`} 
                              value={segment.probability}
                              onChange={(e) => updateSegment(index, 'probability', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button 
                            onClick={() => removeSegment(index)} 
                            className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Hapus Kotak Ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tambahan Info Alert */}
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 mt-4">
                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                      <b>Sistem Auto-Katalog:</b> Anda bebas mengetik nama hadiah apa pun di kolom <b>"Ketik Nama Voucher..."</b>. Jika *user* memenangkannya, sistem Apps Script akan otomatis membuat dan memasukkannya langsung ke dalam tas katalog milik User!
                    </p>
                  </div>
                </div>
              )}

              {editingGame.type === 'SCRATCHCARD' && (
                <ScratchManager rewards={rewards} onUpdateReward={updateReward} />
              )}

              {editingGame.type === 'DAILY_STREAK' && (
                <DailyStreakManager config={dailyStreakConfig} onUpdateConfig={(field, value) => setDailyStreakConfig({...dailyStreakConfig, [field]: value})} />
              )}
            </div>

            <div className="p-6 border-t border-orange-50 bg-orange-50/30 flex gap-4 rounded-b-[2.5rem]">
              <button 
                onClick={() => setEditingGame(null)} 
                className="flex-1 py-4 font-black uppercase text-[9px] tracking-widest text-orange-300 hover:text-orange-500 transition-all rounded-2xl"
              >
                Batalkan
              </button>
              <button 
                disabled={saving}
                onClick={() => handleUpdateGame(editingGame)} 
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase text-[9px] tracking-widest text-white shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Plus className="w-3.5 h-3.5" />}
                {editingGame.id ? 'Perbarui Engine' : 'Instalasi Baru'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}