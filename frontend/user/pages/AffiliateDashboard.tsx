
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { 
  Share2, Users, Trophy, Copy, 
  Check, Zap, Star, Search,
  Award, Wallet, BarChart3,
  Percent, ArrowRight, Crown,
  ArrowUpRight, Info
} from 'lucide-react';

const AffiliateDashboard: React.FC = () => {
  const { user, referralMembers, isLoading } = useApp();
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getLevelReq = (level: string) => {
    switch(level) {
      case 'PLATINUM':
        return { 
          label: 'PLATINUM', 
          commission: '10%',
          desc: 'Status Affiliate Platinum aktif dengan akses prioritas dan yield maksimal.',
          color: 'from-slate-900 to-indigo-950',
          accent: 'text-indigo-400'
        };
      case 'GOLD':
        return { 
          label: 'GOLD', 
          commission: '5%',
          desc: 'Status Affiliate Gold aktif dengan akses premium.',
          color: 'from-orange-600 to-orange-800',
          accent: 'text-orange-300'
        };
      default:
        return { 
          label: 'SILVER', 
          commission: '2%',
          desc: 'Status Affiliate Silver aktif.',
          color: 'from-orange-400 to-orange-600',
          accent: 'text-orange-200'
        };
    }
  };

  const currentLevel = user?.memberLevel || 'SILVER';
  const req = getLevelReq(currentLevel);
  const totalPoints = user?.points || 0;
  // Progress bar logic removed as affiliate leveling is now external
  const memberProgress = 100; // Always show as reached/managed externally

  const copyToClipboard = () => {
    if (user) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredMembers = referralMembers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-6 py-10 space-y-12 pb-32 bg-[#FDFDFD]"
    >
      {/* SaaS Style Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100">
             <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
             <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">Affiliate Console 2.0</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
            Business <br/> <span className="text-orange-600">Protocol.</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 flex items-center gap-8 shadow-xl shadow-slate-100/50">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Net Balance</p>
                <p className="text-2xl font-black text-slate-900 italic tabular-nums leading-none">{totalPoints?.toLocaleString() ?? 0} <span className="text-xs opacity-30">XP</span></p>
             </div>
             <div className="w-px h-10 bg-slate-100"></div>
             <div className="text-right">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 leading-none">Yield Rate</p>
                <p className="text-2xl font-black text-orange-600 italic leading-none">{req.commission}</p>
             </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       {[
          { label: 'Network Points', value: totalPoints?.toLocaleString() ?? '0', unit: 'XP', icon: Wallet, shadow: 'shadow-orange-100', color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Active', trendColor: 'text-emerald-500' },
          { label: 'External Rank', value: user?.memberLevel || 'SILVER', unit: 'BADGE', icon: Crown, shadow: 'shadow-indigo-100', color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Verified', trendColor: 'text-slate-400' },
          { label: 'Network Size', value: referralMembers.length.toString(), unit: 'USERS', icon: Users, shadow: 'shadow-emerald-100', color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Live', trendColor: 'text-emerald-500' },
          { label: 'Yield Gen', value: referralMembers.reduce((acc, m) => acc + (m.contributionPoints ?? 0), 0).toLocaleString(), unit: 'XP', icon: Star, shadow: 'shadow-amber-100', color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Growing', trendColor: 'text-emerald-500' },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5 }} className={`bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl ${stat.shadow} flex flex-col justify-between group hover:border-orange-200 transition-all`}>
            <div className="flex items-start justify-between mb-8">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div className={`text-[10px] font-black ${stat.trendColor} uppercase tracking-widest px-2 py-0.5 rounded-full border border-current opacity-70`}>
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{stat.label}</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums flex items-baseline gap-2">
                {stat.value} 
                <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase">{stat.unit}</span>
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          
          {/* Milestone Card */}
          <motion.div variants={itemVariants} className={`bg-gradient-to-br ${req.color} p-12 md:p-16 rounded-[4rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group`}>
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-[8000ms]">
               <Crown size={350} />
            </div>
            
            <div className="relative z-10 space-y-12">
               <div className="flex flex-col md:flex-row justify-between gap-12">
                  <div className="space-y-6 flex-1">
                     <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20">
                        <Trophy size={14} className="text-orange-300" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Rank Achievement</span>
                     </div>
                     <h2 className="text-6xl md:text-7xl font-black italic tracking-tighter leading-[0.85]">
                        <span className="text-orange-300">{req.label}</span> <br/>
                        STATUS
                     </h2>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 max-w-sm shrink-0 shadow-2xl flex flex-col justify-center">
                     <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">Current Protocol</p>
                     <p className="text-xl font-black italic leading-tight text-orange-50 mb-2">{req.commission} Profit Share</p>
                     <p className="text-xs font-medium text-white/60 leading-relaxed">{req.desc}</p>
                  </div>
               </div>

               <div className="space-y-8 max-w-2xl">
                  <div className="flex justify-between items-end italic font-black">
                     <div className="space-y-1">
                        <p className="text-white text-4xl tabular-nums leading-none">ACTIVE</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] not-italic font-bold">Membership Status</p>
                     </div>
                     <div className="text-right space-y-1">
                        <p className="text-white text-xl tabular-nums leading-none">VERIFIED</p>
                        <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] not-italic font-bold">Affiliate Protocol</p>
                     </div>
                  </div>
                  <div className="h-6 bg-black/30 rounded-full border border-white/5 p-1.5 shadow-inner">
                     <div className="h-full bg-gradient-to-r from-orange-400 to-white rounded-full shadow-[0_0_25px_rgba(255,255,255,0.6)]" style={{ width: '100%' }} />
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Network Explorer */}
          <motion.div variants={itemVariants} className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-100 overflow-hidden">
            <div className="px-12 py-12 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-8 bg-slate-50/20">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none mb-2">Jaringan Saya</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Operational Console</p>
                  </div>
               </div>
               <div className="relative w-full sm:w-80">
                  <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search Protocol ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-8 py-5 bg-white border border-slate-200 rounded-[1.8rem] text-sm font-bold outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all shadow-inner"
                  />
               </div>
            </div>
            <div className="p-8 space-y-4">
               {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => (
                 <motion.div 
                  id={`member-${member.id}`}
                  whileHover={{ x: 8 }} 
                  key={`${member.id}-${idx}`} 
                  className="flex items-center justify-between p-8 rounded-[3rem] bg-white border border-slate-50 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/30 transition-all group"
                 >
                   <div className="flex items-center gap-6">
                     <div className="relative">
                        <img src={member.avatar} className="w-20 h-20 rounded-[2.5rem] object-cover border-4 border-slate-100 shadow-md group-hover:border-orange-100 transition-colors" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
                     </div>
                     <div className="space-y-1">
                       <h4 className="font-black text-slate-900 text-xl leading-none italic">{member.name}</h4>
                       <div className="flex items-center gap-4">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">{member.id}</p>
                          <span className="text-[10px] text-slate-200 uppercase tracking-widest">•</span>
                          <p className="text-[10px] text-slate-400 font-bold italic">Joined {member.joinedDate ?? member.joined_at ?? '2024'}</p>
                       </div>
                     </div>
                   </div>
                   <div className="text-right flex items-center gap-10">
                      <div className="hidden md:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Affiliation</p>
                        <p className="text-sm font-black italic text-slate-500 underline underline-offset-4 decoration-slate-100">Member</p>
                      </div>
                      <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
                      <div className="pr-4">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Yield Generated</p>
                        <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                          +{member.contributionPoints?.toLocaleString() ?? 0} 
                          <span className="ml-1 text-xs font-bold text-slate-300">XP</span>
                        </p>
                      </div>
                      <button className="w-14 h-14 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                        <BarChart3 size={24} />
                      </button>
                   </div>
                 </motion.div>
               )) : (
                 <div className="py-24 text-center space-y-6 opacity-20 italic">
                    <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
                      <Users size={40} className="text-slate-400" />
                    </div>
                    <p className="text-lg font-black uppercase tracking-[0.4em]">Empty Protocol</p>
                 </div>
               )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          
          {/* Referral Card - Premium Focus */}
          <motion.div variants={itemVariants} className="bg-white border-2 border-orange-600 rounded-[4rem] p-12 text-slate-900 shadow-[0_30px_60px_-15px_rgba(234,88,12,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:scale-125 group-hover:rotate-6 transition-transform duration-[4000ms]">
               <Share2 size={240} />
            </div>
            
            <div className="relative z-10 space-y-12">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-orange-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-600/30 group-hover:rotate-12 transition-transform">
                    <Share2 size={36} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-[0.9]">Master <br/><span className="text-orange-600">Protocol.</span></h3>
                  </div>
               </div>

               <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-black text-orange-600 uppercase tracking-[0.4em]">
                       <span>Access Key</span>
                       <div className="flex gap-1">
                          <div className="w-1 h-1 bg-orange-600 rounded-full animate-ping" />
                          <div className="w-1 h-1 bg-orange-400 rounded-full" />
                       </div>
                    </div>
                    <div className="relative">
