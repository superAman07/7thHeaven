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
  Crown,
  Sparkles,
  Tag // Imported Tag icon for the new input
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {

  const [minPurchase, setMinPurchase] = useState('');
  const [maxClubPrice, setMaxClubPrice] = useState(''); // 1. New State
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
      if (settingsRes.data.success) {
        setMinPurchase(settingsRes.data.value);
        // 2. Load existing Max Price from API
        setMaxClubPrice(settingsRes.data.maxClubPrice || 4000); 
      }

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
      // 3. Save both settings
      await axios.post('/api/v1/settings', { 
        minPurchase,
        maxClubProductPrice: maxClubPrice 
      }, { withCredentials: true });
      alert('Settings updated successfully!');
    } catch (error) {
      alert('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Floating Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#E6B422] rounded-full blur-3xl " style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl " style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>

      {/* Header Section */}
      <div className="relative mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-8" style={{ borderBottom: '2px solid rgba(212, 175, 55, 0.2)' }}>
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-linear-to-br from-[#E6B422] to-[#F4D03F] shadow-lg shadow-[#E6B422]/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.3em] bg-linear-to-r from-[#E6B422] to-[#F4D03F] bg-clip-text text-transparent">Premium Admin Panel</span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>Dashboard</h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6B422]" />
            Strategic overview of your luxury marketplace
          </p>
        </div>
        <div className="hidden md:block animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative px-5 py-3 rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-linear-to-r from-black via-gray-800 to-black group-hover:scale-105 transition-transform duration-500"></div>
            <div className="relative flex items-center gap-3 text-white">
              <div className="w-2 h-2 rounded-full bg-[#E6B422] animate-pulse shadow-lg shadow-[#E6B422]/50"></div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">System Live</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stat Cards Grid */}
      <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-4! gap-6! mb-8!">
        <StatCard 
          label="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag className="w-7 h-7" />}
          gradient="from-[#E6B422] to-[#F4D03F]"
          delay="0s"
          link="/celsius-7th-heaven/orders"
        />
        <StatCard 
          label="Total Revenue" 
          value={`₹${Math.round(stats.totalRevenue).toLocaleString()}`} 
          icon={<DollarSign className="w-7 h-7" />}
          gradient="from-purple-500 to-purple-700"
          delay="0.1s"
        />
        <StatCard 
          label="Product Inventory" 
          value={stats.totalProducts} 
          icon={<Package className="w-7 h-7" />}
          gradient="from-blue-500 to-blue-700"
          delay="0.2s"
          link="/celsius-7th-heaven/products"
        />
        <StatCard 
          label="Elite Club Members" 
          value={stats.activeClubMembers}
          icon={<Users className="w-7 h-7" />}
          gradient="from-green-500 to-emerald-600"
          delay="0.3s"
          link="/celsius-7th-heaven/network"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="p-6 border-b border-gray-100/50 flex justify-between items-center bg-linear-to-r from-gray-50/50 to-white/30">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-linear-to-b from-[#E6B422] to-[#F4D03F] rounded-full shadow-lg shadow-[#E6B422]/30"></div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Recent Transactions</h2>
                </div>
                <Link href="/celsius-7th-heaven/orders" className="text-xs font-black text-[#E6B422] hover:text-purple-600 transition-colors flex! items-center! gap-2 uppercase tracking-widest group px-4 py-2 rounded-lg hover:bg-[#E6B422]/10">
                    View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }} className="text-white">
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Reference</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Customer</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Investment</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {recentOrders.length > 0 ? recentOrders.map((order, idx) => (
                            <tr key={order.id} className="hover:bg-linear-to-r hover:from-[#E6B422]/5 hover:to-transparent transition-all group animate-fade-in" style={{ animationDelay: `${0.5 + idx * 0.05}s` }}>
                                <td className="px-6 py-5 font-black text-gray-900 text-sm">
                                  <span className="px-3 py-1 bg-gray-100 rounded-lg group-hover:bg-[#E6B422]/10 transition-colors">
                                    #{order.id.slice(-6).toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-sm font-bold text-gray-700">{order.user?.fullName || 'Anonymous Patron'}</span>
                                </td>
                                <td className="px-6 py-5">
                                  <span className="text-base font-black bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">₹{order.subtotal.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <StatusPill status={order.paymentStatus} />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                              <td colSpan={4} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center gap-3 opacity-40">
                                  <Package className="w-12 h-12 text-gray-400" />
                                  <p className="font-bold text-gray-400 italic tracking-tight">No recent transactions detected</p>
                                </div>
                              </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {/* Vault Controls Card */}
          <div className="relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 overflow-hidden group">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6B422] rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <Settings2 className="absolute bottom-4 left-4 w-32 h-32 text-gray-900 opacity-10 group-hover:rotate-45 transition-transform duration-700" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-linear-to-br from-[#E6B422] to-[#F4D03F] shadow-lg shadow-[#E6B422]/30 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Vault Controls</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-6">
                  
                  {/* Min Purchase Level */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                      Minimum Spending to Join Club
                    </label>
                    <div className="relative group/input">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#E6B422] font-black text-2xl group-hover/input:scale-110 transition-transform">₹</span>
                      <input 
                          type="number" 
                          value={minPurchase}
                          onChange={(e) => setMinPurchase(e.target.value)}
                          className="w-full pl-14 pr-5 py-4 bg-linear-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl font-black text-xl text-gray-900 focus:border-[#E6B422] focus:ring-4 focus:ring-[#E6B422]/10 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                          placeholder="2000"
                      />
                    </div>
                  </div>

                  {/* 4. New Input: Max Product Price for Display */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                       Max Price for Club Products
                    </label>
                    <div className="relative group/input">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-500 font-black text-2xl group-hover/input:scale-110 transition-transform">
                         <Tag className="w-5 h-5" />
                      </span>
                      <input 
                          type="number" 
                          value={maxClubPrice} // Connected State
                          onChange={(e) => setMaxClubPrice(e.target.value)}
                          className="w-full pl-14 pr-5 py-4 bg-linear-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl font-black text-xl text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                          placeholder="4000"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button 
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="relative w-full px-6 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 mt-2"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-black via-gray-800 to-black group-hover/btn:scale-105 transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-[#E6B422] via-[#F4D03F] to-[#E6B422] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 text-white text-sm flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Settings2 className="w-4 h-4" />
                          Update Limits
                        </>
                      )}
                    </span>
                  </button>
                  
                </div>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic px-2 text-center">
                  * Entry threshold gates access. <br/> * Price limit forces max price for products shown on club page.
                </p>
              </div>
            </div>
          </div>

          {/* Concierge Help Card */}
          <div className="relative p-6 rounded-3xl overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-linear-to-br from-[#E6B422] via-[#F4D03F] to-[#E6B422] group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute inset-0 bg-linear-to-br from-purple-600 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative z-10 flex items-center justify-between text-white">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-90">Support</p>
                <h4 className="font-black text-xl">Concierge Help</h4>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:translate-x-2 group-hover:rotate-45 transition-all duration-500 bg-white/10 backdrop-blur-sm">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated StatCard with Dynamic Links
const StatCard = ({ label, value, icon, gradient, delay, link }: any) => {
  const getValueSize = (val: string | number) => {
      const strVal = String(val);
      if (strVal.length > 9) return 'text-xl';
      if (strVal.length > 6) return 'text-2xl';
      return 'text-3xl';
  };

  const Content = () => (
    <div 
        className={`relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/20 flex items-center gap-5 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in ${link ? 'cursor-pointer hover:bg-white/90' : ''}`}
        style={{ animationDelay: delay }}
    >
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
        
        <div className={`relative p-4 rounded-2xl bg-linear-to-br ${gradient} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg shrink-0`}
                style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
            <div className="text-white">{icon}</div>
            <div className="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-500"></div>
        </div>
        
        <div className="relative z-10 min-w-0">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 truncate">{label}</p>
            <h3 className={`${getValueSize(value)} font-black font-serif! text-gray-900 tracking-tight group-hover:scale-105 transition-transform origin-left truncate`} 
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {value}
            </h3>
        </div>

        <div className={`absolute top-0 right-0 w-20 h-20 bg-linear-to-bl ${gradient} opacity-5 rounded-bl-full pointer-events-none`}></div>
        
        {link && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
        )}
    </div>
  );

  if (link) {
      return <Link href={link} className="block w-full">{Content()}</Link>;
  }
  
  return Content();
};

// Updated StatusPill with Modern Design
const StatusPill = ({ status }: { status: string }) => {
  const isPaid = status?.toUpperCase() === 'PAID';
  const isPending = status?.toUpperCase() === 'PENDING';
  
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        isPaid 
          ? 'bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' 
          : isPending 
            ? 'bg-linear-to-r from-[#E6B422] to-[#F4D03F] text-white shadow-lg shadow-[#E6B422]/30' 
            : 'bg-linear-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
    }`}>
        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
        {status || 'UNKNOWN'}
    </span>
  );
};

// Add this to your global CSS or create a <style> tag
const styles = `
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
  opacity: 0;
}
`;