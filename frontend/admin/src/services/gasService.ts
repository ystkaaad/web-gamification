/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Google Apps Script client — sole persistence layer (GAS → MySQL).
 */

import { API_URL } from '../config/api';

const pendingRequests = new Map<string, Promise<unknown>>();

export type GasOperation =
  | 'GET_MISSIONS'
  | 'CREATE_MISSION'
  | 'UPDATE_MISSION'
  | 'DELETE_MISSION'
  | 'GET_VOUCHERS'
  | 'CREATE_VOUCHER'
  | 'UPDATE_VOUCHER'
  | 'DELETE_VOUCHER'
  | 'GET_USERS'
  | 'CREATE_USER'
  | 'UPDATE_USER'
  | 'DELETE_USER'
  | 'GET_GAMES'
  | 'CREATE_GAME'
  | 'UPDATE_GAME'
  | 'DELETE_GAME'
  | 'GET_POINTS_HISTORY'
  | 'UPDATE_POINTS'
  | 'ADD_POINTS'
  | 'GET_REDEMPTIONS'
  | 'GET_USER_MISSIONS'
  | 'GET_STATS'
  | 'REDEEM_VOUCHER'
  | 'REDEEM_VOUCHER_CASHIER'
  | 'DAILY_CHECKIN'
  | 'PLAY_GAME'
  | 'CHECK_GAME_COOLDOWN'
  | 'PLAY_SPINWHEEL'
  | 'GENERIC';

function logGasFailure(
  operation: GasOperation,
  context: {
    method: string;
    url: string;
    status?: number;
    responseText?: string;
    error?: unknown;
    body?: unknown;
  }
) {
  console.error('[GAS] Request failed', {
    operation,
    timestamp: new Date().toISOString(),
    apiBase: API_URL || '(not configured — set VITE_GAS_URL)',
    method: context.method,
    url: context.url,
    httpStatus: context.status,
    requestBody: context.body,
    responsePreview: context.responseText?.slice(0, 500),
    error: context.error instanceof Error ? context.error.message : context.error,
  });
}

function ensureApiUrl(): void {
  if (!API_URL || API_URL.includes('placeholder')) {
    throw new Error('VITE_GAS_URL is not configured. Set it in .env to your deployed Apps Script Web App URL.');
  }
}

const normalizeMissionPayload = (data: Record<string, unknown>) => ({
  ...data,
  id: data.id,
  rewardPoints: data.rewardPoints ?? data.reward_points ?? 0,
  target: data.target ?? data.targetAmount ?? 0,
  type:
    data.type ??
    (data.config_data
      ? (() => {
          try {
            return JSON.parse(String(data.config_data)).type || 'ONE_TIME';
          } catch {
            return 'ONE_TIME';
          }
        })()
      : 'ONE_TIME'),
  status: data.status ?? (data.is_active === false ? 'inactive' : 'active'),
});

const normalizeVoucherPayload = (data: Record<string, unknown>) => ({
  ...data,
  cost_points: data.cost_points ?? data.points_cost ?? data.cost ?? 0,
  image_url: data.image_url ?? data.image ?? '',
  stock: data.stock ?? 0,
  status: data.status ?? (data.is_approved ? 'APPROVED' : 'PENDING'),
});

