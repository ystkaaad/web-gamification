/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Calendar, Zap, TrendingUp, Hash } from 'lucide-react';

interface DailyStreakConfig {
  baseReward: number;
  streakBonus: number;
  maxDays: number;
}

interface DailyStreakManagerProps {
  config: DailyStreakConfig;
  onUpdateConfig: (field: keyof DailyStreakConfig, value: number) => void;
}

export default function DailyStreakManager({ config, onUpdateConfig }: DailyStreakManagerProps) {
  return (
    <div className="pt-10 border-t border-orange-100 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-orange-500" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400">Pengaturan Daily Streak</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Base Reward (Daily)</label>
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input 
              type="number"
              className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-orange-600 outline-none focus:border-orange-400 transition-all shadow-sm"
              value={config.baseReward}
              onChange={(e) => onUpdateConfig('baseReward', parseInt(e.target.value) || 0)}
              placeholder="Poin harian..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Streak Bonus (Day 7)</label>
          <div className="relative">
            <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input 
              type="number"
              className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-emerald-600 outline-none focus:border-orange-400 transition-all shadow-sm"
              value={config.streakBonus}
              onChange={(e) => onUpdateConfig('streakBonus', parseInt(e.target.value) || 0)}
              placeholder="Bonus hari ke-7..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Max Days</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <input 
              type="number"
              className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-black text-blue-600 outline-none focus:border-orange-400 transition-all shadow-sm"
              value={config.maxDays}
              onChange={(e) => onUpdateConfig('maxDays', parseInt(e.target.value) || 0)}
              placeholder="Maksimal hari..."
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-orange-100 shrink-0">
             <Calendar className="w-5 h-5 text-orange-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Informasi Mekanik</p>
            <p className="text-[11px] text-[var(--text-muted-premium)] leading-relaxed font-medium">
              Daily streak memberikan <span className="font-bold text-orange-500">{config.baseReward} PTS</span> secara default. Jika user mencapai hari ke-7 berturut-turut, mereka mendapatkan tambahan bonus <span className="font-bold text-emerald-500">{config.streakBonus} PTS</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}