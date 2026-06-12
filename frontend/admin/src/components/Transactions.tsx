/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Zap, 
  History, 
  Search, 
  Filter,
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Transaction } from '../types';

export default function Transactions({ readonly }: { readonly?: boolean }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await dbService.getTransactions();
        setTransactions(data);
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
        <h2 className="text-2xl font-black tracking-tight mb-1 text-[var(--text-premium)]">Transaksi Referral</h2>
        <p className="text-sm text-[var(--text-muted-premium)]">Log transaksi yang menghasilkan reward referral volume</p>
      </div>

      <div className="premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Nota</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">User ID</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Nominal</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Poin Diterima</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Memuat transaksi...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Belum ada transaksi referral tercatat.</td></tr>
              ) : transactions.map((t) => (
                <tr key={t.id} className="hover:bg-orange-50/30 transition-all">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <FileText className="w-4 h-4 text-orange-300" />
                       <span className="text-xs font-black text-[var(--text-premium)] uppercase text-orange-600">{t.receipt_number}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-[var(--text-muted-premium)]">{t.user_id}</td>
                  <td className="p-4 text-xs font-black text-[var(--text-premium)]">Rp {t.total_amount.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-orange-500">
                       <Zap className="w-3 h-3" />
                       <span className="text-xs font-black">+{t.points_earned.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {t.status}
                     </span>
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
