
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Gift, Wallet, Zap, ArrowRight, CheckCircle2, 
  Ticket, AlertCircle, Briefcase, Award, 
  TrendingUp, Star, Shield, Gem, Percent
} from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 pb-32">
      <header className="bg-white p-6 md:p-10 rounded-[2.5rem] text-[#0F172A] border border-orange-100 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-orange-600">
          <Award size={180} />
        </div>
        
        <div className="relative z-10 space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
            <Gem size={12} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Partner Privilege</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
            Elite <span className="text-orange-600">Rewards</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-md text-xs leading-relaxed">
            Gunakan Profit Poin untuk benefit gaya hidup eksklusif.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-inner">
           <div className="text-right">
              <p className="text-[8px] font-black text-orange-700 uppercase tracking-widest mb-0.5">Total Point Balance</p>
              <p className="text-2xl font-black text-[#0F172A]">{totalPoints.toLocaleString()} <span className="text-[10px] text-orange-600">PTS</span></p>
           </div>
           <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
              <Wallet size={20} />
           </div>
        </div>
      </header>

      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-orange-50 flex gap-1.5">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-8 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'catalog' ? 'bg-orange-500 text-white shadow-xl shadow-orange-200' : 'text-slate-400 hover:bg-orange-50'}`}
          >
            Katalog Bisnis
          </button>
          <button 
            onClick={() => setActiveTab('my-perks')}
            className={`px-8 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'my-perks' ? 'bg-orange-500 text-white shadow-xl shadow-orange-200' : 'text-slate-400 hover:bg-orange-50'}`}
          >
            Benefit Saya
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {affiliateRewards.length > 0 ? affiliateRewards.map((v) => {
            const canAfford = totalPoints >= v.cost;
            return (
              <div key={v.id} className="group bg-white rounded-[2.5rem] border border-orange-50 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="md:w-48 h-48 md:h-auto relative overflow-hidden shrink-0">
                  <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms]" alt="" />
                  <div className="absolute top-3 left-3">
<span className="bg-white/20 backdrop-blur-md text-white text-[7px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-white/20">
                        {v.voucher_type || 'VOUCHER'}
                      </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <h3 className="text-lg font-black text-[#0F172A] tracking-tight leading-none italic">{v.title}</h3>
                  <button onClick={() => handleClaim(v)} className="w-full py-3 bg-orange-600 text-white rounded-xl text-[8px] font-black uppercase shadow-lg active:scale-95 shadow-orange-100">Tukar Sekarang</button>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase italic border-4 border-dashed border-orange-50 rounded-[2.5rem]">Belum ada penawaran elite.</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myVouchers.length > 0 ? myVouchers.map((v, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-orange-50 flex items-center gap-6 group">
              <h4 className="font-black text-[#0F172A] text-base">{v.title}</h4>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase italic border-4 border-dashed border-orange-50 rounded-[2.5rem]">Belum ada benefit aktif.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AffiliateClaimReward;
