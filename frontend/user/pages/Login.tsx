import React, { useState } from 'react';
import { useApp } from '../AppContext';

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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '350px',
          padding: '30px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2
          style={{
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          Login Member
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxSizing: 'border-box',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '20px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxSizing: 'border-box',
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {isLoading ? 'Memproses...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;