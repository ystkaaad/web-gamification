/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Ticket, 
  History, 
  Search, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Redemption } from '../types';

export default function Redemptions({ readonly }: { readonly?: boolean }) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await dbService.getRedemptions();
        setRedemptions(data);
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
        <h2 className="text-2xl font-black tracking-tight mb-1 text-[var(--text-premium)]">Audit Klaim Voucher</h2>
        <p className="text-sm text-[var(--text-muted-premium)]">Log penukaran poin user dengan voucher fisik/digital</p>
      </div>

      <div className="premium-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">ID User</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">ID Voucher</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Status</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Memuat log klaim...</td></tr>
              ) : redemptions.map((r) => (
                <tr key={r.id} className="hover:bg-orange-50/30 transition-all">
                  <td className="p-4 text-xs font-medium text-[var(--text-muted-premium)]">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="p-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--text-premium)]">{r.user_id}</td>
                  <td className="p-4 text-xs font-black tracking-[0.1em] text-orange-500 uppercase">{r.voucher_id}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${r.status === 'USED' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-orange-500 hover:text-orange-600 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                      Detail
                      <ChevronRight className="w-3 h-3" />
                    </button>
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
