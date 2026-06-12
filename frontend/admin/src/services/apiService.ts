import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_GAMIFICATION_API_URL,
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

  getProfile: (userId: string) =>
    api.get(`/auth/profile/${userId}`),

  // ================= USERS =================
  getUsers: () =>
    api.get('/users'),

  getUserById: (userId: string) =>
    api.get(`/users/${userId}`),

  updateUser: (
    userId: string,
    data: Record<string, unknown>
  ) =>
    api.put(`/users/${userId}`, data),

  addPoints: (
    userId: string,
    points: number,
    description?: string
  ) =>
    api.post(`/users/${userId}/add-points`, {
      points,
      description,
    }),

  dailyCheckIn: (userId: string) =>
    api.post(`/users/${userId}/checkin`),

  // ================= MISSIONS =================
  getMissions: () =>
    api.get('/missions'),

  createMission: (data: Record<string, unknown>) =>
    api.post('/missions', data),

  updateMission: (
    missionId: string,
    data: Record<string, unknown>
  ) =>
    api.put(`/missions/${missionId}`, data),

  deleteMission: (missionId: string) =>
    api.delete(`/missions/${missionId}`),

  getUserMissions: (userId?: string) =>
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

  createGame: (data: Record<string, unknown>) =>
    api.post('/games', data),

  updateGame: (
    gameId: string,
    data: Record<string, unknown>
  ) =>
    api.put(`/games/${gameId}`, data),

  deleteGame: (gameId: string) =>
    api.delete(`/games/${gameId}`),

  playGame: (
    userId: string,
    gameId: string
  ) =>
    api.post('/games/play', {
      userId,
      gameId,
    }),

  // ================= HISTORY =================
  getPointsHistory: (userId?: string) =>
    api.get('/points-history', {
      params: { userId },
    }),

  getGamePlays: (userId?: string) =>
    api.get('/game-plays', {
      params: { userId },
    }),

  // ================= REFERRAL =================
  getReferralEarnings: (
    affiliateId?: string
  ) =>
    api.get('/referral-earnings', {
      params: { affiliateId },
    }),

  createReferralEarning: (
    affiliateId: string,
    nominal: number
  ) =>
    api.post('/referral-earnings', {
      affiliateId,
      nominal,
    }),
};

export default api;