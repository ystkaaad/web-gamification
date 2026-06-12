/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical,
  Zap,
  TrendingUp,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Edit,
  ArrowRight
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { User } from '../types';
import { toast } from 'react-hot-toast';

export default function UserGamificationManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await dbService.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Gagal memuat daftar user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone_number?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-1 text-[var(--text-premium)]">User Gamifikasi</h2>
          <p className="text-sm text-[var(--text-muted-premium)]">Kontrol poin, level, dan streak harian pengguna</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
          <input 
            type="text" 
            placeholder="Cari user (Nama, Email, HP)..."
            className="w-full bg-orange-50/30 border border-orange-100 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all font-medium text-sm text-[var(--text-premium)] shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-white border border-orange-100 text-orange-300 px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-50 transition-all font-black uppercase text-[10px] tracking-widest">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      <div className="premium-card overflow-hidden bg-white shadow-lg shadow-orange-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Pengguna</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Poin / EXP</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Tier Level</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Streak</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">
                    <div className="flex justify-center mb-4">
                      <div className="w-8 h-8 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Tidak ada data pengguna ditemukan.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition-all group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center font-black text-xs text-white shadow-sm shadow-orange-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-premium)]">{user.name}</p>
                        <p className="text-[10px] text-[var(--text-muted-premium)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Zap className="w-3 h-3" />
                      <span className="text-sm font-black">{(user.points || 0).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4">
                     <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-orange-50 text-orange-500 border border-orange-100">
                        {user.level || 'SILVER'}
                      </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                       <TrendingUp className="w-3 h-3 text-emerald-500" />
                       <span className="text-sm font-bold text-emerald-500">{user.current_streak || 0} Hari</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-orange-100 rounded-lg text-orange-200 hover:text-orange-500 transition-all">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-orange-100 rounded-lg text-orange-200 hover:text-orange-500 transition-all">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
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
