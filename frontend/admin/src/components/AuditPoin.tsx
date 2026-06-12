/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Filter, Download, History, Zap, ShieldAlert } from 'lucide-react';
import { dbService } from '../services/dbService';

export default function AuditPoin() {
  const [rawLedger, setRawLedger] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    const fetchLedger = async () => {
      setIsLoading(true);
      try {
        // Mengambil data riwayat mutasi dari database Google Sheets
        const ledger = await dbService.getPointLedger(true); 
        
        if (ledger && Array.isArray(ledger)) {
          // Mengurutkan data dari yang paling terbaru (Descending)
          const sortedLedger = [...ledger].sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setRawLedger(sortedLedger);
        }
      } catch (error) {
        console.error('Error fetching audit ledger:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLedger();
  }, []);

  // FITUR PENCARIAN & FILTER
  const filteredLedger = rawLedger.filter((t) => {
    const points = Number(t.pointsChange || t.amount || t.points) || 0;
    const desc = (t.description || t.item || t.source || '').toLowerCase();
    const userId = String(t.userId || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    // Cocokkan dengan input pencarian (bisa cari ID atau Deskripsi)
    const matchesSearch = userId.includes(searchLower) || desc.includes(searchLower);

    // Terapkan Filter Dropdown (IN = Masuk, OUT = Keluar)
    if (filterType === 'IN') return matchesSearch && points > 0;
    if (filterType === 'OUT') return matchesSearch && points < 0;
    return matchesSearch;
  });

  // FORMATTER TANGGAL
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 font-sans text-slate-800 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      
      {/* Container Utama */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        
        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-50 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 italic">
              <History className="text-orange-500" size={28} />
              Audit Mutasi Poin
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Pantau seluruh pergerakan keluar-masuk poin (XP) dari semua pengguna secara real-time.
            </p>
          </div>
          <button 
            onClick={() => alert("Fitur Export to Excel/CSV akan segera hadir!")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors shadow-sm font-bold text-sm"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>

        {/* Baris Pencarian dan Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari ID User atau Keterangan Aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2">
            <Filter size={16} className="text-slate-400 ml-2" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-2 pr-6 py-3 bg-transparent focus:outline-none text-sm font-bold text-slate-700 cursor-pointer"
            >
              <option value="ALL">Semua Transaksi</option>
              <option value="IN">Poin Masuk (+)</option>
              <option value="OUT">Poin Keluar (-)</option>
            </select>
          </div>
        </div>

        {/* Pembungkus Tabel */}
        <div className="overflow-hidden border border-slate-100 rounded-2xl">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse relative">
              
              {/* Header Tabel (Sticky/Tetap di atas saat di-scroll) */}
              <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-sm border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <tr>
                  <th className="p-4 pl-6 whitespace-nowrap">Waktu Transaksi</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4 w-1/3">Keterangan</th>
                  <th className="p-4 text-center">Tipe</th>
                  <th className="p-4 pr-6 text-right">Mutasi</th>
                </tr>
              </thead>
              
              {/* Isi Tabel */}
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-500 font-medium text-sm">Menarik data dari server...</p>
                    </td>
                  </tr>
                ) : filteredLedger.length > 0 ? (
                  // Dibatasi 100 baris agar browser tidak lag saat merender ribuan data
                  filteredLedger.slice(0, 100).map((t, index) => {
                    const points = Number(t.pointsChange || t.amount || t.points) || 0;
                    const isPositive = points > 0;

                    return (
                      <tr key={index} className="hover:bg-orange-50/50 transition-colors">
                        <td className="p-4 pl-6 text-sm text-slate-500 whitespace-nowrap font-medium">
                          {formatDateTime(t.createdAt)}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-700">
                          {t.userId || '-'}
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600">
                          {t.description || t.item || t.source || 'Aktivitas Sistem'}
                        </td>
                        <td className="p-4 text-center">
                           <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                             isPositive 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                           }`}>
                             {isPositive ? 'KREDIT' : 'DEBIT'}
                           </span>
                        </td>
                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                          <span className={`text-base font-bold tabular-nums flex items-center justify-end gap-1 ${
                            isPositive ? 'text-orange-500' : 'text-slate-400'
                          }`}>
                            {isPositive ? '+' : ''}{points}
                            <Zap size={14} className={isPositive ? 'text-orange-400' : 'text-slate-300'} />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <ShieldAlert size={48} strokeWidth={1.5} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-bold">Tidak ada riwayat mutasi yang cocok.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer Tabel */}
          {!isLoading && filteredLedger.length > 0 && (
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400">
                Menampilkan {Math.min(filteredLedger.length, 100)} data mutasi terbaru
              </span>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}