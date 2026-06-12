/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Database service — Google Apps Script only (GAS → MySQL).
 */

import { gasService } from './gasService';
import { generateId } from '../utils/generateId';
import {
  User,
  Mission,
  Voucher,
  Transaction,
  PointLedger,
  GameSetting,
} from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Record<string, CacheEntry<unknown>> = {};
const CACHE_TTL = 300000;

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCached(key: string, data: unknown) {
  cache[key] = { data, timestamp: Date.now() };
}

function clearCache(key?: string) {
  if (key) delete cache[key];
  else Object.keys(cache).forEach((k) => delete cache[k]);
}

export const dbService = {
  async getUsers(forceRefresh = false): Promise<User[]> {
    if (!forceRefresh) {
      const cached = getCached<User[]>('users');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getUsers();
      if (!Array.isArray(data)) return [];
      const users = data
        .filter((u: { userId?: string; id?: string }) => u.userId || u.id)
        .map((u: Record<string, unknown>, idx: number) => ({
          ...u,
          id: (u.userId as string) || (u.id as string) || `user-${idx}`,
          phone_number: u.phone || u.phone_number,
          is_affiliate: u.isAffiliate !== undefined ? u.isAffiliate : u.is_affiliate,
          created_at: u.created_at || new Date().toISOString(),
        })) as User[];
      setCached('users', users);
      return users;
    } catch (error) {
      console.error('[dbService] getUsers failed:', error);
      throw error;
    }
  },

  async addUser(user: Omit<User, 'id'>) {
    clearCache('users');
    const userId = generateId('user');
    const payload = { ...user, id: userId, userId, points: user.points ?? 0 };
    return gasService.addUser(payload);
  },

  async updateUser(id: string, data: Partial<User>) {
    clearCache('users');
    await gasService.updateUser(id, data as Record<string, unknown>);
  },

  async deleteUser(id: string) {
    clearCache('users');
    await gasService.deleteUser(id);
  },

  async getMissions(forceRefresh = false): Promise<Mission[]> {
    if (!forceRefresh) {
      const cached = getCached<Mission[]>('missions');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getMissions();
      if (!Array.isArray(data)) return [];
      const missions = data
        .filter((m: { id?: string; title?: string }) => m.id || m.title)
        .map((m: Record<string, unknown>, idx: number) => ({
          ...m,
          id: (m.id as string) || `mission-${idx}`,
          reward_points:
            typeof m.rewardPoints === 'number'
              ? m.rewardPoints
              : typeof m.reward_points === 'number'
                ? m.reward_points
                : 0,
          is_active: m.status === 'active' || m.is_active === true,
        })) as Mission[];
      setCached('missions', missions);
      return missions;
    } catch (error) {
      console.error('[dbService] getMissions failed:', error);
      throw error;
    }
  },

  async addMission(mission: Omit<Mission, 'id'>) {
    clearCache('missions');
    let config: { type?: string; targetAmount?: number } = {};
    try {
      config = mission.config_data ? JSON.parse(mission.config_data) : {};
    } catch {
      /* ignore */
    }
    const payload = {
      id: generateId('mission'),
      title: mission.title,
      description: mission.description,
      rewardPoints: Number(mission.reward_points),
      type: config.type || 'ONE_TIME',
      target: config.targetAmount || 0,
      status: mission.is_active ? 'active' : 'inactive',
      is_active: mission.is_active !== false,
      config_data: mission.config_data,
    };
    return gasService.addMission(payload);
  },

  async updateMission(id: string, data: Partial<Mission>) {
    clearCache('missions');
    const payload: Record<string, unknown> = { ...data };
    if (data.reward_points !== undefined) {
      payload.rewardPoints = Number(data.reward_points);
      delete payload.reward_points;
    }
    if (data.is_active !== undefined) {
      payload.status = data.is_active ? 'active' : 'inactive';
      delete payload.is_active;
    }
    if (data.config_data !== undefined) {
      try {
        const config = JSON.parse(data.config_data);
        payload.type = config.type;
        payload.target = config.targetAmount;
      } catch {
        /* ignore */
      }
    }
    await gasService.updateMission(id, payload);
  },

  async deleteMission(id: string) {
    clearCache('missions');
    await gasService.deleteMission(id);
  },

  async getVouchers(forceRefresh = false): Promise<Voucher[]> {
    if (!forceRefresh) {
      const cached = getCached<Voucher[]>('vouchers');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getVouchers();
      if (!Array.isArray(data)) return [];
      const vouchers = data
        .filter((v: { id?: string; title?: string }) => v.id || v.title)
        .map((v: Record<string, unknown>, idx: number) => ({
          ...v,
          id: (v.id as string) || `voucher-${idx}`,
          points_cost:
            typeof v.cost === 'number'
              ? v.cost
              : typeof v.points_cost === 'number'
                ? v.points_cost
                : 0,
          image_url: v.image || v.image_url,
          status: v.status || (v.is_approved ? 'APPROVED' : 'PENDING'),
        })) as Voucher[];
      setCached('vouchers', vouchers);
      return vouchers;
    } catch (error) {
      console.error('[dbService] getVouchers failed:', error);
      throw error;
    }
  },

  async addVoucher(voucher: Omit<Voucher, 'id'>) {
    clearCache('vouchers');
    const payload = {
      id: generateId('voucher'),
      title: voucher.title,
      description: voucher.description,
      points_cost: voucher.points_cost,
      cost_points: voucher.points_cost,
      stock: voucher.stock,
      expiry_days: voucher.expiry_days,
      image_url: voucher.image_url,
      status: voucher.status ?? 'PENDING',
      is_approved: voucher.is_approved ?? false,
      code: `VCH-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    };
    return gasService.addVoucher(payload);
  },

  async updateVoucher(id: string, data: Partial<Voucher>) {
    clearCache('vouchers');
    await gasService.updateVoucher(id, data as Record<string, unknown>);
  },

  async deleteVoucher(id: string) {
    clearCache('vouchers');
    await gasService.deleteVoucher(id);
  },

  async getTransactions(forceRefresh = false): Promise<Transaction[]> {
    if (!forceRefresh) {
      const cached = getCached<Transaction[]>('transactions');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getTransactions();
      if (!Array.isArray(data)) return [];
      const transactions = data
        .filter((t: { id?: string; userId?: string }) => t.id || t.userId)
        .map((t: Record<string, unknown>, idx: number) => ({
          ...t,
          id: (t.id as string) || `trans-${idx}`,
        })) as Transaction[];
      setCached('transactions', transactions);
      return transactions;
    } catch (error) {
      console.error('[dbService] getTransactions failed:', error);
      return [];
    }
  },

  async getPointLedger(forceRefresh = false): Promise<PointLedger[]> {
    if (!forceRefresh) {
      const cached = getCached<PointLedger[]>('ledger');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getPointsLedger();
      if (!Array.isArray(data)) return [];
      const items = data
        .filter((l: { id?: string; userId?: string }) => l.id || l.userId)
        .map((l: Record<string, unknown>, idx: number) => ({
          ...l,
          id: (l.id as string) || `ledger-${idx}`,
          amount: Number(l.points) || Number(l.amount) || Number(l.pointsChange) || 0,
        })) as PointLedger[];
      setCached('ledger', items);
      return items;
    } catch (error) {
      console.error('[dbService] getPointLedger failed:', error);
      return [];
    }
  },

  async getRedemptions(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCached<unknown[]>('redemptions');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getRedemptions();
      if (!Array.isArray(data)) return [];
      const items = data
        .filter((r: { id?: string; userId?: string }) => r.id || r.userId)
        .map((r: Record<string, unknown>, idx: number) => ({
          ...r,
          id: (r.id as string) || `red-${idx}`,
        }));
      setCached('redemptions', items);
      return items;
    } catch (error) {
      console.error('[dbService] getRedemptions failed:', error);
      return [];
    }
  },

  async getUserMissions(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCached<unknown[]>('userMissions');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getUserMissions();
      if (!Array.isArray(data)) return [];
      const items = data
        .filter((um: { id?: string; userId?: string }) => um.id || um.userId)
        .map((um: Record<string, unknown>, idx: number) => ({
          ...um,
          id: (um.id as string) || `um-${idx}`,
        }));
      setCached('userMissions', items);
      return items;
    } catch (error) {
      console.error('[dbService] getUserMissions failed:', error);
      return [];
    }
  },

  async getGames(forceRefresh = false): Promise<GameSetting[]> {
    if (!forceRefresh) {
      const cached = getCached<GameSetting[]>('games');
      if (cached) return cached;
    }
    try {
      const data = await gasService.getGames();
      if (!Array.isArray(data)) return [];
      const games = data
        .filter((g: { id?: string; name?: string; type?: string }) => g.id || g.name || g.type)
        .map((g: Record<string, unknown>, idx: number) => ({
          ...g,
          id: (g.id as string) || `game-${idx}`,
          is_active:
            g.is_active === true ||
            g.is_active === 'true' ||
            g.is_active === 'TRUE' ||
            g.is_active === 1,
        })) as GameSetting[];
      setCached('games', games);
      return games;
    } catch (error) {
      console.error('[dbService] getGames failed:', error);
      throw error;
    }
  },

  async updateGame(id: string, data: Record<string, unknown>) {
    clearCache('games');
    await gasService.updateGame(id, { ...data, id, type: data.type ?? 'SPINWHEEL' });
  },

  async addGame(game: Omit<GameSetting, 'id'>) {
    clearCache('games');
    const gameId = (game as GameSetting & { id?: string }).id || generateId('game');
    return gasService.addGame({ ...game, id: gameId, type: game.type ?? 'SPINWHEEL' });
  },

  async deleteGame(id: string) {
    clearCache('games');
    await gasService.deleteGame(id);
  },

  async getStats(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCached<Record<string, unknown>>('stats');
      if (cached) return cached;
    }
    const parseNum = (v: unknown) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
      return 0;
    };
    try {
      const stats = await gasService.getStats();
      if (stats && (stats.totalUsers !== undefined || stats.totalPoints !== undefined)) {
        setCached('stats', stats);
        return stats;
      }
      const [users, missions, vouchers] = await Promise.all([
        this.getUsers(true),
        this.getMissions(true),
        this.getVouchers(true),
      ]);
      let totalPoints = 0;
      if (users.length) {
        totalPoints = users.reduce((sum, u) => sum + (parseNum((u as User).points) || 0), 0);
      }
      const computed = {
        totalUsers: users.length,
        totalMissions: missions.length,
        totalVouchers: vouchers.length,
        totalPoints,
        timestamp: new Date(),
      };
      setCached('stats', computed);
      return computed;
    } catch (error) {
      console.error('[dbService] getStats failed:', error);
      return { totalUsers: 0, totalTransactions: 0, totalPoints: 0 };
    }
  },

  async addPoints(userId: string, points: number, description = 'Points adjustment') {
    clearCache('ledger');
    clearCache('users');
    clearCache('transactions'); // Sinkronkan cache transactions
    return gasService.addPoints(userId, points, description);
  },

  async updatePoints(userId: string, points: number, description: string) {
    clearCache('users');
    clearCache('transactions');
    clearCache('ledger');
    return gasService.updatePoints(userId, points, description);
  },

  async recordGamePlay(
    userId: string,
    gameId: string,
    gameType: string,
    costPoints: number,
    rewardPoints: number,
    prizeLabel: string
  ) {
    return gasService.recordGamePlay({
      userId,
      gameId,
      gameType,
      costPoints,
      rewardPoints,
      prizeLabel,
    });
  },

  async canPlayGame(userId: string, gameId: string) {
    try {
      const result = await gasService.checkGameCooldown(userId, gameId);
      if (result.allowed === false) {
        return { allowed: false, message: String(result.message || 'Cooldown aktif.') };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  },

  async seedSystem() {
    console.log('[dbService] Using Google Apps Script → MySQL only.');
  },

  // =================================================================
  // FUNGSI BARU: SINKRONISASI GAME SPINWHEEL (ANTI-CHEAT)
  // =================================================================
  async playSpinwheel(userId: string, gameId: string) {
    // Bersihkan cache agar poin terbaru user langsung ter-update di layar
    clearCache('users');
    clearCache('transactions');
    clearCache('ledger');
    
    // Menggunakan assertion 'any' agar tidak error saat menunggu Anda mengupdate gasService
    return (gasService as any).playSpinwheel({ userId, gameId });
  },
};