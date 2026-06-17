import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_GAMIFICATION_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function untuk membersihkan data autentikasi secara aman
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('ngolabify_user_v1');
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Bersihkan session/token
      clearAuthData();

      // 2. Redirect berbasis HashRouter HANYA jika belum berada di halaman login
      // Ini mencegah infinite loop pada screen Login
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // ================= AUTH =================
  login: (email: string, password: string) => {
    const API_HOST = (import.meta.env.VITE_GAMIFICATION_API_URL || '').replace('/api/gamification', '');
    return axios.post(`${API_HOST}/api/membership/login`, {
      email,
      password,
    });
  },

  // getProfile() digunakan untuk data autentikasi.
  // getUserById() digunakan oleh AppContext untuk sinkronisasi data gamification.
  getProfile: (userId: string) =>
    api.get(`/auth/profile/${userId}`),

  lookupUser: (data: Record<string, unknown>) =>
    api.post('/auth/lookup', data),

// ================= USER =================
  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),

  updateUser: (userId: string, data: Record<string, unknown>) =>
    api.put(`/users/${userId}`, data),

  addPoints: (points: number, description?: string) =>
    api.post('/users/add-points', { points, description }),

  // ================= CHECKIN =================
  checkIn: () =>
    api.post('/checkin'),

  // ================= MISSIONS =================
  getMissions: () =>
    api.get('/missions'),

  getUserMissions: () =>
    api.get('/user-missions'),

  completeMission: (missionId: string) =>
    api.post('/user-missions/complete', { missionId }),

  // ================= GAMES =================
  getGames: () =>
    api.get('/games'),

  spinGame: (gameId: string) =>
    api.post('/games/spin', { gameId }),

  scratchGame: (gameId: string) =>
    api.post('/games/scratch', { gameId }),

  checkGameCooldown: (gameId: string) =>
    api.get('/games/cooldown', {
      params: { gameId },
    }),

  // ================= HISTORY =================
  getPointsHistory: () =>
    api.get('/points/history'),

  getGamePlays: () =>
    api.get('/game-plays'),

  // ================= REFERRAL =================
  getReferralEarnings: () =>
    api.get('/referral-earnings'),

  getReferralMembers: () =>
    api.get('/referrals/members'),

  // ================= VOUCHER =================
  getVouchers: () =>
    api.get('/vouchers'),

  getUserVouchers: () =>
    api.get('/user-vouchers'),

  claimVoucher: (voucherCode: string) =>
    api.post('/vouchers/claim', {
      voucherCode,
    }),
};

export default api;
