import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Gift, Clock, Zap, ArrowRight, Ticket, AlertCircle, AlertTriangle } from 'lucide-react';

const ClaimReward: React.FC = () => {
  const { user, vouchers, myVouchers, claimVoucher, isLoading, addNotification, refreshData } = useApp();
  const totalPoints = user?.points || 0;

  const [activeTab, setActiveTab] = useState<'shop' | 'mine'>('shop');
  const [claimingVoucher, setClaimingVoucher] = useState<string | null>(null);

  // State fitur "Tukar di Kasir"
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [revealedCodes, setRevealedCodes] = useState<Record<string, boolean>>({});

  const handleClaim = async (v: any) => {
    setClaimingVoucher(v.id);
    const success = await claimVoucher(v);
    setClaimingVoucher(success ? 'success' : null);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedVoucher) return;
    setIsRedeeming(true);

    try {
      // TODO: Endpoint backend belum tersedia untuk fitur redeem voucher di kasir
      console.warn('TODO: Endpoint backend untuk redeemVoucherCashier belum tersedia');
      const res = { success: true, message: 'Voucher berhasil digunakan (mode placeholder)' };
      
      if (res && res.success) {
        setRevealedCodes((prev) => ({ ...prev, [String(selectedVoucher.id)]: true }));
        addNotification('Voucher berhasil digunakan di kasir!', 'success');
        
        // @ts-ignore
        const confettiFn = (await import('canvas-confetti')).default;
        confettiFn({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#FFD700', '#FFFFFF'],
        });

        if (refreshData) {
          await refreshData();
        }
      } else {
        addNotification(String(res?.message || 'Gagal menggunakan voucher'), 'error');
      }
    } catch (err: any) {
      addNotification(err.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setIsRedeeming(false);
      setSelectedVoucher(null);
    }
  };

  // FUNGSI BARU: Untuk memunculkan badge dinamis sesuai tipe voucher dari Admin
  const renderVoucherBadge = (v: any) => {
    if (!v.voucher_type) return null; // Jika data lama
    
    switch (v.voucher_type) {
      case 'PERCENTAGE':
        return (
          <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            Diskon {v.voucher_value}%
          </span>
        );
      case 'FIXED':
        return (
          <span className="bg-blue-100 text-blue-700 border border-blue-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            Potongan Rp {Number(v.voucher_value).toLocaleString()}
          </span>
        );
      case 'FREE_ITEM':
        return (
          <span className="bg-purple-100 text-purple-700 border border-purple-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            Gratis Item
          </span>
        );
      case 'CUSTOM':
        return (
          <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
            Promo Spesial
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Header */}
      <header className="bg-white p-6 rounded-[2rem] border border-orange-50 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Gift size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">Ngolabify Catalog</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tukarkan poin jerih payahmu</p>
          </div>
        </div>
        <div className="bg-white border border-orange-100 px-6 py-4 rounded-[1.5rem] text-[#0F172A] flex items-center gap-4 shadow-xl">
          <div className="text-right">
            <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Total Point Balance</p>
            <p className="text-xl font-black text-[#0F172A]">{totalPoints?.toLocaleString() ?? 0} <span className="text-[10px] text-orange-500 italic">PTS</span></p>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
            <Zap size={20} className="text-orange-500 fill-orange-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-orange-50 p-1.5 rounded-xl w-fit mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('shop')}
          className={`px-8 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'bg-white text-orange-600 shadow-md scale-105' : 'text-slate-400 hover:text-orange-600'}`}
        >
          Katalog ({vouchers.length})
        </button>
        <button 
          onClick={() => setActiveTab('mine')}
          className={`px-8 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'mine' ? 'bg-white text-orange-600 shadow-md scale-105' : 'text-slate-400 hover:text-orange-600'}`}
        >
          Koleksi ({myVouchers.length})
        </button>
      </div>

      {activeTab === 'shop' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((v, idx) => {
            const canAfford = totalPoints >= v.cost;
            return (
              <div key={`${v.id}-${idx}`} className="voucher-container group bg-white border border-orange-100 rounded-[2rem] overflow-hidden flex flex-col hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-40 overflow-hidden">
                  <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-5 right-5 flex justify-between items-end">
                    {/* BAGIAN BADGE DINAMIS DIMUNCULKAN DI SINI */}
                    {renderVoucherBadge(v) || <span className="bg-orange-600 text-white text-[7px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">Limited Offer</span>}
                    
                    <div className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 text-white font-black text-xs">
                      {v.cost?.toLocaleString() ?? 0} <span className="text-[9px] opacity-60">PTS</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900 mb-1 leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">{v.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={10} /> Berlaku S/D {v.expiry}
                    </div>
                  </div>
                  {canAfford ? (
                    <button onClick={() => handleClaim(v)} className="w-full py-3 bg-orange-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100">
                      {claimingVoucher === v.id ? 'Memproses...' : 'Tukar Sekarang'} <ArrowRight size={12} />
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-orange-50 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-orange-100">
                      <AlertCircle size={12} /> Poin Tidak Cukup
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {myVouchers.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex gap-4 items-start shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-500" size={20} />
              </div>
              <div>
                <h4 className="text-red-700 font-black text-xs uppercase tracking-widest mb-1">Peringatan Penting!</h4>
                <p className="text-red-600/80 text-[10px] font-bold leading-relaxed">
                  Jangan menekan tombol "Gunakan" jika kamu belum berada di depan kasir. Voucher yang sudah digunakan tidak dapat dikembalikan!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myVouchers.length > 0 ? myVouchers.map((v, i) => {
              const isUsed = v.status === 'USED' || v.status === 'REDEEMED' || revealedCodes[String(v.id)];
              const displayCode = isUsed ? v.code : (v.code ? String(v.code).substring(0, 6) + '***' : '******');
              return (
                <div key={v.id || i} className={`bg-white p-4 rounded-[1.8rem] border ${isUsed ? 'border-slate-100 opacity-70' : 'border-orange-100'} flex items-center gap-4`}>
                  <div className={`w-20 h-20 rounded-xl overflow-hidden shadow-inner shrink-0 ${isUsed ? 'grayscale' : ''}`}>
                    <img src={v.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black mb-1 text-sm truncate">{v.title}</h4>
                    <div className="flex flex-col gap-1 items-start">
                      {/* BADGE DI TAB KOLEKSI */}
                      {renderVoucherBadge(v)}
                      <span className="px-2 py-0.5 bg-white border border-orange-200 rounded-lg font-mono text-[10px] font-black text-orange-600 mt-1">{displayCode}</span>
                    </div>
                  </div>
                  <button onClick={() => !isUsed && setSelectedVoucher(v)} disabled={isUsed} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${isUsed ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md active:scale-95 transition-all'}`}>
                    {isUsed ? 'Terpakai' : 'Gunakan'}
                  </button>
                </div>
              );
            }) : null}
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kasir */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-orange-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="font-black text-xl text-center text-slate-900 mb-2">Gunakan Voucher?</h3>
            <p className="text-xs text-center text-slate-500 mb-6 font-medium leading-relaxed">
              Pastikan Kasir sudah siap memindai atau mencatat kodemu. <span className="text-red-500 font-bold">Tindakan ini akan mengaktifkan voucher dan tidak bisa dibatalkan.</span>
            </p>
            
            {/* Tampilkan Instruksi Khusus jika ada */}
            {selectedVoucher.voucher_type === 'CUSTOM' && selectedVoucher.cashier_instruction && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-6">
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Instruksi Kasir:</p>
                <p className="text-xs font-medium text-slate-700">{selectedVoucher.cashier_instruction}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedVoucher(null)} 
                disabled={isRedeeming}
                className="flex-1 py-3.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmRedeem} 
                disabled={isRedeeming} 
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
              >
                {isRedeeming ? (
                  <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Memproses</>
                ) : (
                  'Ya, Gunakan'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimReward;