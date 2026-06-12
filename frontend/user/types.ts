
export enum LoyaltyLevel {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export interface Game {
  id: string;
  name: string;
  type: 'SPINWHEEL' | 'DAILY_STREAK' | 'SCRATCHCARD';
  cost_points: number;
  reward_points: number;
  config_data: any;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export interface User {
  id: string;
  name?: string;
  points?: number;
  memberLevel?: LoyaltyLevel;
  member_level?: LoyaltyLevel;
  referralCode?: string;
  referral_code?: string;
  streakCount?: number;
  streak_count?: number;
  lastCheckIn?: string | null;
  last_check_in?: string | null;
  isAffiliate?: boolean;
  is_affiliate?: boolean;
}

export interface Transaction {
  id?: string | number;
  userId?: string;
  user_id?: string;
  createdAt?: string;
  created_at?: string;
  timestamp?: string;
  date?: string;
  description?: string;
  item?: string;
  source?: string;
  points?: number;
  pointsChange?: number;
  type?: 'EARN' | 'SPEND';
}

export interface Mission {
  id?: string | number;
  title?: string;
  description?: string;
  completed: boolean;
  progress?: number;
  total?: number;
  target?: number;
  rewardPoints?: number;
  reward_points?: number;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  cost: number;
  image: string;
  expiry: string;
  code?: string;
  status?: string; 
  voucher_type?: string; 
  voucher_value?: string | number;
  max_discount?: number;
  min_purchase?: number;
  cashier_instruction?: string;
}

export interface ReferralMember {
  id: string;
  name: string;
  avatar?: string;
  contributionPoints: number;
  joinedDate?: string;
  joined_at?: string;
}

export interface ReferralTransaction {
  id: string;
  memberName?: string;
  member_name?: string;
  amount: number;
  date?: string;
  created_at?: string;
  description: string;
}
