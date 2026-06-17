/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  Activity,
  History
} from 'lucide-react';
import { apiService, unwrapData } from '../services/apiService';
import { UserMission } from '../types';
import { toast } from 'react-hot-toast';

type UserMissionRecord = Partial<UserMission> & {
  user_id?: string;
  mission_id?: string;
  completed_at?: string;
  status?: string;
};

const getString = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  return String(responseMessage || (error instanceof Error ? error.message : fallback));
};

const normalizeUserMission = (item: UserMissionRecord, index: number): UserMission => {
  const status = getString(item.status, 'STARTED').toUpperCase();

  return {
    id: getString(item.id, `um-${index}`),
    userId: getString(item.userId || item.user_id || ''),
    missionId: getString(item.missionId || item.mission_id || ''),
    status: status === 'COMPLETED' ? 'COMPLETED' : 'STARTED',
    completedAt: item.completedAt || item.completed_at || undefined,
  };
};

export default function UserMissionsView() {
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUserMissions();
  }, []);

  const loadUserMissions = async () => {
    try {
      const data = await apiService.getUserMissions();
      setUserMissions(unwrapData<UserMission[]>(data).map(normalizeUserMission));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memuat status misi user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight mb-1 text-[var(--text-premium)]">Status Misi User</h2>
          <p className="text-sm text-[var(--text-muted-premium)]">Pantau progress misi yang sedang dijalankan user</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200" />
          <input 
            type="text" 
            placeholder="Cari ID User atau ID Misi..."
            className="w-full bg-orange-50/30 border border-orange-100 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-orange-400 focus:bg-white transition-all font-medium text-sm text-[var(--text-premium)] shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="premium-card bg-white shadow-lg shadow-orange-100/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/50 border-b border-orange-100">
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">ID Transaksi</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">User ID</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Mission ID</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Status</th>
                <th className="p-4 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Selesai Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Memuat data...</td>
                </tr>
              ) : userMissions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-[var(--text-muted-premium)]">Belum ada progress misi tercatat.</td>
                </tr>
              ) : userMissions.map((item) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-all">
                  <td className="p-4 text-xs font-mono text-orange-300">{item.id}</td>
                  <td className="p-4 text-xs font-black text-[var(--text-premium)] uppercase text-orange-600">{item.userId}</td>
                  <td className="p-4 text-xs font-black text-orange-500 uppercase">{item.missionId}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {item.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'COMPLETED' ? 'text-emerald-500' : 'text-orange-400'}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-medium text-[var(--text-muted-premium)]">
                    {item.completedAt ? new Date(item.completedAt).toLocaleString() : '-'}
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
