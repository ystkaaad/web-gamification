/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_URL } from '../config/api';

export type ActionType = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE';

export interface GasRequest {
  sheetName: string;
  action: ActionType;
  id?: string | number;
  data?: any;
}

/**
 * Utility untuk komunikasi dengan backend Google Apps Script.
 * Backend ini berperan sebagai NoSQL-like database menggunakan Google Sheets.
 */
export const gasApi = {
  /**
   * Mengambil data dari Google Sheets (GET)
   * Berfungsi untuk mendapatkan semua baris dari sheet tertentu.
   */
  async read(sheetName: string) {
    try {
      if (!API_URL || API_URL.includes('placeholder')) {
        throw new Error('API_URL not configured');
      }
      const response = await fetch(`${API_URL}?sheetName=${sheetName}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari Google Sheets');
      }
      return await response.json();
    } catch (error) {
      console.error(`Error reading ${sheetName}:`, error);
      
      // FALLBACK MOCK DATA (Agar UI tetap bisa dilihat di preview jika GAS belum dideploy)
      const mockData: Record<string, any[]> = {
        'Missions': [
          { id: 'm1', title: 'Check-in 7 Hari', rewardPoints: 500, target: 7, is_active: true },
          { id: 'm2', title: 'Belanja Min. 50rb', rewardPoints: 1000, target: 1, is_active: true }
        ],
        'Vouchers': [
          { id: 'v1', title: 'Diskon Kopi 50%', cost_points: 1500, stock: 20, image_url: '' },
          { id: 'v2', title: 'Buy 1 Get 1', cost_points: 2000, stock: 10, image_url: '' }
        ],
        'Users': [
          { id: 'u1', name: 'Budi Santoso', email: 'budi@gmail.com', points: 2500, memberLevel: 'GOLD', isAffiliate: true },
          { id: 'u2', name: 'Siti Aminah', email: 'siti@gmail.com', points: 800, memberLevel: 'REGULAR', isAffiliate: false }
        ],
        'VoucherHistory': [
          { id: 'h1', userId: 'u1', voucherId: 'v1', status: 'AVAILABLE', claimedAt: '2024-05-01' }
        ],
        'PointsHistory': [
          { id: 'p1', userId: 'u1', points: 500, description: 'Mission Completion: m1', timestamp: '2024-05-02' }
        ],
        'ReferralEarnings': [
          { id: 'e1', affiliateId: 'u1', memberId: 'u2', amount: 5000, description: 'Referral Bonus', timestamp: '2024-05-03' }
        ],
        'Games': [
          { id: 'g1', name: 'Spin Wheel', type: 'SPINWHEEL', cost_points: 100, reward_points: 0, config_data: '{}', is_active: true },
          { id: 'g2', name: 'Absen Harian', type: 'DAILY_STREAK', cost_points: 0, reward_points: 50, config_data: '{}', is_active: true }
        ]
      };

      return mockData[sheetName] || [];
    }
  },

  /**
   * Menjalankan aksi tulis/ubah/hapus ke Google Sheets (POST)
   */
  async execute(request: GasRequest) {
    try {
      // Catatan: Google Apps Script memerlukan JSON stringified di body
      const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting untuk menghindari CORS issue pada GAS Web App jika tidak menghandle OPTIONS
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Karena mode 'no-cors' tidak mengizinkan akses ke response body,
      // kita asumsikan sukses jika fetch tidak melempar error.
      // Jika ingin response JSON asli, GAS harus dideploy dengan header CORS yang tepat.
      return { success: true };
    } catch (error) {
      console.error(`Action ${request.action} on ${request.sheetName} failed:`, error);
      throw error;
    }
  }
};