<div className="font-mono font-black text-5xl text-center py-12 tracking-[0.2em] text-slate-900 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200/50 shadow-inner group-hover:bg-white transition-colors duration-500">
                         {user?.referralCode ?? user?.referral_code ?? '———'}
                       </div>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                         <button 
                            onClick={copyToClipboard}
                            className={`px-12 py-6 rounded-[2rem] transition-all active:scale-95 flex items-center gap-4 text-xs font-black uppercase tracking-[0.25em] shadow-2xl ${copied ? 'bg-emerald-500 shadow-emerald-200' : 'bg-slate-900 hover:bg-orange-600 shadow-orange-200'} text-white`}
                         >
                           {copied ? (
                             <><Check size={20} /> Success</>
                           ) : (
                             <><Copy size={20} /> Copy Link</>
                           )}
                         </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12">
                     <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 text-slate-200 opacity-20 -mb-6 -mr-6">
                           <Info size={120} />
                        </div>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed italic relative z-10">
                          Gunakan kode ini untuk mengundang member baru ke jaringan Anda. <span className="text-slate-900">Makin banyak transaksi, makin tinggi profit yield Anda.</span>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>

          {/* Quick Analytics */}
          <motion.div variants={itemVariants} className="bg-[#0F172A] rounded-[4rem] p-12 text-white space-y-12 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">Analytics</p>
                   <h4 className="text-3xl font-black tracking-tight italic uppercase">Network Analytics.</h4>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-orange-500/50 transition-colors">
                   <Zap size={28} className="text-orange-400" />
                </div>
             </div>
             
             <div className="space-y-10 relative z-10">
                {[
                  { label: 'Monthly Inflow', val: '+18.4%', progress: 'w-3/4', color: 'bg-orange-600' },
                  { label: 'Member Retention', val: '92%', progress: 'w-11/12', color: 'bg-emerald-500' },
                  { label: 'Conversion Yield', val: '+5.2%', progress: 'w-1/2', color: 'bg-indigo-500' },
                ].map((row, i) => (row && (
                  <div key={i} className="space-y-4">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{row.label}</p>
                        <p className="text-xs font-black italic text-white leading-none">{row.val}</p>
                     </div>
                     <div className="h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: row.progress.split('-')[1] }}
                           transition={{ delay: 0.5 + (i * 0.2), duration: 1 }}
                           className={`h-full ${row.color} rounded-full`} 
                        />
                     </div>
                  </div>
                )))}
             </div>

             <button className="relative z-10 w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all">
                Download Detailed Report
             </button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default AffiliateDashboard;
