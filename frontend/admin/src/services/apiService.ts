import axios from 'axios';

const getApiRoot = () =>
  (import.meta.env.VITE_GAMIFICATION_API_URL || '').replace(/\/api\/gamification\/?$/, '');

const addAuthHeaders = (config: any) => {
  const token = localStorage.getItem('adminToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return Promise.reject(error);
};

const api = axios.create({
  baseURL: import.meta.env.VITE_GAMIFICATION_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const adminApi = axios.create({
  baseURL: getApiRoot(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(addAuthHeaders);
api.interceptors.response.use(
  (response) => response,
  handleAuthError
);

adminApi.interceptors.request.use(addAuthHeaders);
adminApi.interceptors.response.use(
  (response) => response,
  handleAuthError
);

export const unwrapData = <T>(response: { data: unknown }): T => {
  const body = response.data;

  if (Array.isArray(body)) return body as T;

  if (body && typeof body === 'object') {
    const data = body as Record<string, unknown>;

    if (Array.isArray(data.data)) return data.data as T;
    if (Array.isArray(data.items)) return data.items as T;
    if (Array.isArray(data.result)) return data.result as T;
    if (data.success === false) {
      throw new Error(String(data.message || 'Request failed'));
    }
  }

  return body as T;
};

export const apiService = {
  // ================= AUTH =================
  login: (email: string, password: string) =>
    api.post('/auth/login', {
      email,
      password,
    }),

  adminLogin: (username: string, password: string) =>
    adminApi.post('/api/auth/login', {
      username,
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

  // TODO: Migrate admin checkin to /checkin when backend endpoint is ready
  checkIn: (userId: string) =>
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

  // TODO: Migrate to /games/spin when backend endpoint is ready for admin
  // spinGame: (gameId: string) => api.post('/games/spin', { gameId }),

  // ================= HISTORY =================
  getPointsHistory: () =>
    api.get('/points-history'),

  getGamePlays: () =>
    api.get('/game-plays'),

  // ================= VOUCHERS =================
  getVouchers: () =>
    adminApi.get('/api/admin/vouchers'),

  createVoucher: (data: Record<string, unknown>) =>
    adminApi.post('/api/admin/vouchers', data),

  updateVoucher: (voucherId: string, data: Record<string, unknown>) =>
    adminApi.put(`/api/admin/vouchers/${voucherId}`, data),

  deleteVoucher: (voucherId: string) =>
    adminApi.delete(`/api/admin/vouchers/${voucherId}`),

  uploadVoucherImage: (formData: FormData) =>
    adminApi.post('/api/admin/vouchers/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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