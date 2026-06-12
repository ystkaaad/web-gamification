/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

import { API_URL } from '../config/api';

interface LoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'ADMIN_LOGIN',
          payload: {
            username: username.trim(),
            password: password.trim()
          }
        })
      });

      const textResponse = await response.text();
      let result;
      
      try {
        result = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('Parse Error:', parseError, textResponse);
        throw new Error('Gagal memproses respon dari server.');
      }
      
      if (result.success) {
        // 1. Simpan token ke localStorage sebagai adminToken
        const token = result.token || 'auth_token_active';
        localStorage.setItem('adminToken', token);
        
        // 2. Beri Feedback Visual
        toast.success('Login Berhasil! Mengalihkan ke Dashboard...');
        
        // 3. Update State Global di App.tsx (Memicu render ulang dashboard)
        if (onLoginSuccess) {
          onLoginSuccess(token);
        }
        
        // 4. Navigasi menggunakan react-router-dom
        setTimeout(() => {
          navigate('/');
        }, 500);
        
      } else {
        const msg = result.message || 'Login gagal. Periksa kredensial Anda.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan koneksi ke server.');
      toast.error('Gagal terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-premium)] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-transparent">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--accent-premium)] mb-6 shadow-xl shadow-orange-200">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-premium)] tracking-tighter mb-2">
            GAMIFY<span className="text-[var(--accent-premium)]">ADMIN</span>
          </h1>
          <p className="text-[var(--text-muted-premium)] font-bold uppercase text-[10px] tracking-[0.2em]">Sistem Manajemen Pusat Gamifikasi</p>
        </div>

        <div className="premium-card p-10 relative overflow-hidden group border-2 border-[var(--border-premium)]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-24 h-24 text-[var(--accent-premium)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 text-sm font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-[var(--text-muted-premium)] uppercase tracking-[0.2em] ml-1">Kredensial Akses</label>
              <div className="space-y-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-bold shadow-inner"
                  placeholder="Username"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-orange-50/30 border border-orange-100 rounded-2xl px-5 py-4 outline-none focus:border-orange-400 focus:bg-white transition-all text-sm font-bold shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-[11px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Otentikasi Masuk</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-orange-200 text-xs font-black uppercase tracking-[0.3em]">
          E-SECURE PROTECTED
        </p>
      </motion.div>
    </div>
  );
}
