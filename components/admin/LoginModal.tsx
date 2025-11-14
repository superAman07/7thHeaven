'use client';

import React, { useState, FormEvent } from 'react';
import axios from 'axios';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/v1/admin/login', { email, password });
      if (response.data.success) {
        onLoginSuccess();
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Admin Access</h2>
        <p className="text-center text-gray-500 mb-6">Please sign in to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};