const fetchGAS = async (
  operation: GasOperation,
  params: string,
  options?: RequestInit & { body?: string }
): Promise<Record<string, unknown>> => {
  ensureApiUrl();

  const cacheKey = `${options?.method || 'GET'}:${params}:${options?.body || ''}`;
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey) as Promise<Record<string, unknown>>;
  }

  const method = options?.method || 'GET';
  const url = method === 'POST' ? API_URL : `${API_URL}?${params}`;

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        redirect: 'follow',
        ...(method === 'POST'
          ? {
              mode: 'cors',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
                ...(options?.headers || {}),
              },
            }
          : {}),
      });

      const text = await response.text();

      if (!response.ok) {
        logGasFailure(operation, {
          method,
          url,
          status: response.status,
          responseText: text,
          body: options?.body ? JSON.parse(options.body) : undefined,
        });
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`);
      }

      let json: Record<string, unknown>;
      try {
        json = JSON.parse(text) as Record<string, unknown>;
      } catch {
        logGasFailure(operation, {
          method,
          url,
          status: response.status,
          responseText: text,
          error: 'JSON parse error',
        });
        throw new Error("Invalid GAS response. Deploy Web App as 'Anyone' and allow CORS.");
      }

      if (json.error) {
        logGasFailure(operation, {
          method,
          url,
          status: response.status,
          responseText: text,
          body: options?.body ? JSON.parse(options.body) : undefined,
        });
        throw new Error(String(json.error));
      }

      if (json.success === false) {
        logGasFailure(operation, {
          method,
          url,
          status: response.status,
          responseText: text,
          body: options?.body ? JSON.parse(options.body) : undefined,
        });
        throw new Error(String(json.message || 'GAS returned success: false'));
      }

      return json;
    } catch (err) {
      if (!(err instanceof Error && err.message.startsWith('HTTP'))) {
        logGasFailure(operation, {
          method,
          url,
          error: err,
          body: options?.body ? JSON.parse(options.body) : undefined,
        });
      }
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

const post = (operation: GasOperation, body: Record<string, unknown>) =>
  fetchGAS(operation, '', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const gasService = {
  async getMissions() {
    const result = await fetchGAS('GET_MISSIONS', 'action=GET_DATA&sheetName=Missions');
    return (result.data as unknown[]) || [];
  },

  async addMission(data: Record<string, unknown>) {
    const payload = normalizeMissionPayload(data);
    return post('CREATE_MISSION', { action: 'CREATE', sheetName: 'Missions', payload });
  },

  async updateMission(id: string, data: Record<string, unknown>) {
    const payload = normalizeMissionPayload({ ...data, id });
    return post('UPDATE_MISSION', { action: 'UPDATE', sheetName: 'Missions', payload, id });
  },

  async deleteMission(id: string) {
    return post('DELETE_MISSION', {
      action: 'DELETE_DATA',
      sheetName: 'Missions',
      payload: { id },
      id,
    });
  },

  async getVouchers() {
    const result = await fetchGAS('GET_VOUCHERS', 'action=GET_DATA&sheetName=Vouchers');
    return (result.data as unknown[]) || [];
  },

  async addVoucher(data: Record<string, unknown>) {
    return post('CREATE_VOUCHER', {
      action: 'CREATE',
      sheetName: 'Vouchers',
      payload: normalizeVoucherPayload(data),
    });
  },

  async updateVoucher(id: string, data: Record<string, unknown>) {
    const payload = normalizeVoucherPayload({ ...data, id });
    return post('UPDATE_VOUCHER', { action: 'UPDATE', sheetName: 'Vouchers', payload, id });
  },

  async deleteVoucher(id: string) {
    return post('DELETE_VOUCHER', {
      action: 'DELETE_DATA',
      sheetName: 'Vouchers',
      payload: { id },
      id,
    });
  },

  async getUsers() {
    const result = await fetchGAS('GET_USERS', 'action=GET_DATA&sheetName=UserGamification');
    return (result.data as unknown[]) || [];
  },

  async addUser(data: Record<string, unknown>) {
    return post('CREATE_USER', { action: 'CREATE', sheetName: 'UserGamification', payload: data });
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    return post('UPDATE_USER', {
      action: 'UPDATE',
      sheetName: 'UserGamification',
      payload: { ...data, userId: id, id },
      id,
    });
  },

  async deleteUser(id: string) {
    return post('DELETE_USER', {
      action: 'DELETE',
      sheetName: 'UserGamification',
      payload: { userId: id },
      id,
    });
  },

  async getTransactions() {
    const result = await fetchGAS('GET_POINTS_HISTORY', 'action=GET_DATA&sheetName=PointsHistory');
    return (result.data as unknown[]) || [];
  },

  async getPointHistories() {
    return this.getTransactions();
  },

  async getPointsLedger() {
    return this.getTransactions();
  },

  async getRedemptions() {
    const result = await fetchGAS('GET_REDEMPTIONS', 'action=GET_DATA&sheetName=VoucherHistory');
    return (result.data as unknown[]) || [];
  },

  async getUserMissions() {
    const result = await fetchGAS('GET_USER_MISSIONS', 'action=GET_DATA&sheetName=UserMissions');
    return (result.data as unknown[]) || [];
  },

  async getStats() {
    try {
      const result = await fetchGAS('GET_STATS', 'action=GET_STATS');
      return (result.data as Record<string, unknown>) || { totalUsers: 0, totalTransactions: 0, totalPoints: 0 };
    } catch {
      return { totalUsers: 0, totalTransactions: 0, totalPoints: 0 };
    }
  },

  async getGames() {
    const result = await fetchGAS('GET_GAMES', 'action=GET_DATA&sheetName=Games');
    return (result.data as unknown[]) || [];
  },

  async updateGame(id: string, data: Record<string, unknown>) {
    return post('UPDATE_GAME', {
      action: 'UPDATE',
      sheetName: 'Games',
      payload: { ...data, id },
      id,
    });
  },

  async addGame(data: Record<string, unknown>) {
    return post('CREATE_GAME', { action: 'CREATE', sheetName: 'Games', payload: data });
  },

  async deleteGame(id: string) {
    return post('DELETE_GAME', {
      action: 'DELETE_DATA',
      sheetName: 'Games',
      payload: { id },
      id,
    });
  },

  async updatePoints(userId: string, points: number, description: string) {
    return post('UPDATE_POINTS', {
      action: 'UPDATE_POINTS',
      payload: { userId, points, description },
    });
  },

  async addPoints(userId: string, points: number, description?: string) {
    return post('ADD_POINTS', {
      action: 'ADD_POINTS',
      payload: { userId, rewardPoints: points, description: description || 'Points adjustment' },
    });
  },

  async redeemVoucher(payload: Record<string, unknown>) {
    return post('REDEEM_VOUCHER', {
      action: 'REDEEM_VOUCHER',
      type: 'REDEEM_VOUCHER',
      sheetName: 'Vouchers',
      payload,
    });
  },

  async redeemVoucherCashier(id: string) {
    return post('REDEEM_VOUCHER_CASHIER', {
      action: 'REDEEM_VOUCHER_CASHIER',
      id: id,
    });
  },

  async completeMission(payload: Record<string, unknown>) {
    return post('UPDATE_MISSION', {
      action: 'UPDATE_MISSION',
      type: 'UPDATE_MISSION',
      sheetName: 'MissionProgress',
      payload,
    });
  },

  async dailyCheckIn(userId: string, rewardPoints: number, streakConfig?: Record<string, unknown>) {
    return post('DAILY_CHECKIN', {
      action: 'dailyCheckIn',
      type: 'dailyCheckIn',
      sheetName: 'UserGamification',
      data: { userId, rewardPoints, streakConfig },
    });
  },

  async recordGamePlay(payload: Record<string, unknown>) {
    return post('PLAY_GAME', {
      action: 'PLAY_GAME',
      type: 'PLAY_GAME',
      sheetName: 'GamePlays',
      payload,
    });
  },

  async checkGameCooldown(userId: string, gameId: string) {
    return post('CHECK_GAME_COOLDOWN', {
      action: 'CHECK_GAME_COOLDOWN',
      sheetName: 'GamePlays',
      payload: { userId, gameId },
    });
  },

  // =================================================================
  // FUNGSI BARU: SINKRONISASI GAME SPINWHEEL (ANTI-CHEAT)
  // =================================================================
  async playSpinwheel(payload: { userId: string; gameId: string }) {
    return post('PLAY_SPINWHEEL', {
      action: 'PLAY_SPINWHEEL',
      payload,
    });
  },
};