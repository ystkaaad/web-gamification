import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { 
  Gift, Clock, Zap, ArrowRight, Ticket, 
  AlertCircle, CalendarDays, 
  Crown, Sparkles, Star, Search, Percent
} from 'lucide-react';

const ClaimReward: React.FC = () => {
  const { user, vouchers, myVouchers, claimVoucher, isLoading } = useApp();
  const totalPoints = user?.points || 0;

  const [activeTab, setActiveTab] = useState<'shop' | 'mine'>('shop');
  const [claimingVoucher, setClaimingVoucher] = useState<string | null>(null);

  const handleClaim = async (v: any) => {
    setClaimingVoucher(v.id);
    const success = await claimVoucher(v);
    setClaimingVoucher(success ? 'success' : null);
  };

  // FUNGSI BARU: Untuk memunculkan badge dinamis sesuai tipe voucher dari Admin
  const renderVoucherBadge = (v: any) => {
    if (!v.voucher_type) return null;
    
    switch (v.voucher_type) {
      case 'PERCENTAGE':
        return (
          <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1 w-fit">
            <Percent size={12}/> Diskon {v.voucher_value}%
          </span>
        );
      case 'FIXED':
        return (
          <span className="bg-sky-50 text-sky-600 border border-sky-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm w-fit">
            Potongan Rp {Number(v.voucher_value).toLocaleString()}
          </span>
        );
      case 'FREE_ITEM':
        return (
          <span className="bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm w-fit">
            Gratis Item
          </span>
        );
      case 'CUSTOM':
        return (
          <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1 w-fit">
            <Sparkles size={12}/> Promo Spesial
          </span>
        );
      default:
        return null;
    }
  };

  // Helper: Get status badge color and text
  const getVoucherStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'bg-green-50', text: 'text-green-700', label: 'Aktif' };
      case 'USED':
        return { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Sudah Digunakan' };
      case 'EXPIRED':
        return { bg: 'bg-red-50', text: 'text-red-700', label: 'Kadaluarsa' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Tidak Aktif' };
    }
  };

  // Helper: Get status description text
  const getVoucherStatusDesc = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Gunakan voucher ini saat transaksi di outlet Ngolab.';
      case 'USED':
        return 'Voucher telah digunakan.';
      case 'EXPIRED':
        return 'Voucher telah kadaluarsa.';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-orange-500 font-bold animate-pulse text-sm">Memuat Katalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans">
      
      {/* 1. HERO BANNER (Modern Startup Style) */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-orange-300 pt-10 pb-28 px-4 md:px-8 relative overflow-hidden rounded-b-[3rem] shadow-sm">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-600 opacity-20 rounded-full blur-2xl mix-blend-multiply"></div>
        
        <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          
          {/* Teks Hero */}
          <div className="text-white space-y-5 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-sm mx-auto md:mx-0">
              <Crown size={14} className="text-yellow-300 fill-yellow-300" /> Ngolabify Rewards
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Katalog Hadiah
            </h1>
            <p className="text-orange-50 text-sm md:text-base font-medium leading-relaxed max-w-md mx-auto md:mx-0">
              Tukarkan poin jerih payahmu dengan berbagai reward eksklusif Ngolabify. Semakin banyak poin, semakin premium hadiahmu!
            </p>
            {/* Info Card Kecil di Hero */}
            <div className="hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 w-fit">
              <div className="bg-white/20 p-2 rounded-xl"><Star size={16} className="text-yellow-300 fill-yellow-300" /></div>
              <p className="text-xs font-semibold text-white">Kumpulkan lebih banyak poin untuk membuka reward VIP</p>
            </div>
          </div>

          {/* Ilustrasi Kanan (Composite Icon) */}
          <div className="hidden md:flex relative w-64 h-64 items-center justify-center">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full animate-pulse border border-white/30"></div>
            <div className="relative bg-gradient-to-b from-white to-orange-50 w-40 h-40 rounded-3xl flex items-center justify-center shadow-2xl rotate-12 transform hover:rotate-0 transition-transform duration-500 border-4 border-white/40">
              <Gift size={64} className="text-orange-500 drop-shadow-md" strokeWidth={1.5} />
            </div>
            <Sparkles className="absolute top-10 right-10 text-yellow-300 w-10 h-10 animate-bounce" />
            <Ticket className="absolute bottom-12 left-6 text-white w-12 h-12 -rotate-12 opacity-80" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative z-20">
        
        {/* 2. FLOATING POINT CARD (Premium Info Box) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-orange-100/60 border border-slate-50 -mt-16 mx-auto max-w-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center border border-orange-200 shadow-inner shrink-0">
              <Zap className="text-orange-500 fill-orange-500 w-8 h-8 md:w-10 md:h-10 animate-pulse drop-shadow-sm" />
            </div>
            <div>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Saldo Poin</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{totalPoints?.toLocaleString() ?? 0}</span>
                <span className="text-sm md:text-base font-bold text-orange-500">PTS</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-px h-px md:h-16 bg-slate-100 hidden md:block"></div>
          
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto justify-between md:justify-center">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Member</p>
              <p className="text-sm font-black text-slate-700">Reguler</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kupon Dimiliki</p>
              <p className="text-sm font-black text-orange-600">{myVouchers.length} Kupon Aktif</p>
            </div>
          </div>
        </div>

        {/* 3. SEGMENTED CONTROL TAB (Modern UI) */}
        <div className="flex justify-center mt-12 mb-8">
          <div className="bg-slate-200/60 backdrop-blur-md p-1.5 rounded-[1.5rem] flex gap-1 shadow-inner border border-slate-200 w-full sm:w-fit">
            <button 
              onClick={() => setActiveTab('shop')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'shop' 
                  ? 'bg-white text-orange-600 shadow-sm shadow-slate-200/50 scale-100' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Ticket size={16} className={activeTab === 'shop' ? 'text-orange-500' : 'text-slate-400'} /> Katalog Promo
            </button>
            <button 
              onClick={() => setActiveTab('mine')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === 'mine' 
                  ? 'bg-white text-orange-600 shadow-sm shadow-slate-200/50 scale-100' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <Gift size={16} className={activeTab === 'mine' ? 'text-orange-500' : 'text-slate-400'} /> Koleksiku
              {myVouchers.length > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'mine' ? 'bg-orange-100 text-orange-600' : 'bg-slate-300 text-white'}`}>{myVouchers.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* 4. KONTEN UTAMA */}
        {activeTab === 'shop' ? (
          
          /* LAYOUT KATALOG VOUCHER */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {vouchers.map((v, idx) => {
              const canAfford = totalPoints >= v.cost;
              return (
                <div key={`${v.id}-${idx}`} className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden flex flex-col shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 hover:-translate-y-2">
                  
                  {/* Dominan Image Area */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" alt={v.title} />
                    
                    {/* Dark Gradient Overlay for Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>
                    
                    {/* Floating Point Cost (Premium Look) */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg border border-white flex items-center gap-1.5">
                      <Zap size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
                      <span className="font-black text-sm text-slate-800">{v.cost?.toLocaleString() ?? 0}</span>
                      <span className="text-[9px] font-bold text-slate-400">PTS</span>
                    </div>

                    {/* Badge / Label Area di bawah gambar */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end">
                      {renderVoucherBadge(v) || (
                        <span className="bg-gradient-to-r from-orange-500 to-orange-400 text-white border border-orange-300 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                          Exclusive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Konten Voucher */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-5 bg-white">
                    <div className="space-y-3">
                      <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 min-h-[3rem]">{v.title}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                        <CalendarDays size={14} className="text-orange-400" /> Berlaku s/d {v.expiry}
                      </div>
                    </div>

                    {/* Tombol CTA Utama */}
                    {canAfford ? (
                      <button 
                        onClick={() => handleClaim(v)} 
                        disabled={claimingVoucher === v.id} 
                        className="w-full py-4 bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                      >
                        {claimingVoucher === v.id ? (
                          <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Proses...</>
                        ) : (
                          <>Tukar Sekarang <ArrowRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-4 bg-slate-50 text-slate-400 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-100">
                        <AlertCircle size={14} /> Poin Tidak Cukup
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty State jika Katalog Kosong dari API */}
            {vouchers.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                <Search className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">Katalog Sedang Kosong</h3>
                <p className="text-slate-500">Reward baru sedang disiapkan. Cek lagi nanti ya!</p>
              </div>
            )}
          </div>
        ) : (
          
          /* LAYOUT KOLEKSI VOUCHER (Digital Wallet Ticket) */
          <div className="space-y-6">
            
{/* Grid Digital Ticket */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {myVouchers.length > 0 ? myVouchers.map((v, i) => {
                const statusInfo = getVoucherStatusBadge(v.status);
                const statusDesc = getVoucherStatusDesc(v.status);
                
                return (
                  <div key={v.id || i} className={`bg-white rounded-[2rem] border ${v.status !== 'ACTIVE' ? 'border-slate-200 opacity-70' : 'border-slate-100'} shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row overflow-hidden relative group`}>
                    
                    {/* Bagian Kiri (Gambar) */}
                    <div className={`w-full sm:w-48 h-40 sm:h-auto relative shrink-0 overflow-hidden ${v.status !== 'ACTIVE' ? 'grayscale' : ''}`}>
                      <img src={v.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                      <div className="absolute inset-0 bg-black/5"></div>
                    </div>

                    {/* Garis Potongan Tiket (Perforated Line Divider) */}
                    <div className={`hidden sm:flex flex-col items-center justify-center relative w-8 z-10 ${v.status !== 'ACTIVE' ? 'opacity-50' : ''}`}>
                       <div className="absolute top-0 -mt-3 w-6 h-6 bg-[#F8FAFC] rounded-full border-b border-slate-100 shadow-inner"></div>
                       <div className="h-full border-l-[3px] border-dashed border-slate-200 w-px"></div>
                       <div className="absolute bottom-0 -mb-3 w-6 h-6 bg-[#F8FAFC] rounded-full border-t border-slate-100 shadow-inner"></div>
                    </div>

                    {/* Bagian Kanan (Info & Aksi) */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between relative bg-white">
                      
                      {/* Dekorasi potong untuk tampilan mobile */}
                      <div className="sm:hidden absolute top-0 inset-x-0 h-4 overflow-hidden -mt-2 flex justify-between px-6">
                         <div className="w-4 h-4 bg-[#F8FAFC] rounded-full shadow-inner"></div>
                         <div className="w-4 h-4 bg-[#F8FAFC] rounded-full shadow-inner"></div>
                      </div>

                      <div className="space-y-2 mb-4 mt-2 sm:mt-0">
                        <div className="flex justify-between items-start">
                          {renderVoucherBadge(v)}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight line-clamp-2">{v.title}</h4>
                      </div>

                      <div className="flex items-end justify-between mt-auto pt-4 border-t border-slate-100/80">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Kode Rahasia</span>
                          <span className={`font-mono text-sm sm:text-base font-black px-3.5 py-1.5 rounded-xl border tracking-[0.2em] shadow-inner ${v.status !== 'ACTIVE' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                            {v.code ? String(v.code).substring(0, 6) + '***' : '******'}
                          </span>
                        </div>
                        
                        <button 
                          disabled
                          className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all transform active:scale-95 shrink-0 ${
                            v.status === 'ACTIVE'
                              ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {v.status === 'ACTIVE' ? 'Tersimpan' : v.status === 'EXPIRED' ? 'Kadaluarsa' : 'Sudah Digunakan'}
                        </button>
                      </div>

                      {/* Status Description */}
                      <p className={`text-[10px] mt-3 ${v.status === 'ACTIVE' ? 'text-slate-500' : 'text-slate-400'}`}>
                        {statusDesc}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                /* EMPTY STATE MODERN DENGAN CTA */
                <div className="col-span-full py-20 px-4 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-slate-200 text-center shadow-sm">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                    <Ticket className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">Belum ada voucher tersimpan</h3>
                  <p className="text-slate-500 font-medium max-w-sm mb-8 text-sm leading-relaxed">
                    Tukarkan poinmu pada tab Katalog Promo untuk mendapatkan reward eksklusif.
                  </p>
                  <button 
                    onClick={() => setActiveTab('shop')} 
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-xl shadow-orange-200 transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <Search size={16} /> Lihat Katalog Promo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimReward;