/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// GANTI URL DI BAWAH INI DENGAN URL WEB APP ANDA (DEPLOYMENT -> EXEC)
const HARDCODED_URL = "https://script.google.com/macros/s/AKfycbx1GySSVVaX00-sPdiG0oy_TRmT5x6KgeoZLHqdiN8yvob8CVEsMYsk7BArpQF5MzQN/exec";

export const API_URL = (import.meta as any).env?.VITE_GAS_URL || HARDCODED_URL;