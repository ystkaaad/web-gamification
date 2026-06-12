/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AdminRole {
  SUPERVISOR = 'SUPERVISOR',
  PIC = 'PIC'
}

export enum LoyaltyLevel {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  PEMULA = 'Level 1 (Pemula)',
  LEVEL_2 = 'Level 2 (Pro)',
  LEVEL_3 = 'Level 3 (Elite)'
}

export interface Admin {
  id: string;
  role_id: string;
  username: string;
  last_login_at: string;
  role_name?: AdminRole;
}

export interface User {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone_number: string;
  is_affiliate: boolean;
  created_at: string;
  // Legacy/UI compatible fields
  points: number;
  cashback: number;
  level: string;
  total_transaksi: number;
  network_volume: number;
  total_member: number;
  referralCode: string;
  affiliateStatus?: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  // External Mapping fields derived from user_membership_mappings
  external_membership_id?: string;
  provider_name?: string;
  // Streak fields derived from user_streaks
  current_streak: number;
  max_streak: number;
  last_checkin_at: string | null;
  streakCount?: number;
  lastCheckIn?: string | null;
  badges?: string[];
}

export interface Transaction {
  id: string;
  user_id: string;
  receipt_number: string;
  total_amount: number;
  points_earned: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
}

export interface PointLedger {
  id: string;
  user_id: string;
  type: 'EARN' | 'REDEEM' | 'ADJUSTMENT';
  amount: number;
  source_type: string;
  source_id: string;
  external_reference_id?: string;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  is_active: boolean;
  config_data?: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  stock: number;
  expiry_days: number;
  image_url: string;
  is_approved: boolean; // For RBAC Approval feature
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  voucher_type?: string; 
  voucher_value?: string | number;
  max_discount?: number;
  min_purchase?: number;
  cashier_instruction?: string;
}

export interface UserVoucher {
  id: string;
  user_id: string;
  voucher_id: string;
  unique_code: string;
  is_used: boolean;
  expired_at: string;
}

export interface Redemption {
  id: string;
  user_id: string;
  voucher_id: string;
  status: 'USED' | 'UNUSED';
  created_at: string;
}

export interface GameSetting {
  id: string;
  name: string;
  type: 'SPINWHEEL' | 'DAILY_STREAK' | 'SCRATCHCARD';
  cost_points: number;
  reward_points: number;
  config_data: string;
  is_active: boolean;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  status: 'STARTED' | 'COMPLETED';
  completedAt?: string;
}

export interface UserGamification {
  userId: string;
  points: number;
  memberLevel: string;
  streakCount: number;
  lastCheckIn: string;
}

export type AdminView = 
  | 'dashboard' 
  | 'missions' 
  | 'vouchers' 
  | 'games'
  | 'user-gamification'
  | 'user-missions'
  | 'voucher-history' 
  | 'points-history' 
  | 'referral-earnings'
  | 'user-view';
