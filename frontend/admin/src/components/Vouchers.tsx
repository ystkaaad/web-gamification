/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Tag,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  Type,
  XCircle,
  ImagePlus,
  Clock,
  List
} from 'lucide-react';
import { apiService, unwrapData } from '../services/apiService';
import { Voucher, AdminRole } from '../types';
import { toast } from 'react-hot-toast';

interface VouchersProps {
  role?: AdminRole;
}

const normalizeVoucher = (voucher: Record<string, unknown>, index: number): Voucher => {
  const status = String(voucher.status || (voucher.is_approved ? 'APPROVED' : 'PENDING')).toUpperCase();

  return {
    id: String(voucher.voucherCode || voucher.voucher_code || voucher.id || `voucher-${index}`),
    title: String(voucher.title || voucher.voucherName || ''),
    description: String(voucher.description || ''),
    points_cost: Number(voucher.points_cost ?? voucher.pointsCost ?? voucher.cost_points ?? voucher.cost ?? 0),
    stock: Number(voucher.stock ?? voucher.quota ?? 0),
    expiry_days: Number(voucher.expiry_days ?? voucher.expiryDays ?? voucher.expiry ?? 0),
    image_url: String(voucher.image_url ?? voucher.imageUrl ?? voucher.image ?? ''),
    is_approved: voucher.is_approved === true || voucher.isActive === true || status === 'APPROVED',
    status: status === 'APPROVED' ? 'APPROVED' : status === 'DRAFT' ? 'DRAFT' : 'PENDING',
    voucher_type: mapBackendToFrontendType(String(voucher.voucher_type ?? voucher.type ?? voucher.voucherType ?? 'PERCENTAGE')),
    voucher_value:
      typeof voucher.voucher_value === 'string' || typeof voucher.voucher_value === 'number'
        ? voucher.voucher_value
        : (typeof voucher.value_amount === 'string' || typeof voucher.value_amount === 'number'
            ? voucher.value_amount
            : (typeof voucher.valueAmount === 'string' || typeof voucher.valueAmount === 'number'
                ? voucher.valueAmount
                : undefined)),
    max_discount: Number(voucher.max_discount ?? voucher.maxDiscount ?? 0),
    min_purchase: Number(voucher.min_purchase ?? voucher.minPurchase ?? 0),
    voucher_code: String(voucher.voucher_code ?? voucher.voucherCode ?? ''),
    voucher_name: String(voucher.voucher_name ?? voucher.voucherName ?? ''),
  };
};

const mapBackendToFrontendType = (backendType: string): Voucher['voucher_type'] => {
  const t = String(backendType || '').toUpperCase();
  if (t === 'DISCOUNT') return 'PERCENTAGE';
  if (t === 'CASHBACK') return 'FIXED';
  if (t === 'REDEEM') return 'FREE_ITEM';
  return 'PERCENTAGE';
};

const mapFrontendToBackendType = (frontendType: string): string => {
  const t = String(frontendType || '').toUpperCase();
  if (t === 'PERCENTAGE') return 'discount';
  if (t === 'FIXED') return 'cashback';
  if (t === 'FREE_ITEM') return 'redeem';
  return 'redeem';
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  return String(responseMessage || (error instanceof Error ? error.message : fallback));
};

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

