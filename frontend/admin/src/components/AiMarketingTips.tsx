import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Lightbulb, Target, TrendingUp, Bot, AlertTriangle, Gift, Tag } from 'lucide-react';

// Menangkap data asli dari Dashboard
interface AiMarketingTipsProps {
  users?: any[];
  vouchers?: any[];
}

export default function AiMarketingTips({ users = [], vouchers = [] }: AiMarketingTipsProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [dynamicTips, setDynamicTips] = useState<any[]>([]);

  // ENGINE AI (Sistem Pakar) - Menganalisis data asli
  const analyzeData = useCallback(() => {
    setIsThinking(true);
    
    // Simulasi loading analisis data sebentar (0.8 detik) agar ada efek AI memproses
    setTimeout(() => {
      const generatedTips = [];
      const today = new Date();

      // 1. REKOMENDASI PEMBUATAN VOUCHER: Kekurangan Tipe "Barang Gratis"
      const hasFreeItem = vouchers.some(v => String(v.voucher_type).toUpperCase() === 'FREE_ITEM');
      if (!hasFreeItem && vouchers.length > 0) {
        generatedTips.push({
          title: "Saran Variasi Katalog",
          content: `Katalog Anda saat ini didominasi oleh voucher Diskon. Secara psikologis, pelanggan lebih menyukai hadiah fisik. Coba buat 1 voucher tipe "Barang Gratis" (Misal: Gratis Kopi) untuk meningkatkan antusiasme penukaran poin.`,
          icon: <Gift className="w-4 h-4 text-purple-600" />,
          bgIcon: "bg-purple-50 border-purple-100",
          borderColor: "border-purple-100"
        });
      }

      // 2. REKOMENDASI PEMBUATAN VOUCHER: Memanjakan User Pemula (Poin Rendah)
      const lowPointUsers = users.filter(u => Number(u.points) > 0 && Number(u.points) < 300);
      if (lowPointUsers.length > 0 && users.length > 0) {
        const lowPointPercentage = Math.round((lowPointUsers.length / users.length) * 100);
        if (lowPointPercentage >= 30) {
          generatedTips.push({
            title: "Ide Promo User Baru",
            content: `${lowPointPercentage}% pelanggan Anda memiliki poin rendah (< 300 PTS). Rilis voucher "Diskon 5%" dengan harga sangat murah (Misal: 100 PTS) agar mereka bisa cepat merasakan reward dan makin loyal bertransaksi.`,
            icon: <Tag className="w-4 h-4 text-pink-600" />,
            bgIcon: "bg-pink-50 border-pink-100",
            borderColor: "border-pink-100"
          });
        }
      }

      // 3. ANALISIS VOUCHER: Stok Menumpuk (Dead Stock)
      const overstockedVouchers = vouchers.filter(v => Number(v.stock) >= 50);
      if (overstockedVouchers.length > 0) {
        const topDeadStock = overstockedVouchers.sort((a, b) => b.stock - a.stock)[0];
        generatedTips.push({
          title: "Peringatan Stok Menumpuk",
          content: `Voucher "${topDeadStock.title}" kurang diminati (tersisa ${topDeadStock.stock} unit). Kami sarankan buat promo "Flash Sale" atau turunkan harga poinnya sebesar 20% agar segera habis.`,
          icon: <Target className="w-4 h-4 text-rose-600" />,
          bgIcon: "bg-rose-50 border-rose-100",
          borderColor: "border-rose-100"
        });
      }

      // 4. ANALISIS VOUCHER: Stok Hampir Habis (Best Seller)
      const lowStockVouchers = vouchers.filter(v => Number(v.stock) > 0 && Number(v.stock) <= 5);
      if (lowStockVouchers.length > 0) {
        generatedTips.push({
          title: "Peluang Best Seller",
          content: `Voucher "${lowStockVouchers[0].title}" sangat diminati dan hampir habis (sisa ${lowStockVouchers[0].stock} unit). Pertimbangkan untuk menambah stok atau menaikkan sedikit harga poinnya.`,
          icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
          bgIcon: "bg-emerald-50 border-emerald-100",
          borderColor: "border-emerald-100"
        });
      }

      // 5. ANALISIS USER: Penumpuk Poin (Sultan)
      const richUsers = users.filter(u => Number(u.points) >= 2000);
      if (richUsers.length > 0) {
        generatedTips.push({
          title: "Tarik Perhatian 'Sultan'",
          content: `Ada ${richUsers.length} pelanggan yang menumpuk poin lebih dari 2.000 PTS tapi belum menukarkannya. Rilis voucher eksklusif bernilai tinggi (seperti "Potongan Rp 50.000") khusus untuk menyerap poin mereka.`,
          icon: <Sparkles className="w-4 h-4 text-amber-600" />,
          bgIcon: "bg-amber-50 border-amber-100",
          borderColor: "border-amber-100"
        });
      }

      // 6. ANALISIS USER: User Pasif (Churn Risk)
      const passiveUsers = users.filter(u => {
        if (!u.lastCheckIn) return true;
        const lastCheckInDate = new Date(u.lastCheckIn);
        const diffTime = Math.abs(today.getTime() - lastCheckInDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 7; 
      });

      if (passiveUsers.length > 0 && users.length > 0) {
        const passivePercentage = Math.round((passiveUsers.length / users.length) * 100);
        if (passivePercentage >= 20) {
          generatedTips.push({
            title: "Peringatan Retensi Menurun",
            content: `${passivePercentage}% (${passiveUsers.length}) pelanggan Anda tidak check-in selama seminggu. Kami sarankan buat "Misi Spesial Weekend" dengan reward 2x lipat untuk memancing mereka kembali.`,
            icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
            bgIcon: "bg-orange-50 border-orange-100",
            borderColor: "border-orange-100"
          });
        }
      }

      // 7. DEFAULT FALLBACK
      if (generatedTips.length === 0) {
        generatedTips.push({
          title: "Sistem Terpantau Sehat",
          content: "Metrik gamifikasi Anda berjalan optimal. Pertahankan variasi katalog voucher saat ini agar antusiasme pelanggan tetap terjaga.",
          icon: <Lightbulb className="w-4 h-4 text-blue-600" />,
          bgIcon: "bg-blue-50 border-blue-100",
          borderColor: "border-blue-100"
        });
      }

      setDynamicTips(generatedTips);
      setIsThinking(false);
    }, 800);
  }, [users, vouchers]);

  useEffect(() => {
    analyzeData();
  }, [analyzeData]);

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-orange-100 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
      {/* Background Glow Effect - Disesuaikan untuk Light Mode */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/10 blur-[50px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/10 blur-[50px] rounded-full pointer-events-none"></div>

      {/* Header AI */}
      <div className="relative flex items-center justify-between mb-6 border-b border-orange-50 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 shadow-sm">
            <Bot className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="text-slate-800 font-black uppercase tracking-widest text-xs">AI Marketing Toolkit</h3>
            <p className="text-[9px] text-slate-500 font-medium">Rekomendasi Strategi Berbasis Data</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          {dynamicTips.length} Insights
        </div>
      </div>

      {/* Container Tips List Berjejer ke Bawah */}
      <div className="relative flex-1 overflow-y-auto pr-1 space-y-4 max-h-[480px] scrollbar-thin scrollbar-thumb-orange-100 scrollbar-track-transparent">
        {isThinking ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <Sparkles className="w-3 h-3 text-orange-500 absolute animate-pulse" />
            </div>
            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-widest animate-pulse">
              Memproses Metrik Toko...
            </p>
          </div>
        ) : (
          dynamicTips.map((tip, index) => (
            <div 
              key={index} 
              className={`p-4 bg-white rounded-2xl border ${tip.borderColor} transition-all hover:bg-orange-50/50 shadow-sm hover:shadow animate-in fade-in slide-in-from-bottom-3 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${tip.bgIcon}`}>
                  {tip.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{tip.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {tip.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}