'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  ArrowRight,
  Settings2,
  Crown
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {

  const [minPurchase, setMinPurchase] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeClubMembers: 0 
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const settingsRes = await axios.get('/api/v1/settings');
      if (settingsRes.data.success) setMinPurchase(settingsRes.data.value);

      const ordersRes = await axios.get('/api/v1/admin/orders?limit=5'); 
      if (ordersRes.data.success) {
        setRecentOrders(ordersRes.data.data || []);
      }

      const statsRes = await axios.get('/api/v1/admin/stats');
      if (statsRes.data.success) {
        const { revenue, orders, products, members } = statsRes.data.data;
        setStats({
            totalRevenue: revenue,
            totalOrders: orders,
            totalProducts: products,
            activeClubMembers: members
        });
      }

    } catch (error) {
      console.error("Dashboard fetch error", error);
    }
  };

  const handleSaveSettings = async () => {
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
    <div className="min-h-screen  p-4 md:p-8 font-sans">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Premium Admin Panel</span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter">Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Strategic overview of your luxury marketplace performance.</p>
        </div>
        <div className="hidden md:block">
          <div className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></div>
            SYSTEM LIVE
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          label="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="w-6 h-6" />} 
        />
        <StatCard 
          label="Total Revenue" 
          value={`₹ ${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign className="w-6 h-6" />} 
        />
        <StatCard 
          label="Product Inventory" 
          value={stats.totalProducts} 
          icon={<Package className="w-6 h-6" />} 
        />
        <StatCard 
          label="Elite Club Members" 
          value={stats.activeClubMembers}
          icon={<Users className="w-6 h-6" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                  <h2 className="text-lg font-black text-black uppercase tracking-tight">Recent Transactions</h2>
                </div>
                <Link href="/admin/orders" className="text-xs font-black text-[#D4AF37] hover:text-black transition-colors flex items-center gap-1 uppercase tracking-widest group">
                    View All Activity <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black text-white">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Reference</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Customer</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Investment</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-5 font-black text-black text-sm">
                                  #{order.id.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-sm font-bold text-gray-700">{order.user?.fullName || 'Anonymous Patron'}</span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-sm font-black text-black">₹{order.subtotal}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <StatusPill status={order.paymentStatus} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold italic tracking-tight">
                                No recent transactions detected in the vault.
                              </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-black relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Settings2 className="w-24 h-24 text-black" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#D4AF37] text-white rounded-lg">
                  <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-black uppercase tracking-tight">Vault Controls</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Elite Club Entry Threshold
                </label>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] font-black text-lg">₹</span>
                    <input 
                        type="number" 
                        value={minPurchase}
                        onChange={(e) => setMinPurchase(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-black text-xl text-black focus:border-[#D4AF37] focus:bg-white outline-none transition-all placeholder:text-gray-200"
                        placeholder="2000"
                    />
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="w-full bg-black text-white px-6 py-4 rounded-xl hover:bg-[#D4AF37] transition-all disabled:opacity-50 text-sm font-black uppercase tracking-[0.2em] shadow-lg active:scale-95"
                  >
                    {loading ? 'Processing...' : 'Secure Settings'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-4 leading-relaxed italic">
                  * Clients exceeding this investment threshold gain immediate access to the 7th Heaven Elite Circle.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#D4AF37] p-6 rounded-2xl text-white flex items-center justify-between group cursor-pointer hover:bg-black transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Support</p>
              <h4 className="font-black text-lg">Concierge Help</h4>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon }: any) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 group hover:border-[#D4AF37] transition-all duration-300">
        <div className="p-4 bg-black text-[#D4AF37] rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-black/5">
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
            <h3 className="text-2xl font-black text-black mt-0.5 tracking-tight group-hover:text-[#D4AF37] transition-colors">{value}</h3>
        </div>
    </div>
  );
};

const StatusPill = ({ status }: { status: string }) => {
  const isPaid = status?.toUpperCase() === 'PAID';
  const isPending = status?.toUpperCase() === 'PENDING';
  
  return (
    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
        isPaid ? 'bg-black text-white border-black' : 
        isPending ? 'bg-[#D4AF37] text-white border-[#D4AF37]' : 'bg-red-50 text-red-600 border-red-100'
    }`}>
        {status || 'UNKNOWN'}
    </span>
  );
};
