import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Gift, Wallet, Zap, ArrowRight, CheckCircle2, 
  Ticket, AlertCircle, Briefcase, Award, 
  TrendingUp, Star, Shield, Gem, Percent, Sparkles
} from 'lucide-react';

const getVoucherImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=225&fit=crop';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/uploads')) {
    const baseApiUrl = ((import.meta as any).env?.VITE_GAMIFICATION_API_URL || 'http://localhost:4000').replace(/\/api\/gamification\/?$/, '');
    return `${baseApiUrl}${imageUrl}`;
  }
  return imageUrl;
};

const AffiliateClaimReward: React.FC = () => {
  const { user, claimVoucher, myVouchers, vouchers, isLoading } = useApp();
  const totalPoints = user?.points ?? 0;
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-perks'>('catalog');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Rewards dikosongkan untuk diatur via Admin
  const affiliateRewards = vouchers.filter(v => v.title.toLowerCase().includes('elite') || v.title.toLowerCase().includes('partner'));

  const handleClaim = async (v: any) => {
    setClaimingId(v.id);
    const success = await claimVoucher(v);
    setClaimingId(success ? 'success' : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-orange-500">
            <Gem size={20} className="animate-pulse" />
          </div>
        </div>
        <p className="text-xs font-black text-orange-400 uppercase tracking-widest animate-pulse">Memuat Data VIP...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      
      {/* HEADER HERO SECTION: Vibrant Gradient & Glassmorphism */}
      <header className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 p-8 md:p-12 rounded-[3rem] text-white shadow-[0_20px_50px_-12px_rgba(249,115,22,0.5)] overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-orange-300">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 text-white/10 rotate-12 pointer-events-none transition-transform duration-1000 hover:rotate-45 hover:scale-110">
          <Award size={300} />
        </div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 text-white/10 -rotate-12 pointer-events-none">
          <Sparkles size={150} />
        </div>
        
        <div className="relative z-10 space-y-4 text-center lg:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-white/30 shadow-sm">
            <Gem size={14} className="text-amber-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Partner Privilege</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md">
            Elite <span className="text-amber-200 italic">Rewards</span>
          </h1>
          <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
            Tukarkan Profit Poin Anda dengan benefit gaya hidup eksklusif dan alat pemasaran premium.
          </p>
        </div>

        {/* Floating Point Balance Card (Glassmorphism) */}
        <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/30 p-6 md:p-8 rounded-[2.5rem] flex items-center gap-6 shadow-2xl hover:-translate-y-1 transition-transform duration-300 w-full lg:w-auto justify-center lg:justify-start">
           <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-[0_0_20px_rgba(255,255,255,0.3)] shrink-0">
              <Wallet size={28} />
           </div>
           <div className="text-left">
              <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest mb-1">Total Saldo Poin</p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-3xl md:text-4xl font-black text-white drop-shadow-md tracking-tight">{totalPoints.toLocaleString()}</p>
                <span className="text-sm font-bold text-amber-200">PTS</span>
              </div>
           </div>
        </div>
      </header>

      {/* TABS: Modern Pill Switch */}
      <div className="flex justify-center relative z-20 -mt-14">
        <div className="bg-white/80 backdrop-blur-xl p-2 rounded-2xl shadow-xl shadow-orange-500/10 border border-orange-100 flex gap-2 w-max">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'catalog' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-100' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 scale-95'}`}
          >
            <Gift size={16} /> Katalog Bisnis
          </button>
          <button 
            onClick={() => setActiveTab('my-perks')}
            className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'my-perks' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-100' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 scale-95'}`}
          >
            <Shield size={16} /> Benefit Saya
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="pt-4">
        {activeTab === 'catalog' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {affiliateRewards.length > 0 ? affiliateRewards.map((v) => {
              const canAfford = totalPoints >= v.cost;
              const isClaiming = claimingId === v.id;
              
              return (
                <div key={v.id} className="group bg-white rounded-[2.5rem] p-3 md:p-4 border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] transition-all duration-500 flex flex-col sm:flex-row gap-4 relative overflow-hidden">
                  
                  {/* Image Container with Inner Padding Style */}
                  <div className="relative w-full sm:w-48 h-56 sm:h-auto rounded-[2rem] overflow-hidden shrink-0 bg-slate-50">
                    <img src={getVoucherImageUrl(v.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={v.title} />
                    {/* Overlay Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-md text-orange-500 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        {v.voucher_type || 'ELITE VOUCHER'}
                      </span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 py-4 sm:py-6 px-2 sm:px-4 flex flex-col justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug mb-3 group-hover:text-orange-500 transition-colors">{v.title}</h3>
                      <div className="inline-flex items-center gap-2 bg-orange-50/80 rounded-xl px-3 py-2 border border-orange-100/50">
                        <div className="bg-orange-500 p-1.5 rounded-lg text-white shadow-sm">
                          <Zap size={12} />
                        </div>
                        <span className="text-sm font-black text-orange-600">{v.cost.toLocaleString()} PTS</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleClaim(v)} 
                      disabled={!canAfford || isClaiming}
                      className={`w-full py-4 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2
                        ${canAfford && !isClaiming
                          ? 'bg-slate-900 text-white hover:bg-orange-500 shadow-xl shadow-slate-200 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95' 
                          : 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100'
                        }`}
                    >
                      {isClaiming ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses...</>
                      ) : !canAfford ? (
                        <><AlertCircle size={16} /> Poin Tidak Cukup</>
                      ) : (
                        <>Tukar Sekarang <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-orange-200 shadow-sm">
                <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-orange-300 mb-6">
                  <Briefcase size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Belum Ada Penawaran</h3>
                <p className="text-slate-400 text-sm max-w-sm">Penawaran elite sedang dipersiapkan oleh tim kami. Silakan kembali lagi nanti untuk benefit spesial.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVouchers.length > 0 ? myVouchers.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col gap-6 group hover:border-orange-300 transition-all shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-md mb-2 inline-block">Aktif</span>
                    <h4 className="font-black text-slate-800 text-lg leading-tight group-hover:text-orange-500 transition-colors">{v.title}</h4>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border border-dashed border-orange-200 shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                  <Ticket size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Benefit Kosong</h3>
                <p className="text-slate-400 text-sm max-w-sm">Anda belum menukarkan poin dengan benefit apapun. Cek katalog bisnis sekarang!</p>
                <button onClick={() => setActiveTab('catalog')} className="mt-6 px-6 py-2.5 bg-orange-50 text-orange-500 font-bold rounded-xl text-xs hover:bg-orange-100 transition-colors">
                  Lihat Katalog
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default AffiliateClaimReward;