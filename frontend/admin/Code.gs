/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_URL } from '../config/api';

export const gasAdminApi = {
  /**
   * Fetch data dari Google Sheets (GET)
   */
  async fetchTableData(sheetName: string) {
    try {
      if (!API_URL || API_URL.includes('placeholder')) throw new Error('API_URL tidak dikonfigurasi');
      const response = await fetch(`${API_URL}?action=GET_DATA&sheetName=${sheetName}`, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.warn(`Fetch error for ${sheetName}:`, error);
      return [];
    }
  },

  /**
   * Mutasi data ke Google Sheets (POST)
   * Menggunakan mode: 'no-cors' untuk bypass CORS.
   */
  async mutateTableData(action: 'CREATE' | 'UPDATE' | 'DELETE' | 'DELETE_DATA', sheetName: string, payload: any) {
    try {
      if (!API_URL) throw new Error('API_URL tidak dikonfigurasi');
      
      const targetId = String(payload?.id ?? payload?.userId ?? '').trim();
      const body = {
        action,
        sheetName,
        id: targetId,
        payload: {
          ...(payload || {}),
          id: targetId,
          sheetName: sheetName
        }
      };

      // Gunakan AbortController untuk timeout jika fetch gantung
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      try {
        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors', // Kembalikan ke no-cors agar POST aman masuk ke GAS
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(body)
        });
      } catch (e: any) {
        // Pada mode no-cors, terkadang Abort dipicu lebih cepat padahal data sudah sampai
        if (e.name !== 'AbortError') console.error('Fetch error:', e);
      } finally {
        clearTimeout(timeoutId);
      }

      // Kembalikan sukses segera setelah request dikirim (no-cors tidak bisa baca response body)
      return { success: true };
    } catch (error) {
      console.error(`Mutation Error:`, error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown Error' };
    }
  },

  /**
   * Hapus Data (DELETE)
   * Mengirim POST request dengan action DELETE_DATA.
   */
  async deleteTableData(sheetName: string, id: string) {
    try {
      if (!API_URL) throw new Error('API_URL tidak dikonfigurasi');

      // Gunakan struktur yang sama persis seperti mutateTableData agar tembus CORS
      const body = {
        action: 'DELETE_DATA',
        sheetName: sheetName,
        id: String(id).trim(),
        payload: { id: String(id).trim() }
      };

      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors', // Wajib no-cors untuk POST ke GAS tanpa preflight error
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(body)
      });

      // Kembalikan true asalkan request sukses dikirim.
      return { success: true };
    } catch (error) {
      console.error('Delete Error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown Error' };
    }
  },

  /**
   * Admin Login (POST)
   */
  async adminLogin(payload: any) {
    try {
      if (!API_URL) throw new Error('API_URL tidak dikonfigurasi');
      const requestBody = {
        action: 'ADMIN_LOGIN',
        sheetName: 'AdminUsers',
        payload: {
          ...payload,
          sheetName: 'AdminUsers',
          action: 'ADMIN_LOGIN' 
        }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(requestBody)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "Gagal menyambung ke server login" };
    }
  },

  /**
   * Inisialisasi Database (Sheet)
   */
  async initializeDatabase() {
    try {
      if (!API_URL) throw new Error('API_URL tidak dikonfigurasi');
      const response = await fetch(`${API_URL}?action=INIT_SHEETS`, {
        method: 'GET',
        redirect: 'follow'
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Init Error:", error);
      return { success: false, message: "Gagal memanggil initSheets" };
    }
  },

  /**
   * Batch fetch dashboard data
   */
  async getDashboardData() {
    try {
      if (!API_URL || API_URL.includes('placeholder')) throw new Error('API_URL tidak dikonfigurasi');
      const response = await fetch(`${API_URL}?action=GET_DASHBOARD_DATA`, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.warn(`Dashboard fetch error:`, error);
      return null;
    }
  }
};