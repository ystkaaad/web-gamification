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
  login: (email: string, password: string) =>
    api.post('/auth/login', {
      email,
      password,
    }),

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

  dailyCheckIn: (userId: string) =>
    api.post(`/users/${userId}/checkin`),

  addPoints: (userId: string, points: number, description?: string) =>
    api.post(`/users/${userId}/add-points`, {
      points,
      description,
    }),

  // ================= MISSIONS =================
  getMissions: () =>
    api.get('/missions'),

  getUserMissions: (userId: string) =>
    api.get('/user-missions', {
      params: { userId },
    }),

  completeMission: (
    userId: string,
    missionId: string
  ) =>
    api.post('/user-missions/complete', {
      userId,
      missionId,
    }),

  // ================= GAMES =================
  getGames: () =>
    api.get('/games'),

  playGame: async (userId: string, gameId: string) => {
    // TODO: Implementasikan endpoint backend untuk fitur ini
    console.warn('TODO: Endpoint backend playGame belum tersedia');
    return {
      data: {
        success: false,
        message: 'Backend playGame belum tersedia',
        data: null
      }
    };
  },

  // TODO: Ganti dengan endpoint backend sebenarnya untuk fitur ini
  checkGameCooldown: async (userId: string, gameId: string) => {
    // TODO: Endpoint backend belum tersedia untuk fitur ini
    console.warn('TODO: Endpoint backend untuk checkGameCooldown belum tersedia');
    return { data: { allowed: true, message: 'Cooldown bypassed' } };
  },

  // ================= HISTORY =================
  getPointsHistory: (userId: string) =>
    api.get('/points-history', {
      params: { userId },
    }),

  getGamePlays: (userId: string) =>
    api.get('/game-plays', {
      params: { userId },
    }),

  // ================= REFERRAL =================
  getReferralEarnings: (affiliateId: string) =>
    api.get('/referral-earnings', {
      params: { affiliateId },
    }),
};

export default api;