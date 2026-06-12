/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Gift, Type, Coins } from 'lucide-react';

interface Reward {
  label: string;
  value: number;
  probability: number;
}

interface ScratchManagerProps {
  rewards: Reward[];
  onUpdateReward: (index: number, field: keyof Reward, value: any) => void;
}

export default function ScratchManager({ rewards, onUpdateReward }: ScratchManagerProps) {
  return (
    <div className="pt-10 border-t border-orange-100 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Gift className="w-5 h-5 text-amber-500" />
          <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-400">Kustomisasi Reward Scratch</h4>
        </div>
        <span className="text-[9px] font-black px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 uppercase tracking-widest">Min 5 Hadiah</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rewards.map((reward, index) => (
          <div key={index} className="grid grid-cols-12 gap-6 items-center p-6 bg-amber-50/10 border border-amber-100/30 rounded-3xl hover:bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/20 transition-all group">
            <div className="col-span-1 text-[10px] font-black text-orange-300 uppercase">#{index + 1}</div>
            <div className="col-span-4">
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                <input 
                  type="text"
                  className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 transition-all shadow-sm"
                  placeholder="Label..."
                  value={reward.label}
                  onChange={(e) => onUpdateReward(index, 'label', e.target.value)}
                />
              </div>
            </div>
            <div className="col-span-4">
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input 
                  type="number"
                  className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-amber-600 outline-none focus:border-orange-400 transition-all shadow-sm"
                  placeholder="Nilai Poin"
                  value={reward.value}
                  onChange={(e) => onUpdateReward(index, 'value', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="col-span-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-300">%</span>
                <input 
                  type="number"
                  className="w-full bg-white border border-orange-100 rounded-2xl pl-10 pr-4 py-3 text-xs font-black text-orange-600 outline-none focus:border-orange-400 transition-all shadow-sm"
                  placeholder="Prob."
                  max="100"
                  value={reward.probability}
                  onChange={(e) => onUpdateReward(index, 'probability', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
