/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Calendar
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { PointLedger } from '../types';

export default function Points({ readonly }: { readonly?: boolean }) {
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await dbService.getPointLedger();
        setLedger(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black tracking-tight mb-1 text-[var(--text-premium)]">Audit Mutasi Poin</h2>
        <p className="text-sm text-[var(--text-muted-premium)]">Log transparansi perubahan saldo poin setiap pengguna</p>
      </div>

      <div className="premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Waktu Efektif</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Pengguna</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Tipe Perubahan</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Jumlah (EXP/PTS)</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Sumber Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Memuat mutasi poin...</td></tr>
              ) : ledger.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-all">
                  <td className="p-4 text-xs font-medium text-[var(--text-muted-premium)]">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-orange-300" />
                       {new Date(item.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium)]">{item.user_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {item.type === 'EARN' ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : item.type === 'REDEEM' ? (
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'EARN' ? 'text-emerald-500' : item.type === 'REDEEM' ? 'text-rose-500' : 'text-orange-500'}`}>
                        {item.type}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                     <span className={`text-sm font-black ${item.type === 'EARN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.type === 'EARN' ? '+' : '-'}{Math.abs(item.amount).toLocaleString()}
                     </span>
                  </td>
                  <td className="p-4 text-[10px] font-black text-orange-300 uppercase tracking-widest">
                    {item.source_type} / {item.source_id.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
