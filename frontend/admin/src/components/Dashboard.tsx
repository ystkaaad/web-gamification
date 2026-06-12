/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  Ticket, 
  ArrowUpRight,
  ArrowDownRight,
  Gamepad2 // Ikon baru untuk melambangkan Interaksi Game/Gamifikasi
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { dbService } from '../services/dbService';

// ==========================================
// 1. SINKRONISASI: IMPORT KOMPONEN AI TOOLKIT
// ==========================================
import AiMarketingTips from '../components/AiMarketingTips';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    missions: 0,
    vouchers: 0,
    totalInteractions: 0 // Mengganti "points" menjadi "totalInteractions"
  });

  // =================================================================
  // 2. SINKRONISASI: STATE BARU UNTUK MENAMPUNG ARRAY DATA REAL SPREADSHEET
  // =================================================================
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [rawVouchers, setRawVouchers] = useState<any[]>([]);
  
  // STATE BARU: Untuk menyimpan data grafik Earn & Burn yang sudah dinamis
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Parallel fetching for better performance
        const [users, missions, vouchers, ledger, dashboardStats] = await Promise.all([
          dbService.getUsers(),
          dbService.getMissions(),
          dbService.getVouchers(),
          dbService.getPointLedger(),
          dbService.getStats()
        ]);
        
        // Menghitung Total Interaksi Game berdasarkan jumlah aktivitas di riwayat (ledger)
        const totalGamificationEvents = ledger ? ledger.length : 0;

        setStats({
          users: dashboardStats.totalUsers || (users ? users.length : 0),
          missions: dashboardStats.totalMissions || (missions ? missions.length : 0),
          vouchers: dashboardStats.totalVouchers || (vouchers ? vouchers.length : 0),
          totalInteractions: totalGamificationEvents
        });

        // ===================================================================
        // 3. SINKRONISASI: SET DATA ASLI AGAR BISA DIALIRKAN KE MASING-MASING VARIABEL AI
        // ===================================================================
        setRawUsers(users || []);
        setRawVouchers(vouchers || []);

        // ===================================================================
        // LOGIKA BARU: MENGHITUNG DATA GRAFIK 7 HARI TERAKHIR DARI LEDGER
        // ===================================================================
        if (ledger && Array.isArray(ledger)) {
          const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const last7Days: any[] = [];
          
          // Buat template 7 hari mundur dari hari ini
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
              name: namaHari[d.getDay()],
              dateStr: d.toISOString().split('T')[0], // Format YYYY-MM-DD
              earn: 0,
              spend: 0
            });
          }

          // Masukkan data transaksi riil ke template hari tersebut
          ledger.forEach((tx: any) => {
            if (!tx.createdAt) return;
            try {
              const txDate = new Date(tx.createdAt).toISOString().split('T')[0];
              const dayIndex = last7Days.findIndex(d => d.dateStr === txDate);
              
              if (dayIndex !== -1) {
                const points = Number(tx.pointsChange || tx.amount || tx.points) || 0;
                // Jika poin bertambah (Masuk), hitung sebagai aktivitas Earn (Klaim)
                if (points > 0) last7Days[dayIndex].earn += 1; 
                // Jika poin berkurang (Keluar), hitung sebagai aktivitas Spend (Tukar)
                if (points < 0) last7Days[dayIndex].spend += 1;
              }
            } catch (e) {
              // Abaikan jika format tanggal tidak valid
            }
          });

          setDynamicChartData(last7Days);
        }

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const kpis = [
    { label: 'Total Pengguna', value: stats.users, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100/50', trend: '+12%' },
    { label: 'Misi Aktif', value: stats.missions, icon: Target, color: 'text-amber-600', bg: 'bg-amber-100/50', trend: '+5%' },
    { label: 'Voucher Tersedia', value: stats.vouchers, icon: Ticket, color: 'text-rose-600', bg: 'bg-rose-100/50', trend: '-2%' },
    { label: 'Total Interaksi Game', value: stats.totalInteractions.toLocaleString('id-ID'), icon: Gamepad2, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+28%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="premium-card p-6 group hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpi.trend}
                {kpi.trend.startsWith('+') ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <h3 className="text-[var(--text-muted-premium)] text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</h3>
            <p className="text-3xl font-black text-[var(--text-premium)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 premium-card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black tracking-tight mb-1 text-[var(--text-premium)]">Siklus Gamifikasi (Earn & Burn)</h2>
              <p className="text-xs text-[var(--text-muted-premium)]">Aktivitas 7 Hari Terakhir: Mengumpulkan poin vs penukaran voucher</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Klaim Poin</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Tukar Voucher</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              {/* DI SINI chartData SUDAH DIGANTI MENJADI dynamicChartData */}
              <AreaChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A50" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF8A50" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFE9D1" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#A69085" 
                  fontSize={11} 
                  fontWeight="900"
                  axisLine={false}
                  tickLine={false}
                  dy={15}
                />
                <YAxis 
                  stroke="#A69085" 
                  fontSize={11} 
                  fontWeight="900"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === "spend") return [`${value} Aktivitas`, "Tukar Voucher"];
                    return [`${value} Aktivitas`, "Klaim Poin (Misi/Game)"];
                  }}
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #FFE9D1',
                    borderRadius: '20px',
                    fontSize: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earn" 
                  stroke="#FF8A50" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorEarn)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#3B82F6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSpend)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===================================================================
         * 4. SINKRONISASI: MENGGANTIKAN KOTAK TERBARU MENJADI DYNAMIC AI MARKETING TOOLKIT
         * =================================================================== */}
        <div className="lg:col-span-1">
          <AiMarketingTips users={rawUsers} vouchers={rawVouchers} />
        </div>
        
      </div>
    </div>
  );
}