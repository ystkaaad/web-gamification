/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Target, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Zap,
  Save,
  Type,
  Layers,
  Package,
  ArrowUpCircle
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { Mission } from '../types';
import { toast } from 'react-hot-toast';

export default function Missions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper for config_data
  const getConfig = (configData?: string) => {
    try {
      return configData ? JSON.parse(configData) : { type: 'ONE_TIME' };
    } catch (e) {
      return { type: 'ONE_TIME' };
    }
  };

  const updateConfig = (field: string, value: any) => {
    if (!editingMission) return;
    const currentConfig = getConfig(editingMission.config_data);
    const newConfig = { ...currentConfig, [field]: value };
    setEditingMission({ ...editingMission, config_data: JSON.stringify(newConfig) });
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const data = await dbService.getMissions();
      setMissions(data);
    } catch (error) {
      toast.error('Gagal memuat daftar misi');
    } finally {
      setLoading(false);
    }
  };

const handleSaveMission = async () => {
  if (!editingMission?.title || !editingMission?.description) {
    toast.error('Judul dan deskripsi wajib diisi');
    return;
  }

  setSaving(true);
  try {
    if (editingMission.id) {
      await dbService.updateMission(editingMission.id, editingMission);
      toast.success('Misi berhasil diperbarui');
    } else {
      await dbService.addMission(editingMission as Omit<Mission, 'id'>);
      toast.success('Misi baru berhasil dibuat');
    }
    await loadMissions();
    setEditingMission(null);
  } catch (error) {
    console.error("Save mission error:", error);
    toast.error('Gagal menyimpan misi');
  } finally {
    setSaving(false);
  }
};

  const toggleMissionStatus = async (mission: Mission) => {
    try {
      await dbService.updateMission(mission.id, { is_active: !mission.is_active });
      toast.success('Status misi berhasil diperbarui');
      await loadMissions();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!window.confirm('Hapus misi ini dari spreadsheet?')) return;

    try {
      await dbService.deleteMission(missionId);
      setMissions(prev => prev.filter(item => item.id !== missionId));
      toast.success('Misi berhasil dihapus');
    } catch (error) {
      console.error('Delete mission error:', error);
      toast.error('Gagal menghapus misi');
    }
  };

  const filteredMissions = missions.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter mb-2 text-[var(--text-premium)]">Pusat Misi</h2>
          <p className="text-sm text-[var(--text-muted-premium)] font-medium tracking-wide">Desain tantangan untuk meningkatkan retensi dan engagement pengguna.</p>
        </div>
        <button 
          onClick={() => setEditingMission({ title: '', description: '', reward_points: 0, is_active: true, config_data: JSON.stringify({ type: 'ONE_TIME', itemCode: '', targetAmount: 1 }) })}
          className="bg-[var(--accent-premium)] hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-orange-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Rancang Misi Baru
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200 group-focus-within:text-orange-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari tantangan aktif atau arsip misi..."
            className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-orange-400 focus:bg-white transition-all font-medium text-sm text-[var(--text-premium)] shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1,2].map(i => (
            <div key={i} className="h-64 bg-[#16161A]/50 border border-[#24242A] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredMissions.map((mission) => (
            <div key={mission.id} className="premium-card p-8 flex flex-col gap-6 group relative overflow-hidden transition-all hover:translate-y-[-2px] border-l-8 border-l-orange-400">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center border border-orange-200 shadow-xl group-hover:scale-110 transition-transform">
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl tracking-tighter mb-1.5 text-[var(--text-premium)]">{mission.title}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => toggleMissionStatus(mission)}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border transition-all ${mission.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}
                      >
                        {mission.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        {mission.reward_points} Poin
                      </span>
                      {getConfig(mission.config_data).type === 'PROGRESS' && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          Progressive: {getConfig(mission.config_data).targetAmount}x {getConfig(mission.config_data).itemCode}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[var(--text-muted-premium)] leading-relaxed line-clamp-2 font-medium">
                {mission.description}
              </p>

              <div className="pt-6 border-t border-orange-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                   ID: {mission.id}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingMission(mission)}
                    className="p-3 text-orange-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-transparent hover:border-orange-100"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteMission(mission.id)}
                    className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                    title="Hapus misi"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredMissions.length === 0 && (
            <div className="lg:col-span-2 py-32 text-center border-2 border-dashed border-orange-100 rounded-[3rem] opacity-40">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-200">Database Misi Kosong</p>
            </div>
          )}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-orange-100 w-full max-w-xl rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(255,138,80,0.2)] flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-premium)]">{editingMission.id ? 'Edit Misi' : 'Rancang Misi'}</h3>
                  <p className="text-[9px] text-[var(--text-muted-premium)] mt-0.5 uppercase tracking-[0.2em] font-bold">Definisikan Tantangan Pengguna</p>
                </div>
              </div>
              <button onClick={() => setEditingMission(null)} className="p-2 hover:bg-orange-100 rounded-xl transition-all">
                <XCircle className="w-6 h-6 text-orange-200" />
              </button>
            </div>
 
            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Judul Misi</label>
                <input 
                  type="text"
                  className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                  placeholder="Contoh: Sang Penjelajah Hari Ini"
                  value={editingMission.title}
                  onChange={(e) => setEditingMission({...editingMission, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Deskripsi & Instruksi</label>
                <textarea 
                  className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-3 text-sm font-medium text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner h-24 resize-none"
                  placeholder="Jelaskan langkah-langkah untuk menyelesaikan misi ini..."
                  value={editingMission.description}
                  onChange={(e) => setEditingMission({...editingMission, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Reward (EXP / POIN)</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500" />
                    <input 
                      type="number"
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-black text-amber-600 outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                      value={editingMission.reward_points}
                      onChange={(e) => setEditingMission({...editingMission, reward_points: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Tipe Misi</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
                    <select 
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                      value={getConfig(editingMission.config_data).type}
                      onChange={(e) => updateConfig('type', e.target.value)}
                    >
                      <option value="ONE_TIME">Sekali Selesai (One-time)</option>
                      <option value="PROGRESS">Berkelanjutan (Progress-based)</option>
                    </select>
                  </div>
                </div>
              </div>
 
              {getConfig(editingMission.config_data).type === 'PROGRESS' && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Kode Item Target</label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                      <input 
                        type="text"
                        className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-blue-600 outline-none focus:border-orange-400 transition-all shadow-sm"
                        placeholder="BAKSO_MALANG_SP"
                        value={getConfig(editingMission.config_data).itemCode || ''}
                        onChange={(e) => updateConfig('itemCode', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Jumlah Target</label>
                    <div className="relative">
                      <ArrowUpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                      <input 
                        type="number"
                        className="w-full bg-white border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-xs font-black text-emerald-600 outline-none focus:border-orange-400 transition-all shadow-sm"
                        placeholder="3"
                        value={getConfig(editingMission.config_data).targetAmount || 1}
                        onChange={(e) => updateConfig('targetAmount', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
 
            <div className="p-6 border-t border-orange-50 bg-orange-50/30 flex gap-4">
              <button 
                onClick={() => setEditingMission(null)}
                className="flex-1 py-4 font-black uppercase text-[9px] tracking-[0.2em] text-orange-300 hover:text-orange-500 transition-all"
              >
                Batalkan
              </button>
              <button 
                onClick={handleSaveMission}
                disabled={saving}
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] text-white shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Simpan Misi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
