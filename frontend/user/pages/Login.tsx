import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('TOMBOL LOGIN DIKLIK');

    try {
      // App.tsx akan merespons perubahan state user dan meredirect ke dashboard otomatis
      await login(email, password);
      
      console.log('Login berhasil');
      console.log('Token:', localStorage.getItem('token'));
      console.log('User:', localStorage.getItem('ngolabify_user_v1'));
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    // Latar belakang dengan nuansa pastel yang lebih luwes dan organik
    <div className="min-h-screen flex items-center justify-center bg-orange-50 relative overflow-hidden font-sans p-4">
      
      {/* Efek Latar Belakang (Organic Blobs) yang mengambang dan menyatu */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
      <div className="absolute top-0 -right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-10 left-20 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Kartu Utama: Fluid Glassmorphism */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-2xl rounded-[3rem] p-8 sm:p-12 shadow-[0_20px_60px_-15px_rgba(251,146,60,0.25)] border border-white/80 mt-8">
        
        {/* Ikon Header Mengambang di Luar Kartu */}
        <div className="flex justify-center -mt-20 mb-6">
          <div className="w-24 h-24 bg-gradient-to-tr from-orange-400 to-orange-300 rounded-[2.5rem] shadow-xl shadow-orange-300/40 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500 border-4 border-white">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Teks Sambutan yang Lebih Ramah */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Selamat Datang!</h2>
          <p className="text-slate-500 mt-2 font-medium">Yuk, masuk untuk melanjutkan perjalananmu.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input Email Kapsul */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
            </div>
            <input
              type="email"
              placeholder="Email kamu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-full focus:outline-none focus:border-orange-300 shadow-sm transition-all text-slate-700 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Input Password Kapsul */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-orange-400 group-focus-within:text-orange-600 transition-colors" />
            </div>
            <input
              type="password"
              placeholder="Kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-4 bg-white border-2 border-transparent rounded-full focus:outline-none focus:border-orange-300 shadow-sm transition-all text-slate-700 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Tombol Submit Melingkar */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 mt-8 rounded-full flex items-center justify-center gap-3 text-white font-bold text-lg transition-all duration-300 ${
              isLoading 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-lg shadow-orange-400/40 hover:shadow-orange-500/50 transform hover:-translate-y-1'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                Masuk Sekarang <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;