export default function Vouchers({ role }: VouchersProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // PERBAIKAN: Menggunakan 'any' sementara agar TypeScript tidak protes 
  // karena kolom baru (voucher_type, dll) belum ada di ../types.ts
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const isPIC = role === AdminRole.PIC;
  const [uploadingImage, setUploadingImage] = useState(false);
  const editingVoucherRef = useRef<any>(null);
  editingVoucherRef.current = editingVoucher;

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiService.uploadVoucherImage(formData);
      const imageUrl = response.data?.imageUrl;
      if (imageUrl) {
        setEditingVoucher({ ...editingVoucherRef.current, image_url: imageUrl });
        toast.success('Gambar berhasil diupload');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal upload gambar'));
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const data = await apiService.getVouchers();
      setVouchers(unwrapData<any[]>(data).map(normalizeVoucher));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal memuat daftar voucher'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVoucher = async () => {
    if (!editingVoucher?.title || !editingVoucher?.points_cost) {
      toast.error('Judul dan harga poin wajib diisi');
      return;
    }

    setSaving(true);
    try {
      // Generate voucher_code otomatis jika sedang CREATE voucher baru
      const voucherCode = editingVoucher.id
        ? (editingVoucher.voucher_code || editingVoucher.code)
        : (editingVoucher.voucher_code || editingVoucher.code || `VCH_${Date.now()}`);

      const payload = {
        voucher_code: voucherCode,
        voucher_name: editingVoucher.voucher_name || editingVoucher.title || '',
        voucher_type: mapFrontendToBackendType(editingVoucher.voucher_type || 'PERCENTAGE'),
        points_cost: Number(editingVoucher.points_cost || 0),
        value_amount: editingVoucher.voucher_value,
        description: editingVoucher.description,
        stock: Number(editingVoucher.stock || 0),
        expiry_days: Number(editingVoucher.expiry_days || 0),
        image_url: editingVoucher.image_url,
        max_discount: Number(editingVoucher.max_discount || 0),
        min_purchase: Number(editingVoucher.min_purchase || 0),
        is_active: editingVoucher.is_approved,
      };

      console.log('SAVE_PAYLOAD', payload);

      if (editingVoucher.id) {
        console.log('UPDATE_ID', editingVoucher.id);
        await apiService.updateVoucher(editingVoucher.id, payload);
        toast.success('Voucher berhasil diperbarui');
      } else {
        await apiService.createVoucher({
          ...payload,
          status: 'PENDING',
          is_approved: false
        });
        toast.success('Voucher baru berhasil diajukan');
      }
      await loadVouchers();
      setEditingVoucher(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Gagal menyimpan voucher'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    if (!window.confirm('Hapus voucher ini dari spreadsheet?')) return;

    try {
      await apiService.deleteVoucher(voucherId);
      toast.success('Voucher berhasil dihapus');
      await loadVouchers();
    } catch (error) {
      console.error('Delete voucher error:', error);
      toast.error(getErrorMessage(error, 'Gagal menghapus voucher'));
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tighter mb-2 text-[var(--text-premium)]">Inventori Voucher</h2>
          <p className="text-sm text-[var(--text-muted-premium)] font-medium tracking-wide">Kelola katalog reward eksklusif untuk penukaran poin loyalitas.</p>
        </div>
        <button 
          // PERBAIKAN: Set default value untuk field baru saat klik "Rilis Voucher Baru"
onClick={() => setEditingVoucher({ 
             title: '', description: '', points_cost: 0, stock: 0, expiry_days: 30, image_url: '',
             voucher_type: 'PERCENTAGE', voucher_value: '', min_purchase: 0, max_discount: 0
           })}
          className="bg-[var(--accent-premium)] hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-orange-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Rilis Voucher Baru
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-200 group-focus-within:text-orange-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari voucher berdasarkan judul atau benefit..."
            className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-orange-400 focus:bg-white transition-all font-medium text-sm text-[var(--text-premium)] shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1,2,3].map(i => (
            <div key={i} className="h-96 bg-[#16161A]/50 border border-[#24242A] rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVouchers.map((voucher) => (
            <div key={voucher.id} className="premium-card overflow-hidden group border-orange-100 hover:translate-y-[-4px] transition-all bg-white shadow-lg shadow-orange-100/50">
              <div className="relative aspect-video bg-orange-50 overflow-hidden">
                <img 
                  src={(() => { const s = getVoucherImageUrl(voucher.image_url); console.log('VOUCHER_IMAGE', s); return s; })()}
                  alt={voucher.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className={`px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-orange-100 text-[9px] font-black tracking-widest ${voucher.stock > 0 ? 'text-orange-500' : 'text-rose-500'}`}>
                    {voucher.stock} UNIT TERSEDIA
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${voucher.is_approved ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-orange-400'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#8E9299]">{voucher.status}</span>
                   </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2 text-[var(--text-premium)] line-clamp-1">{voucher.title}</h3>
                  <p className="text-xs text-[var(--text-muted-premium)] line-clamp-2 min-h-[2.5rem] leading-relaxed font-medium">
                    {voucher.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 shadow-inner">
                    <p className="text-[8px] font-black text-orange-300 uppercase tracking-[0.2em] mb-2">Penukaran</p>
                    <div className="flex items-center gap-2 text-orange-500">
                      <Tag className="w-4 h-4" />
                      <span className="text-lg font-black">{voucher.points_cost.toLocaleString()} <span className="text-[9px] opacity-40">PTS</span></span>
                    </div>
                  </div>
                  <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 shadow-inner">
                    <p className="text-[8px] font-black text-orange-300 uppercase tracking-[0.2em] mb-2">Validitas</p>
                    <div className="flex items-center gap-2 text-orange-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-lg font-black">{voucher.expiry_days} <span className="text-[9px] opacity-40">HARI</span></span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button 
                    onClick={() => setEditingVoucher(voucher)}
                    className="flex-1 bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-orange-200 active:scale-95 group/edit"
                  >
                    <span className="flex items-center justify-center gap-2">
                       <Edit className="w-4 h-4 transition-transform group-hover/edit:rotate-12" />
                       Mode Edit
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteVoucher(voucher.id)}
                    className="p-4 rounded-2xl border border-rose-100 hover:bg-rose-50 text-rose-300 hover:text-rose-500 transition-all active:scale-90"
                    title="Hapus voucher"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-orange-950/20 backdrop-blur-md overflow-y-auto">
          <div className="bg-white border border-orange-100 w-full max-w-xl rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(255,138,80,0.2)] flex flex-col max-h-[95vh]">
            <div className="p-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center border border-orange-200">
                  <Ticket className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--text-premium)]">{editingVoucher.id ? 'Modifikasi Voucher' : 'Rancang Voucher'}</h3>
                  <p className="text-[9px] text-[var(--text-muted-premium)] mt-0.5 uppercase tracking-[0.2em] font-bold">Definisikan Penawaran Eksklusif</p>
                </div>
              </div>
              <button onClick={() => setEditingVoucher(null)} className="p-2 hover:bg-orange-100 rounded-xl transition-all">
                <XCircle className="w-6 h-6 text-orange-200" />
              </button>
            </div>
 
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Nama Voucher / Judul</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                  <input 
                    type="text"
                    className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                    placeholder="Contoh: Diskon 50% All Product"
                    value={editingVoucher.title || ''}
                    onChange={(e) => setEditingVoucher({...editingVoucher, title: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Deskripsi Benefit</label>
                <textarea 
                  className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-3 text-sm font-medium text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner h-20 resize-none"
                  placeholder="Jelaskan syarat dan ketentuan serta keuntungan voucher ini..."
                  value={editingVoucher.description || ''}
                  onChange={(e) => setEditingVoucher({...editingVoucher, description: e.target.value})}
                />
              </div>

              {/* PERBAIKAN: BAGIAN DROPDOWN TIPE VOUCHER DINAMIS */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] ml-1">Tipe Sistem Voucher (Kasir)</label>
                <div className="relative">
                  <List className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
<select 
                     className="w-full bg-orange-50 border border-orange-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-black text-orange-600 outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                     value={editingVoucher.voucher_type || 'PERCENTAGE'}
                     onChange={(e) => setEditingVoucher({...editingVoucher, voucher_type: e.target.value})}
                   >
                     <option value="PERCENTAGE">Potongan Diskon Persentase (%)</option>
                     <option value="FIXED">Potongan Harga Nominal (Rp)</option>
                     <option value="FREE_ITEM">Klaim Barang Gratis</option>
                   </select>
                </div>
              </div>

              {/* DYNAMIC FIELD: JIKA TIPE PERCENTAGE */}
              {(!editingVoucher.voucher_type || editingVoucher.voucher_type === 'PERCENTAGE') && (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/30 p-4 rounded-2xl border border-orange-100">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Besar Diskon (%)</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 20"
                      className="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-400"
                      value={editingVoucher.voucher_value || ''}
                      onChange={(e) => setEditingVoucher({...editingVoucher, voucher_value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Maks. Potongan (Rp)</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 15000"
                      className="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-400"
                      value={editingVoucher.max_discount || ''}
                      onChange={(e) => setEditingVoucher({...editingVoucher, max_discount: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD: JIKA TIPE FIXED */}
              {editingVoucher.voucher_type === 'FIXED' && (
                <div className="grid grid-cols-2 gap-4 bg-orange-50/30 p-4 rounded-2xl border border-orange-100">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Potongan Harga (Rp)</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 10000"
                      className="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-400"
                      value={editingVoucher.voucher_value || ''}
                      onChange={(e) => setEditingVoucher({...editingVoucher, voucher_value: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Min. Belanja (Rp)</label>
                    <input 
                      type="number"
                      placeholder="Contoh: 50000"
                      className="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-400"
                      value={editingVoucher.min_purchase || ''}
                      onChange={(e) => setEditingVoucher({...editingVoucher, min_purchase: e.target.value})}
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD: JIKA TIPE FREE ITEM */}
              {editingVoucher.voucher_type === 'FREE_ITEM' && (
                <div className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100 space-y-1.5">
                  <label className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Nama Barang yang Digratiskan</label>
                  <input 
                    type="text"
                    placeholder="Contoh: 1 Porsi Nasi Goreng Spesial"
                    className="w-full bg-white border border-orange-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-orange-400"
                    value={editingVoucher.voucher_value || ''}
                    onChange={(e) => setEditingVoucher({...editingVoucher, voucher_value: e.target.value})}
                  />
</div>
              )}
              {/* SELESAI BAGIAN DINAMIS */}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Harga (POIN)</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <input 
                      type="number"
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-black text-orange-600 outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                      value={editingVoucher.points_cost || 0}
                      onChange={(e) => setEditingVoucher({...editingVoucher, points_cost: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Stok Inventori</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                    <input 
                      type="number"
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                      value={editingVoucher.stock || 0}
                      onChange={(e) => setEditingVoucher({...editingVoucher, stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Masa Kadaluarsa (HARI)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                    <input 
                      type="number"
                      className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner"
                      value={editingVoucher.expiry_days || 0}
                      onChange={(e) => setEditingVoucher({...editingVoucher, expiry_days: parseInt(e.target.value) || 0})}
                    />
</div>
               </div>
               <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Gambar Voucher</label>
                    {editingVoucher.image_url && (
                      <div className="mb-2 relative">
                        <img 
                          src={getVoucherImageUrl(editingVoucher.image_url)}
                          alt="Voucher Preview" 
                          className="w-full h-32 object-cover rounded-xl border border-orange-100"
                        />
                      </div>
                    )}
                   <div className="relative">
                     <ImagePlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-200" />
                     <input 
                       type="file"
                       accept="image/*"
                       disabled={uploadingImage}
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) handleImageUpload(file);
                       }}
                       className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-[var(--text-premium)] outline-none focus:border-orange-400 focus:bg-white transition-all shadow-inner file:mr-2 file:px-3 file:py-1 file:rounded-lg file:bg-orange-100 file:text-orange-600 file:text-xs file:font-bold"
                     />
                     {uploadingImage && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            </div>
 
            <div className="p-6 border-t border-orange-50 bg-orange-50/30 flex gap-4">
              <button 
                onClick={() => setEditingVoucher(null)}
                className="flex-1 py-4 font-black uppercase text-[9px] tracking-[0.2em] text-orange-300 hover:text-orange-500 transition-all"
              >
                Batalkan
              </button>
              <button 
                onClick={handleSaveVoucher}
                disabled={saving}
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] text-white shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Rilis Ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}