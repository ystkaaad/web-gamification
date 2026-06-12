/* AppContext.tsx - Core State Management with Real API Integration */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { User, Transaction, Mission, Voucher, ReferralMember, ReferralTransaction, LoyaltyLevel, Game } from './types';
import { apiService } from './services/apiService';

// Helper untuk normalisasi response dari backend
const unwrapData = <T,>(response: any): T => {
  return response?.data?.data ?? response?.data ?? ([] as unknown as T);
};

interface AppContextType {
  user: User | null;
  transactions: Transaction[];
  missions: Mission[];
  vouchers: Voucher[];
  myVouchers: Voucher[];
  referralHistory: ReferralTransaction[];
  referralMembers: ReferralMember[];
  games: Game[];
  isSyncing: boolean;
  isLoading: boolean;
  lastSyncStatus: 'success' | 'error' | 'idle';
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkIn: () => Promise<void>;
  completeMission: (missionId: string) => Promise<void>;
  addPoints: (points: number, description: string) => Promise<void>;
  claimVoucher: (voucher: Voucher) => Promise<boolean>;
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  processMemberTransaction: (nominal: number, affiliateCode: string) => Promise<void>;
  refreshData: (currentUser?: User) => Promise<void>;
  setPointsAndStreak: (points: number, streak: number, lastCheckIn: string | null) => void;
  calculateMemberLevel: (points: number) => LoyaltyLevel;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | 'idle'>('idle');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [referralMembers, setReferralMembers] = useState<ReferralMember[]>([]);
  const [referralHistory, setReferralHistory] = useState<ReferralTransaction[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const syncRef = useRef(false);

  const calculateMemberLevel = useCallback((points: number): LoyaltyLevel => {
    if (points >= 1000) return LoyaltyLevel.PLATINUM;
    if (points >= 500) return LoyaltyLevel.GOLD;
    return LoyaltyLevel.SILVER;
  }, []);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    console.log(`[Notification] ${type.toUpperCase()}: ${message}`);
  }, []);

  // ==========================================
  // REFRESH DATA (REST API)
  // ==========================================
  const refreshData = useCallback(async (currentUser?: User) => {
    if (syncRef.current) return;
    
    const storedUser = JSON.parse(localStorage.getItem('ngolabify_user_v1') || 'null');
    const activeUser = currentUser || storedUser;
    
    if (!activeUser || !activeUser.id) {
      return;
    }

    syncRef.current = true;
    setIsSyncing(true);

    try {
      const [
        profileRes,
        missionsRes,
        gamesRes,
        historyRes,
        userMissionRes,
      ] = await Promise.all([
        apiService.getUserById(activeUser.id).catch(() => ({ data: activeUser })),
        apiService.getMissions().catch(() => ({ data: [] })),
        apiService.getGames().catch(() => ({ data: [] })),
        apiService.getPointsHistory(activeUser.id).catch(() => ({ data: [] })),
        apiService.getUserMissions(activeUser.id).catch(() => ({ data: [] }))
      ]);

      const profileData = unwrapData<any>(profileRes);
      const missionsData = unwrapData<any[]>(missionsRes);
      const gamesData = unwrapData<any[]>(gamesRes);
      const historyData = unwrapData<any[]>(historyRes);
      const userMissionData = unwrapData<any[]>(userMissionRes);

      let latestUser = activeUser;

      if (profileData && Object.keys(profileData).length > 0) {
        // Mengamankan poin agar tidak ter-reset jika tidak dikirim backend
        const profilePoints = Number(
          profileData.points ?? 
          activeUser.points ?? 
          0
        );

        // Normalisasi field snake_case ke camelCase dilakukan di luar setState
        // untuk menghindari issues asynchronous (data lama yang dipakai untuk request selanjutnya)
        const updatedUser: User = {
          ...activeUser,
          ...profileData,
          
          isAffiliate: Boolean(
            profileData.isAffiliate === true ||
            profileData.is_affiliate === true ||
            profileData.role === 'MEMBER_AFFILIATE' ||
            activeUser.isAffiliate === true
          ),
          
          streakCount: 
            profileData.streakCount ?? 
            profileData.streak_count ?? 
            activeUser.streakCount,
            
          lastCheckIn: 
            profileData.lastCheckIn ?? 
            profileData.last_check_in ?? 
            activeUser.lastCheckIn,
            
          points: profilePoints,
          
          memberLevel: 
            profileData.memberLevel ?? 
            profileData.member_level ?? 
            calculateMemberLevel(profilePoints),
            
          referralCode: 
            profileData.referralCode ?? 
            profileData.referral_code ?? 
            activeUser.referralCode ?? 
            activeUser.referral_code ??
            null
        };

        latestUser = updatedUser;
        
        setUser(updatedUser);
        localStorage.setItem('ngolabify_user_v1', JSON.stringify(updatedUser));
      }

      setGames(gamesData || []);
      setTransactions(historyData || []);

      const baseMissions = missionsData || [];
      const progressData = userMissionData || [];
      const mergedMissions = baseMissions.map((m: any) => {
        const prog = progressData.find((p: any) => p.missionId === m.id);
        return {
          ...m,
          progress: prog?.progress || 0,
          completed: prog?.isCompleted || false
        };
      });
      setMissions(mergedMissions);

      // Pengecekan referral HANYA menggunakan state `latestUser` yang pasti sudah ternormalisasi 
      if (latestUser.isAffiliate) {
        try {
          const refRes = await apiService.getReferralEarnings(latestUser.id);
          const referralData = unwrapData<any[]>(refRes);
          setReferralHistory(referralData || []);
          
          // TODO: Implement referral members setelah endpoint backend tersedia
          setReferralMembers([]);
        } catch (e) {
          console.error("Gagal fetch referral", e);
        }
      } else {
        setReferralHistory([]);
        setReferralMembers([]);
      }

      // TODO: Integrasi backend voucher setelah endpoint tersedia
      setVouchers([]);
      setMyVouchers([]);

      setLastSyncStatus('success');
    } catch (error: any) {
      console.error('Refresh task failed:', error);
      setLastSyncStatus('error');
    } finally {
      setIsSyncing(false);
      syncRef.current = false;
    }
  }, [calculateMemberLevel]); 

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
  
    initializedRef.current = true;
  
    const initialize = async () => {
      setIsLoading(true);
  
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('ngolabify_user_v1');
  
        if (token && savedUser) {
          const parsed = JSON.parse(savedUser);
  
          if (parsed?.id) {
            setUser(parsed);
            await refreshData(parsed);
          }
        }
      } catch (error) {
        console.error(error);
  
        localStorage.removeItem('token');
        localStorage.removeItem('ngolabify_user_v1');
      } finally {
        setIsLoading(false);
      }
    };
  
    void initialize();
  }, [refreshData]);

  // ==========================================
  // AUTENTIKASI
  // ==========================================
  const login = async (email: string, password: string) => {
    setIsLoading(true); 
    setIsSyncing(true);
    try {
      const response = await apiService.login(email, password);
      
      console.log('LOGIN RESPONSE:', response.data);

      const token = response.data.token || response.data.data?.token;
      const loggedInUser = response.data.data?.user || {};
      const userGamification = response.data.data?.userGamification || {};

const normalizedUser: User = {
        ...loggedInUser,
        ...userGamification,
        
        id: loggedInUser.user_id ?? loggedInUser.id,
        name: loggedInUser.name ?? loggedInUser.username ?? '',
        email: loggedInUser.email ?? '',
        
        isAffiliate: Boolean(
          loggedInUser.isAffiliate === true ||
          loggedInUser.is_affiliate === true ||
          loggedInUser.role === 'MEMBER_AFFILIATE' ||
          userGamification.role === 'MEMBER_AFFILIATE'
        ),
        
        referralCode: 
          loggedInUser.referralCode ??
          loggedInUser.referral_code ??
          userGamification.referralCode ??
          userGamification.referral_code ??
          null,
        
        streakCount: Number(
          userGamification.streakCount ?? 
          userGamification.streak_count ?? 
          0
        ),
        
        lastCheckIn: 
          userGamification.lastCheckIn ?? 
          userGamification.last_check_in ?? 
          null,
      };

      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('ngolabify_user_v1', JSON.stringify(normalizedUser));

      console.log('NORMALIZED USER:', normalizedUser);
      setUser(normalizedUser);

      await refreshData(normalizedUser);
      addNotification('Login Berhasil!', 'success');
    } catch (error: any) {
      addNotification(
        error.response?.data?.message || 'Login gagal. Periksa kredensial.',
        'error'
      );
      throw error;
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ngolabify_user_v1');
    setUser(null);
    setTransactions([]);
    setMissions([]);
    setGames([]);
    setVouchers([]);
    setMyVouchers([]);
    setReferralHistory([]);
    setReferralMembers([]);
    setIsLoading(false);
    setIsSyncing(false);
    setLastSyncStatus('idle');
  };

  // ==========================================
  // MUTASI REST API (CRUD)
  // ==========================================
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const response = await apiService.updateUser(user.id, data);
      const responseData = unwrapData<any>(response);

      if (responseData && Object.keys(responseData).length > 0) {
        setUser(prev => {
          if (!prev) return null;
          
          const updatedUser: User = {
            ...prev,
            ...responseData,

            isAffiliate: Boolean(
              responseData.isAffiliate === true ||
              responseData.is_affiliate === true ||
              responseData.role === 'MEMBER_AFFILIATE' ||
              prev.isAffiliate === true
            ),

            streakCount:
              responseData.streakCount ??
              responseData.streak_count ??
              prev.streakCount,

            lastCheckIn:
              responseData.lastCheckIn ??
              responseData.last_check_in ??
              prev.lastCheckIn,

            points: Number(
              responseData.points ??
              prev.points
            ),

            memberLevel:
              responseData.memberLevel ??
              responseData.member_level ??
              calculateMemberLevel(
                Number(responseData.points ?? prev.points)
              ),

            referralCode:
              responseData.referralCode ??
              responseData.referral_code ??
              prev.referralCode ??
              prev.referral_code ??
              null
          };

          localStorage.setItem('ngolabify_user_v1', JSON.stringify(updatedUser));
          return updatedUser;
        });
        addNotification('Profil berhasil diperbarui', 'success');
      }
    } catch (error) {
      addNotification('Gagal memperbarui data.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const checkIn = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await apiService.dailyCheckIn(user.id);
      addNotification(`Check-in Berhasil!`, 'success');
      await refreshData();
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Gagal check-in. Coba lagi nanti.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const completeMission = async (missionId: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await apiService.completeMission(user.id, missionId);
      addNotification(`Misi Selesai!`, 'success');
      await refreshData();
    } catch (error: any) {
      addNotification(error.response?.data?.message || 'Gagal menyelesaikan misi.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const addPoints = useCallback(async (points: number, description: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      await apiService.addPoints(user.id, points, description);
      addNotification(points > 0 ? `+${points} Poin: ${description}` : `${points} Poin: ${description}`, 'success');
      await refreshData();
    } catch (error: any) {
      addNotification(`Gagal memperbarui poin: ${error.response?.data?.message || 'Error Sistem'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [user, addNotification, refreshData]);

  const claimVoucher = async (_voucher: Voucher): Promise<boolean> => {
    addNotification(
      'Fitur voucher sedang dalam proses migrasi backend.',
      'info'
    );
    // TODO: Implementasikan menggunakan apiService.claimVoucher() setelah endpoint tersedia
    return false;
  };

  const processMemberTransaction = async (nominal: number, affiliateCode: string) => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const pointsEarned = Math.floor(nominal / 100); 
      await apiService.addPoints(user.id, pointsEarned, `Transaksi via Kasir ${affiliateCode}`);
      addNotification(`Transaksi berhasil diproses!`, 'success');
      await refreshData();
    } catch (error) {
      addNotification('Gagal memproses transaksi.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const setPointsAndStreak = useCallback(
    (
      points: number,
      streakCount: number,
      lastCheckIn: string | null
    ) => {
      setUser(prev => {
        if (!prev) {
          return null;
        }
  
        const updatedUser = {
          ...prev,
          points,
          streakCount,
          lastCheckIn,
          memberLevel: calculateMemberLevel(points)
        };
  
        localStorage.setItem(
          'ngolabify_user_v1',
          JSON.stringify(updatedUser)
        );
  
        return updatedUser;
      });
    },
    [calculateMemberLevel]
  );

  return (
    <AppContext.Provider value={{
      user, transactions, missions, vouchers, myVouchers, 
      referralHistory, referralMembers, games, isSyncing, isLoading, lastSyncStatus,
      setUser, login, logout, updateUser, checkIn, completeMission, addPoints, claimVoucher, processMemberTransaction, refreshData ,
      setPointsAndStreak, calculateMemberLevel, addNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};