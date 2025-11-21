'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [minPurchase, setMinPurchase] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/v1/settings').then(res => {
      if (res.data.success) setMinPurchase(res.data.value);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post('/api/v1/settings', { minPurchase }, { withCredentials: true });
      alert('Settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 7th Heaven Club Settings Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">
            7th Heaven Club Configuration
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Minimum Purchase Amount (Rs.)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Users must spend at least this amount to see the option to join the club.
            </p>
            <div className="flex gap-4">
              <input 
                type="number" 
                value={minPurchase}
                onChange={(e) => setMinPurchase(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 outline-none"
                placeholder="e.g. 2000"
              />
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for future stats */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 opacity-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sales Overview</h2>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
}