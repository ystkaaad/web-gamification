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
import { apiService, unwrapData } from '../services/apiService';
import { Mission, PointLedger, User, Voucher } from '../types';
import { toast } from 'react-hot-toast';

// ==========================================
// 1. SINKRONISASI: IMPORT KOMPONEN AI TOOLKIT
// ==========================================
import AiMarketingTips from '../components/AiMarketingTips';

type UserRecord = Partial<User> & {
  userId?: string;
  phone?: string;
  isAffiliate?: boolean;
  createdAt?: string;
  memberLevel?: string;
  streakCount?: number;
  lastCheckIn?: string | null;
};

type MissionRecord = Partial<Mission> & {
  rewardPoints?: unknown;
  status?: string;
  configData?: unknown;
};

type VoucherRecord = Partial<Voucher> & {
  cost?: unknown;
  cost_points?: unknown;
  image?: string;
  is_approved?: boolean;
};

type PointLedgerRecord = Partial<PointLedger> & {
  userId?: string;
  user_id?: string;
  points?: unknown;
  pointsChange?: unknown;
  points_change?: unknown;
  description?: string;
  item?: string;
  source?: string;
  source_id?: string;
  source_type?: string;
  createdAt?: string;
};

const getString = (value: unknown, fallback = '') => {
  if (value === undefined || value === null) return fallback;
  return String(value);
};

const getNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value.replace(/[^0-9.-]/g, '')) || 0;
  return 0;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  return String(responseMessage || (error instanceof Error ? error.message : fallback));
};

const normalizeUser = (user: UserRecord, index: number): User => {
  const id = getString(user.id || user.userId, `user-${index}`);

  return {
    ...user,
    id,
    userId: getString(user.userId || id),
    name: getString(user.name || user.email || id),
    email: getString(user.email || ''),
    phone_number: getString(user.phone_number || user.phone || ''),
    is_affiliate: user.is_affiliate ?? Boolean(user.isAffiliate),
    created_at: getString(user.created_at || user.createdAt, new Date().toISOString()),
    points: getNumber(user.points),
    cashback: getNumber(user.cashback),
    level: getString(user.level || user.memberLevel || 'SILVER'),
    total_transaksi: getNumber(user.total_transaksi),
    network_volume: getNumber(user.network_volume),
    total_member: getNumber(user.total_member),
    referralCode: getString(user.referralCode || ''),
    current_streak: getNumber(user.current_streak ?? user.streakCount),
    max_streak: getNumber(user.max_streak),
    last_checkin_at: getString(user.last_checkin_at ?? user.lastCheckIn, ''),
  };
};

const normalizeMission = (mission: MissionRecord, index: number): Mission => {
  const configData =
    typeof mission.config_data === 'string'
      ? mission.config_data
      : typeof mission.configData === 'string'
        ? mission.configData
        : JSON.stringify(mission.config_data ?? mission.configData ?? {});

  return {
    id: getString(mission.id, `mission-${index}`),
    title: getString(mission.title || ''),
    description: getString(mission.description || ''),
    reward_points: getNumber(mission.reward_points ?? mission.rewardPoints),
    is_active:
      mission.is_active === true ||
      String(mission.is_active) === 'true' ||
      mission.status === 'active',
    config_data: configData,
  };
};

const normalizeVoucher = (voucher: VoucherRecord, index: number): Voucher => {
  const status = getString(voucher.status || (voucher.is_approved ? 'APPROVED' : 'PENDING')).toUpperCase();
  const normalizedStatus = status === 'APPROVED' ? 'APPROVED' : status === 'DRAFT' ? 'DRAFT' : 'PENDING';

  return {
    id: getString(voucher.id, `voucher-${index}`),
    title: getString(voucher.title || ''),
    description: getString(voucher.description || ''),
    points_cost: getNumber(voucher.points_cost ?? voucher.cost_points ?? voucher.cost),
    stock: getNumber(voucher.stock),
    expiry_days: getNumber(voucher.expiry_days),
    image_url: getString(voucher.image_url || voucher.image || ''),
    is_approved: voucher.is_approved === true || normalizedStatus === 'APPROVED',
    status: normalizedStatus,
    voucher_type: voucher.voucher_type,
    voucher_value: voucher.voucher_value,
    max_discount: voucher.max_discount,
    min_purchase: voucher.min_purchase,
    cashier_instruction: voucher.cashier_instruction,
  };
};

