
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { LoyaltyLevel, User as UserType } from '../types';
import { 
  User, Mail, Calendar, Hash, 
  Shield, Crown, Gem, ChevronRight, 
  Settings, Lock, CheckCircle2,
  Info, LogOut, Edit3, Zap,
  TrendingUp, Briefcase, Users,
  BarChart3, Award, Star, Phone, X
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout, updateUser, isLoading } = useApp();
  const navigate = useNavigate();
  const totalPoints = user?.points || 0;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const isAffiliate = user?.isAffiliate;

  const handleOpenEdit = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser(formData);
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper untuk progres level member (XP)
  const getLevelProgress = () => {
    const level = user?.memberLevel || 'SILVER';
    const target = level === 'PLATINUM' ? 1000 : (level === 'GOLD' ? 1000 : 500);
    return Math.round(Math.min((totalPoints / target) * 100, 100));
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-6 pb-32">
      
      {/* 1. TOP PROFILE HEADER */}
      <section className="bg-white border border-orange-100 rounded-[2.5rem] p-5 md:p-8 text-[#0F172A] shadow-2xl shadow-orange-100/50 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[3000ms] text-orange-600">
          {isAffiliate ? <Briefcase size={160} /> : <Crown size={160} />}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-50 rounded-[1.5rem] p-1 border-2 border-orange-200 shadow-xl overflow-hidden">
               <img 
                 src={`https://i.pravatar.cc/200?u=${user?.id}`} 
                 className="w-full h-full object-cover rounded-[1.5rem]" 
                 alt="Profile" 
               />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-orange-600 text-white p-1.5 rounded-lg shadow-lg border-2 border-white">
              {isAffiliate ? <Award size={16} fill="currentColor" /> : <Crown size={16} fill="currentColor" />}
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <div className="flex flex-col md:flex-row items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A]">{user?.name}</h1>
              <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-3 py-1 rounded-full border border-orange-100 uppercase tracking-[0.2em]">
                {user?.isAffiliate ? 'AFFILIATE' : 'MEMBER'} ACCOUNT
              </span>
            </div>
            <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-1.5 text-xs italic">
              <Calendar size={12} className="text-orange-500" /> Terdaftar Sejak 2024
            </p>
          </div>
        </div>

        <button 
          onClick={handleOpenEdit}
          className="relative z-10 bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 active:scale-95"
        >
          Edit Data
        </button>
      </section>

      {/* 2. MAIN GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Account Details & Status */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Detail Akun Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-orange-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center">
                <Hash size={14} />
              </div>
              <h3 className="font-black text-[#0F172A] text-[11px] uppercase tracking-widest">Identitas Digital</h3>
            </div>

            <div className="space-y-5">
              {[
                { icon: Mail, label: 'Alamat Email', value: user?.email },
                { icon: Hash, label: 'Partner ID', value: `NG-${isAffiliate ? 'AFF' : 'MEM'}-${user?.id}` },
                { icon: isAffiliate ? Zap : Shield, label: 'Status Verifikasi', value: 'Terverifikasi' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3.5">
                  <div className="shrink-0 text-slate-300 mt-0.5">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-xs font-bold text-slate-700 break-all">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Member/Affiliate Card */}
          <div className="bg-white border border-orange-100 rounded-[2rem] p-6 text-[#0F172A] shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform text-orange-600">
               {isAffiliate ? <TrendingUp size={80} fill="currentColor" /> : <Shield size={80} fill="currentColor" />}
            </div>
            <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.4em] mb-2 italic">Level Akses</p>
            <h4 className="text-2xl font-black tracking-tighter uppercase italic leading-none text-[#0F172A]">
              {user?.memberLevel} Member
            </h4>
            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed font-medium">
              {isAffiliate 
                ? 'Akun bisnis aktif dengan fitur analisis jaringan lengkap.' 
                : 'Nikmati akses eksklusif dan layanan prioritas.'
              }
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Business Milestones */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-black text-[#0F172A] uppercase tracking-widest flex items-center gap-3">
              <Shield size={20} className="text-orange-600" />
              Tingkatan Member (Gamifikasi)
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Level Berdasarkan Poin
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level: SILVER */}
            <div className={`bg-white border p-5 rounded-[1.8rem] flex flex-col justify-between min-h-[250px] relative shadow-sm ${user?.memberLevel === 'SILVER' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-100'}`}>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">Silver</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">0 - 499 Points</p>
                </div>
              </div>
              {user?.memberLevel === 'SILVER' && (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">Level Anda Saat Ini</p>
                </div>
              )}
            </div>

            {/* Level: GOLD */}
            <div className={`bg-white border p-5 rounded-[1.8rem] flex flex-col justify-between min-h-[250px] relative shadow-sm ${user?.memberLevel === 'GOLD' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-100'}`}>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Crown size={24} fill="currentColor" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">Gold</h4>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">500 - 999 Points</p>
                </div>
              </div>
{user?.memberLevel === 'GOLD' ? (
                 <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                   <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">Level Anda Saat Ini</p>
                 </div>
               ) : (
                  user?.points < 500 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase italic">Butuh {500 - (user?.points ?? 0)} Poin Lagi</p>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-orange-600" style={{ width: `${((user?.points ?? 0)/500)*100}%` }} />
                      </div>
                    </div>
                  )
               )}
             </div>

             {/* Level: PLATINUM */}
             <div className={`bg-white border p-5 rounded-[1.8rem] flex flex-col justify-between min-h-[250px] relative shadow-sm ${user?.memberLevel === 'PLATINUM' ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-orange-100'}`}>
               <div className="space-y-4">
                 <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white">
                   <Gem size={24} />
                 </div>
                 <div>
                   <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-none">Platinum</h4>
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">1000+ Points</p>
                 </div>
               </div>
               {user?.memberLevel === 'PLATINUM' ? (
                 <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                   <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">Level Tertinggi!</p>
                 </div>
               ) : (
                 user?.points < 1000 && (
                   <div className="space-y-2">
                     <p className="text-[9px] font-black text-slate-400 uppercase italic">Butuh {1000 - (user?.points ?? 0)} Poin Lagi</p>
                     <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-600" style={{ width: `${((user?.points ?? 0)/1000)*100}%` }} />
                     </div>
                   </div>
                 )
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ADDITIONAL ACTIONS SECTION */}
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center justify-center">
          <button className="flex items-center gap-3 px-10 py-4 text-slate-500 hover:text-orange-600 font-black text-[10px] uppercase tracking-widest transition-all">
            <Info size={18} /> Panduan Keanggotaan
          </button>
        </div>
      </section>

      {/* 4. EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-orange-950/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-10 md:p-14">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full mb-4 border border-orange-100">
                  <Edit3 size={14} className="text-orange-600" />
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">
                    Perbarui Profil
                  </span>
                </div>
                <h2 className="text-3xl font-black text-[#0F172A] mb-2 tracking-tight italic">Edit Data Anda</h2>
                <p className="text-slate-500 font-medium text-sm italic leading-relaxed">Pastikan informasi Anda tetap akurat untuk kemudahan transaksi.</p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Budi Santoso" 
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/10 outline-none transition-all font-bold shadow-sm" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Alamat Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="budi@email.com" 
                    className="w-full px-6 py-4 rounded-2xl bg-white border border-orange-100 text-slate-900 placeholder:text-slate-400 focus:border-orange-600 focus:bg-white focus:ring-4 focus:ring-orange-600/10 outline-none transition-all font-bold shadow-sm" 
                    required 
                  />
                </div>
                
                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-[2] py-5 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 active:scale-95"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
