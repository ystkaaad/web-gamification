
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Gift, Wallet, Clock, Ticket, CheckCircle, Search, Filter } from 'lucide-react';

const Marketplace: React.FC = () => {
  const { user, vouchers, myVouchers, claimVoucher, isLoading } = useApp();
  const totalPoints = user?.points || 0;

  const [activeTab, setActiveTab] = useState<'shop' | 'mine'>('shop');
  const [claimingVoucher, setClaimingVoucher] = useState<string | null>(null);

  const handleClaim = async (v: any) => {
    setClaimingVoucher(v.id);
    const success = await claimVoucher(v);
    setClaimingVoucher(success ? 'success' : null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketplace 🎁</h1>
          <p className="text-slate-500 font-medium text-xs">Tukarkan poin dengan keuntungan nyata.</p>
        </div>
        
        <div className="flex p-1 bg-white border border-slate-200 rounded-[1.2rem] shadow-sm min-w-[280px]">
          <button 
            onClick={() => setActiveTab('shop')}
            className={`flex-1 py-2 px-4 rounded-[0.8rem] font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'shop' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Search size={16} /> Belanja
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-2 px-4 rounded-[0.8rem] font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'mine' ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Ticket size={16} /> Koleksi Saya
            {myVouchers.length > 0 && (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${activeTab === 'mine' ? 'bg-white text-orange-600' : 'bg-orange-100 text-orange-600'}`}>
                {myVouchers.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* User Balance Card - Large Screens */}
      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center md:text-left">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Point Balance</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{totalPoints?.toLocaleString() ?? 0}</span>
              <span className="text-sm font-bold text-orange-600 uppercase">PTS</span>
            </div>
          </div>
        </div>
        <div className="h-px w-full md:w-px md:h-12 bg-slate-100"></div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-none mb-1">Tier: {user?.memberLevel}</p>
            <p className="text-[10px] text-slate-500">Hemat penukaran hingga 15%</p>
          </div>
          <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-orange-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {activeTab === 'shop' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vouchers.map((v, idx) => (
            <div key={`${v.id}-${idx}`} className="bg-white rounded-[1.8rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col group">
              <div className="h-40 relative overflow-hidden">
                <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={v.title} />
                <div className="absolute top-3 left-3 bg-orange-600 px-3 py-1.5 rounded-lg text-[10px] font-black text-white shadow-xl">
                  {v.cost?.toLocaleString() ?? 0} PTS
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">{v.title}</h3>
                <p className="text-[11px] text-slate-500 mb-5 line-clamp-2 leading-relaxed">Voucher berlaku di seluruh outlet. S&K berlaku.</p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    <Clock size={12} /> Berakhir {v.expiry}
                  </div>
                  <button 
                    disabled={claimingVoucher === v.id || totalPoints < v.cost}
                    onClick={() => handleClaim(v)}
                    className={`w-full py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      claimingVoucher === v.id ? 'bg-slate-100 text-slate-400' : 
                      totalPoints < v.cost ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' : 
                      'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-200'
                    }`}
                  >
                    {claimingVoucher === v.id ? (
                      <span className="animate-pulse">Memproses...</span>
                    ) : totalPoints < v.cost ? 'Poin Belum Cukup' : 'Tukar Sekarang'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {myVouchers.length > 0 ? (
            myVouchers.map((v, i) => (
              <div key={i} className="bg-white p-5 rounded-[1.8rem] border border-orange-100 flex items-center gap-6 shadow-sm hover:shadow-lg transition-all">
                <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-[1.2rem] overflow-hidden shadow-inner">
                  <img src={v.image} className="w-full h-full object-cover" alt={v.title} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-900 mb-1 truncate">{v.title}</h3>
                  <div className="inline-block px-2.5 py-1 bg-orange-50 rounded-lg text-[10px] font-black text-orange-600 mb-3 border border-orange-100">
                    {v.code}
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Exp: {v.expiry}</p>
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                  Pakai
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mb-5 shadow-sm">
                <Gift size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1.5">Belum Ada Voucher</h2>
              <p className="text-slate-500 font-medium text-xs mb-8 max-w-sm">Jajan dan selesaikan misi untuk tukar poin!</p>
              <button 
                onClick={() => setActiveTab('shop')}
                className="px-6 py-3.5 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-100 hover:scale-105 transition-transform"
              >
                Mulai Belanja
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success Modal Simulation */}
      {claimingVoucher === 'success' && (
        <div className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={56} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Transaksi Berhasil! 🎉</h2>
            <p className="text-slate-500 mb-10 font-medium">Voucher otomatis ditambahkan ke koleksi digital kamu. Gunakan di kasir saat pembayaran!</p>
            <button 
              onClick={() => setClaimingVoucher(null)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black shadow-xl"
            >
              Lihat Voucher Saya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
