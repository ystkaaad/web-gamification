/**
 * Google Apps Script API contract (frontend → GAS → MySQL).
 * Base URL: VITE_GAS_URL (Web App deployed as "Anyone").
 */
import { API_URL } from './api';

export const GAS_BASE_URL = API_URL;

export const GAS_ENDPOINTS = {
  missions: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=Missions`, mysqlTable: 'missions' },
    create: { method: 'POST' as const, url: API_URL, body: { action: 'CREATE', sheetName: 'Missions' }, mysqlTable: 'missions' },
    update: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE', sheetName: 'Missions' }, mysqlTable: 'missions' },
    delete: { method: 'POST' as const, url: API_URL, body: { action: 'DELETE_DATA', sheetName: 'Missions' }, mysqlTable: 'missions' },
  },
  vouchers: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=Vouchers`, mysqlTable: 'vouchers' },
    create: { method: 'POST' as const, url: API_URL, body: { action: 'CREATE', sheetName: 'Vouchers' }, mysqlTable: 'vouchers' },
    update: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE', sheetName: 'Vouchers' }, mysqlTable: 'vouchers' },
    delete: { method: 'POST' as const, url: API_URL, body: { action: 'DELETE_DATA', sheetName: 'Vouchers' }, mysqlTable: 'vouchers' },
  },
  games: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=Games`, mysqlTable: 'games' },
    create: { method: 'POST' as const, url: API_URL, body: { action: 'CREATE', sheetName: 'Games' }, mysqlTable: 'games' },
    update: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE', sheetName: 'Games' }, mysqlTable: 'games' },
    delete: { method: 'POST' as const, url: API_URL, body: { action: 'DELETE_DATA', sheetName: 'Games' }, mysqlTable: 'games' },
  },
  users: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=UserGamification`, mysqlTable: 'user_gamification' },
    create: { method: 'POST' as const, url: API_URL, body: { action: 'CREATE', sheetName: 'UserGamification' }, mysqlTable: 'user_gamification' },
    update: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE', sheetName: 'UserGamification' }, mysqlTable: 'user_gamification' },
    delete: { method: 'POST' as const, url: API_URL, body: { action: 'DELETE', sheetName: 'UserGamification' }, mysqlTable: 'user_gamification' },
  },
  points: {
    update: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE_POINTS' }, mysqlTable: 'points_history + user_gamification' },
    add: { method: 'POST' as const, url: API_URL, body: { action: 'ADD_POINTS' }, mysqlTable: 'points_history + user_gamification' },
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=PointsHistory`, mysqlTable: 'points_history' },
  },
  missionProgress: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=UserMissions`, mysqlTable: 'user_missions' },
    complete: { method: 'POST' as const, url: API_URL, body: { action: 'UPDATE_MISSION', sheetName: 'MissionProgress' }, mysqlTable: 'user_missions' },
  },
  redemptions: {
    list: { method: 'GET' as const, url: `${API_URL}?action=GET_DATA&sheetName=VoucherHistory`, mysqlTable: 'voucher_history' },
    redeem: { method: 'POST' as const, url: API_URL, body: { action: 'REDEEM_VOUCHER', sheetName: 'Vouchers' }, mysqlTable: 'voucher_history' },
  },
  dailyStreak: {
    checkIn: { method: 'POST' as const, url: API_URL, body: { action: 'dailyCheckIn', sheetName: 'UserGamification' }, mysqlTable: 'user_gamification' },
  },
  gamePlays: {
    record: { method: 'POST' as const, url: API_URL, body: { action: 'PLAY_GAME', sheetName: 'GamePlays' }, mysqlTable: 'game_plays' },
    cooldown: { method: 'POST' as const, url: API_URL, body: { action: 'CHECK_GAME_COOLDOWN', sheetName: 'GamePlays' }, mysqlTable: 'game_plays' },
  },
  stats: {
    get: { method: 'GET' as const, url: `${API_URL}?action=GET_STATS`, mysqlTable: 'aggregated' },
    getAll: { method: 'GET' as const, url: `${API_URL}?action=GET_ALL`, mysqlTable: 'multiple' },
  },
} as const;
