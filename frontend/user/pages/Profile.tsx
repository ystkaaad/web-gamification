import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { 
  User, Mail, Hash, 
  Shield, Crown, Gem, ChevronRight, 
  CheckCircle2, Info, Edit3, Zap,
  TrendingUp, Briefcase, Award, Star, X
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser, isLoading } = useApp();
  const navigate = useNavigate();
  
  // 1. Memastikan totalPoints selalu bernilai angka
  const totalPoints = user?.points || 0;

  // 2. LOGIKA PENENTU LEVEL OTOMATIS (Mencegah munculnya Bronze)
  // Level dihitung murni berdasarkan poin, mengabaikan data dari database
  let currentLevel = 'SILVER';
  if (totalPoints >= 1000) {
    currentLevel = 'PLATINUM';
  } else if (totalPoints >= 500) {
    currentLevel = 'GOLD';
  } else {
    currentLevel = 'SILVER';
  }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // 3. Helper untuk progres level member (XP) disesuaikan dengan currentLevel
  const getLevelProgress = () => {
    const target = currentLevel === 'PLATINUM' ? 1000 : (currentLevel === 'GOLD' ? 1000 : 500);
    return Math.round(Math.min((totalPoints / target) * 100, 100));
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-gradient-to-b from-orange-200/50 to-transparent blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-32 relative z-10">
        
        {/* =========================================
            1. TOP PROFILE HEADER (GAMIFIED BANNER)
        ========================================= */}
        <section className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-orange-500/30 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          
          {/* Efek Ornamen Header */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute top-0 right-10 p-8 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
            {isAffiliate ? <Briefcase size={200} /> : <Crown size={200} />}
          </div>
          
{/* Avatar & User Info */}
           <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
             <div className="relative group/avatar">
               <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-[2rem] p-1.5 border border-white/40 shadow-2xl overflow-hidden">
                 {user?.avatar ? (
                   <img 
                     src={user.avatar} 
                     className="w-full h-full object-cover rounded-[1.5rem] group-hover/avatar:scale-110 transition-transform duration-500" 
                     alt="Profile" 
                   />
                 ) : (
                   <div className="w-full h-full rounded-[1.5rem] bg-orange-100 flex items-center justify-center">
                     <User size={48} className="text-orange-500" />
                   </div>
                 )}
               </div>
               <div className="absolute -bottom-3 -right-3 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border-2 border-orange-500 rotate-12 group-hover/avatar:rotate-0 transition-transform">
                 {isAffiliate ? <Award size={20} fill="currentColor" className="text-amber-400" /> : <Crown size={20} fill="currentColor" className="text-amber-400" />}
               </div>
             </div>
            
<div className="text-center md:text-left space-y-2">
               <div className="flex flex-col md:flex-row items-center gap-3">
                 <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.name}</h1>
                 <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full border border-white/30 uppercase tracking-[0.2em] shadow-sm">
                   {user?.isAffiliate ? 'AFFILIATE' : 'MEMBER'}
                 </span>
               </div>
             </div>
          </div>

          {/* Points Box (Tanpa Tombol Edit Profil) */}
          <div className="relative z-10 flex flex-col items-center md:items-end gap-4 bg-white/10 backdrop-blur-md p-6 rounded-[2rem] border border-white/20 w-full md:w-auto">
            <div className="text-center md:text-right">
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mb-1">Total Poin Gamifikasi</p>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Zap size={28} className="text-amber-300 fill-amber-300 animate-pulse" />
                <span className="text-4xl md:text-5xl font-black tracking-tighter">{totalPoints.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            2. MAIN GRID SECTION
        ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: Account Details & Status --- */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status Level Card */}
            <div className="bg-white rounded-[2rem] p-8 text-[#0F172A] shadow-xl shadow-orange-900/5 relative overflow-hidden group border border-slate-100">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-500 text-orange-600">
                 {isAffiliate ? <TrendingUp size={100} /> : <Shield size={100} />}
              </div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 bg-gradient-to-tr from-orange-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-400/30 text-white">
                  {currentLevel === 'PLATINUM' ? <Gem size={24} /> : currentLevel === 'GOLD' ? <Crown size={24} /> : <Shield size={24} />}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Saat Ini</p>
                  <h4 className="text-2xl font-black tracking-tighter uppercase italic leading-none bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                    {currentLevel}
                  </h4>
                </div>
              </div>

              {/* Progress Bar Utama */}
              <div className="space-y-3 relative z-10 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress XP</span>
                  <span className="text-xs font-black text-orange-600">{getLevelProgress()}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full relative" 
                    style={{ width: `${getLevelProgress()}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
                  {currentLevel === 'PLATINUM' ? 'Anda berada di level tertinggi!' : 'Kumpulkan lebih banyak poin untuk naik level.'}
                </p>
              </div>
            </div>

            {/* Detail Akun Card */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
              <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                  <User size={16} />
                </div>
                <h3 className="font-black text-[#0F172A] text-sm uppercase tracking-widest">Data Personal</h3>
              </div>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Alamat Email', value: user?.email },
                  { icon: Hash, label: 'Partner ID', value: `NG-${isAffiliate ? 'AFF' : 'MEM'}-${user?.id || '000'}` },
                  { icon: CheckCircle2, label: 'Status Verifikasi', value: 'Terverifikasi (Active)', color: 'text-green-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center group/item">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 transition-colors group-hover/item:bg-orange-50 ${item.color || 'text-slate-400 group-hover/item:text-orange-500'}`}>
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                      <p className={`text-sm font-bold truncate ${item.color ? item.color : 'text-slate-700'}`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN: Business Gamification Milestones --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-[#0F172A] flex items-center gap-3 tracking-tight">
                    <Award className="text-orange-500" /> Milestone Gamifikasi
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-1">Keuntungan eksklusif berdasarkan level Anda.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Level: SILVER */}
                <div className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[260px] relative transition-all duration-300 ${currentLevel === 'SILVER' ? 'bg-gradient-to-b from-orange-50 to-white border-2 border-orange-400 shadow-lg shadow-orange-200/50 transform -translate-y-2' : 'bg-slate-50 border border-slate-200 opacity-70 grayscale-[30%]'}`}>
                  <div className="space-y-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentLevel === 'SILVER' ? 'bg-orange-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                      <Shield size={28} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Silver</h4>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-1 bg-white inline-block px-3 py-1 rounded-full border border-orange-100">0 - 499 Pts</p>
                    </div>
                  </div>
                  {currentLevel === 'SILVER' && (
                    <div className="mt-6 flex items-center gap-2 text-orange-600 font-bold text-xs bg-orange-100/50 p-3 rounded-xl">
                      <Star size={14} className="fill-orange-600" /> Level Saat Ini
                    </div>
                  )}
                </div>

                {/* Level: GOLD */}
                <div className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[260px] relative transition-all duration-300 ${currentLevel === 'GOLD' ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 shadow-lg shadow-amber-200/50 transform -translate-y-2' : 'bg-slate-50 border border-slate-200 opacity-70 grayscale-[30%]'}`}>
                  <div className="space-y-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentLevel === 'GOLD' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-200 text-slate-400'}`}>
                      <Crown size={28} fill={currentLevel === 'GOLD' ? 'currentColor' : 'none'} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Gold</h4>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 bg-white inline-block px-3 py-1 rounded-full border border-amber-100">500 - 999 Pts</p>
                    </div>
                  </div>
                  {currentLevel === 'GOLD' ? (
                     <div className="mt-6 flex items-center gap-2 text-amber-600 font-bold text-xs bg-amber-100/50 p-3 rounded-xl">
                       <Star size={14} className="fill-amber-600" /> Level Saat Ini
                     </div>
                  ) : (
                    totalPoints < 500 && (
                      <div className="mt-6 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Kurang {500 - totalPoints} XP</p>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-400" style={{ width: `${(totalPoints/500)*100}%` }} />
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Level: PLATINUM */}
                <div className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[260px] relative transition-all duration-300 ${currentLevel === 'PLATINUM' ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-2 border-slate-700 shadow-2xl shadow-slate-900/40 transform -translate-y-2 text-white' : 'bg-slate-50 border border-slate-200 opacity-70 grayscale-[30%]'}`}>
                  <div className="space-y-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${currentLevel === 'PLATINUM' ? 'bg-gradient-to-br from-slate-300 to-white text-slate-900 shadow-lg shadow-white/20' : 'bg-slate-200 text-slate-400'}`}>
                      <Gem size={28} />
                    </div>
                    <div>
                      <h4 className={`text-2xl font-black tracking-tighter uppercase italic ${currentLevel === 'PLATINUM' ? 'text-white' : 'text-slate-800'}`}>Platinum</h4>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 inline-block px-3 py-1 rounded-full border ${currentLevel === 'PLATINUM' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-500 border-slate-200'}`}>1000+ Pts</p>
                    </div>
                  </div>
                  {currentLevel === 'PLATINUM' ? (
                     <div className="mt-6 flex items-center gap-2 text-white font-bold text-xs bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-sm">
                       <Crown size={14} className="fill-white" /> Level Tertinggi!
                     </div>
                  ) : (
                    totalPoints < 1000 && (
                      <div className="mt-6 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Kurang {1000 - totalPoints} XP</p>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                           <div className="h-full bg-slate-400" style={{ width: `${(totalPoints/1000)*100}%` }} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            3. ADDITIONAL ACTIONS SECTION
        ========================================= */}
        <section className="grid grid-cols-1 gap-6">
          <button className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/40 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Info size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-black text-slate-800">Panduan Keanggotaan</h4>
                <p className="text-xs text-slate-500 font-medium">Pelajari cara mendapatkan poin & level.</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>
        </section>

      </div>
    </div>
  );
};

export default Profile;