const normalizePointLedger = (ledger: PointLedgerRecord, index: number): PointLedger => {
  const amount = getNumber(ledger.amount ?? ledger.points ?? ledger.pointsChange ?? ledger.points_change);
  const type = getString(ledger.type, amount >= 0 ? 'EARN' : 'REDEEM').toUpperCase();
  const normalizedType = type === 'REDEEM' ? 'REDEEM' : type === 'ADJUSTMENT' ? 'ADJUSTMENT' : 'EARN';

  return {
    id: getString(ledger.id, `ledger-${index}`),
    user_id: getString(ledger.user_id || ledger.userId || ''),
    type: normalizedType,
    amount,
    source_type: getString(ledger.source_type || ledger.source || ''),
    source_id: getString(ledger.source_id || ledger.id || ''),
    external_reference_id: ledger.external_reference_id ? getString(ledger.external_reference_id) : undefined,
    created_at: getString(ledger.created_at || ledger.createdAt || ''),
  };
};

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
  const [rawUsers, setRawUsers] = useState<User[]>([]);
  const [rawVouchers, setRawVouchers] = useState<Voucher[]>([]);
  
  // STATE BARU: Untuk menyimpan data grafik Earn & Burn yang sudah dinamis
  const [dynamicChartData, setDynamicChartData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.time('getUsers');
        const usersResponse = await apiService.getUsers();
        console.timeEnd('getUsers');

        console.time('getMissions');
        const missionsResponse = await apiService.getMissions();
        console.timeEnd('getMissions');

        console.time('getVouchers');
        const vouchersResponse = await apiService.getVouchers();
        console.timeEnd('getVouchers');

        console.time('getPointsHistory');
        const ledgerResponse = await apiService.getPointsHistory();
        console.timeEnd('getPointsHistory');

        console.log('[USERS]', usersResponse);
        console.log('[MISSIONS]', missionsResponse);
        console.log('[VOUCHERS]', vouchersResponse);
        console.log('[POINTS_HISTORY]', ledgerResponse);

        const users = unwrapData<User[]>(usersResponse).map(normalizeUser);
        const missions = unwrapData<Mission[]>(missionsResponse).map(normalizeMission);
        const vouchers = unwrapData<Voucher[]>(vouchersResponse).map(normalizeVoucher);
        const ledger = unwrapData<PointLedger[]>(ledgerResponse).map(normalizePointLedger);
        
        const totalGamificationEvents = ledger.length;

        setStats({
          users: users.length,
          missions: missions.length,
          vouchers: vouchers.length,
          totalInteractions: totalGamificationEvents
        });

        setRawUsers(users);
        setRawVouchers(vouchers);

        if (ledger && Array.isArray(ledger)) {
          const namaHari = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const last7Days: any[] = [];
          
          for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push({
              name: namaHari[d.getDay()],
              dateStr: d.toISOString().split('T')[0],
              earn: 0,
              spend: 0
            });
          }

          ledger.forEach((tx) => {
            if (!tx.created_at) return;
            try {
              const txDate = new Date(tx.created_at).toISOString().split('T')[0];
              const dayIndex = last7Days.findIndex(d => d.dateStr === txDate);
              
              if (dayIndex !== -1) {
                const points = Number(tx.amount) || 0;
                if (points > 0) last7Days[dayIndex].earn += 1; 
                if (points < 0) last7Days[dayIndex].spend += 1;
              }
            } catch (e) {
              // Abaikan jika format tanggal tidak valid
            }
          });

          setDynamicChartData(last7Days);
        }

      } catch (error) {
        console.error('[DASHBOARD ERROR]', error);
        toast.error(getErrorMessage(error, 'Gagal memuat data dashboard'));
        setStats({
          users: 0,
          missions: 0,
          vouchers: 0,
          totalInteractions: 0
        });
        setRawUsers([]);
        setRawVouchers([]);
        setDynamicChartData([]);
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