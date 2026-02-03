'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Shield, Zap, Mail, Network, TreeDeciduous, Send, Smartphone, X, Package, MapPin, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import NetworkGalaxy, { NetworkNode } from '@/components/heaven/NetworkGalaxy'; 
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
    name: string;
    quantity: number;
}
interface CustomerOrder {
    id: string;
    createdAt: string;
    subtotal: string;
    status: string;
    items: OrderItem[]; 
}
interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  is7thHeaven: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  lifetimeSpend: string;
  referralCode: string;
  networkSize: number;
  orders: CustomerOrder[];
  address: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'vip' | 'user'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkData, setNetworkData] = useState<NetworkNode | null>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ids: string[], name: string} | null>(null);

  // Profile Sidebar State
  const [selectedProfile, setSelectedProfile] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get('/api/v1/admin/customers'); 
      setCustomers(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load citizens");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNetwork = async (user: Customer) => {
    setShowNetworkModal(true);
    setLoadingNetwork(true);
    setNetworkData(null); 
    try {
        const res = await axios.get(`/api/v1/network/graph?targetUserId=${user.id}`);
        if(res.data.success) setNetworkData(res.data.data);
        else toast.error("Failed to load network.");
    } catch (error) {
        toast.error("Could not fetch user network.");
    } finally {
        setLoadingNetwork(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (c.isAdmin) return false;
    
    if (statusFilter === 'blocked' && !c.isBlocked) return false;
    if (statusFilter === 'vip' && !c.is7thHeaven) return false;
    if (statusFilter === 'user' && (c.is7thHeaven || c.isBlocked)) return false;
    
    return (
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  });
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(customers.map(c => c.id));
    else setSelectedIds([]);
  };

  const handleSelectUser = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    setBlockingUserId(userId);
    try {
      const res = await axios.patch(`/api/v1/admin/customers/${userId}`, {
        isBlocked: !currentlyBlocked
      });
      if (res.data.success) {
        toast.success(currentlyBlocked ? 'User unblocked!' : 'User blocked!');
        fetchCustomers();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user status');
    } finally {
      setBlockingUserId(null);
    }
  };

  const handleUpgradeToVIP = async (userId: string) => {
    if(!confirm("Are you sure you want to upgrade this user to 7th Heaven Club?")) return;
    
    try {
        const res = await axios.patch(`/api/v1/admin/customers/${userId}`, { is7thHeaven: true });
        if (res.data.success) {
            toast.success("User upgraded to VIP!");
            fetchCustomers();
            setSelectedProfile(null);
        }
    } catch (error) {
        toast.error("Failed to upgrade user");
    }
  };

  return (
    <div className="p-6 relative min-h-screen">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-black text-gray-800 tracking-tight">Citizens Registry</h1>
           <p className="text-gray-500 text-sm">Manage access, view networks, and communicate.</p>
        </div>
        
        {/* Status Legend */}
         <div className="flex gap-4 items-center">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ddb040]"
            >
              <option value="all">All Users</option>
              <option value="blocked">🚫 Blocked</option>
              <option value="vip">⚡ VIP Only</option>
              <option value="user">👤 Regular Users</option>
            </select>
            <div className="flex gap-4 text-xs font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ddb040]"></span> VIP</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Blocked</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span> User</div>
            </div>
          </div>
      </div>
      
      {/* SEARCH & ACTIONS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50 justify-between items-center">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search citizens..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ddb040]"
                />
            </div>
             {selectedIds.length > 0 && (
                <button 
                    onClick={() => { setMessageTarget({ids: selectedIds, name: `${selectedIds.length} Citizens`}); setShowMessageModal(true); }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Mail size={16} /> Send Message ({selectedIds.length})
                </button>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                    <tr>
                        <th className="px-6 py-4 w-10">
                            <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === customers.length && customers.length > 0} className="rounded border-gray-300 text-[#ddb040] focus:ring-[#ddb040]" />
                        </th>
                        <th className="px-6 py-4">Citizen</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Network</th>
                        <th className="px-6 py-4">Spent</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-12">
                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Loading citizens...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => setSelectedProfile(customer)}>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.includes(customer.id)}
                                    onChange={() => handleSelectUser(customer.id)}
                                    className="rounded border-gray-300 text-[#ddb040] focus:ring-[#ddb040]" 
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${customer.isAdmin ? 'bg-purple-600' : customer.is7thHeaven ? 'bg-linear-to-br from-[#ddb040] to-amber-600' : 'bg-gray-400'}`}>
                                        {customer.fullName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{customer.fullName}</div>
                                        <div className="text-xs text-gray-400">{customer.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {customer.isBlocked ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                        <Ban size={10} className="mr-1" /> Blocked
                                    </span>
                                ) : customer.isAdmin ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                        <Shield size={10} className="mr-1" /> Admin
                                    </span>
                                ) : customer.is7thHeaven ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        <Zap size={10} className="mr-1 fill-amber-500" /> VIP
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                        User
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleBlock(customer.id, customer.isBlocked); }}
                                    disabled={blockingUserId === customer.id}
                                    className={`p-2 rounded-full transition-colors disabled:opacity-50 ${customer.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                                    title={customer.isBlocked ? 'Unblock User' : 'Block User'}
                                >
                                    {blockingUserId === customer.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : customer.isBlocked ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <Ban size={18} />
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-gray-800 text-xs">
                                ₹{parseFloat(customer.lifetimeSpend).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-start gap-1">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleToggleBlock(customer.id, customer.isBlocked); }}
                                    className={`p-2 rounded-full transition-colors ${customer.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50 hover:text-red-600'}`}
                                    title={customer.isBlocked ? 'Unblock User' : 'Block User'}
                                >
                                    {customer.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setMessageTarget({ ids: [customer.id], name: customer.fullName }); setShowMessageModal(true); }}
                                    className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    <Mail size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- PROFILE SIDEBAR --- */}
      <AnimatePresence>
        {selectedProfile && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedProfile(null)}
                    className="fixed inset-0 bg-black/40 z-60 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-white z-70 shadow-2xl overflow-y-auto border-l border-gray-100"
                >
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg ${selectedProfile.isAdmin ? 'bg-purple-600' : selectedProfile.is7thHeaven ? 'bg-[#ddb040]' : 'bg-gray-800'}`}>
                                    {selectedProfile.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl! font-bold! text-gray-900!">{selectedProfile.fullName}</h2>
                                    <div className="text-xs text-gray-400 font-mono mt-0.5 flex items-center gap-2">
                                        <span className="font-bold! text-gray-300 text-[10px]! uppercase! tracking-wider! bg-gray-50! px-1! rounded!">ID</span>
                                        <span>{selectedProfile.id}</span>
                                    </div>
                                    <div className="mt-1 flex gap-2">
                                        {selectedProfile.is7thHeaven && <span className="text-[10px]! font-bold! bg-[#ddb040]/10! text-[#ddb040]! px-2! py-0.5! rounded!">VIP MEMBER</span>}
                                        <span className="text-[10px]! font-bold! bg-gray-100! text-gray-500! px-2! py-0.5! rounded!">Joined {new Date(selectedProfile.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Contact Details</h3>
                             <div className="flex items-center gap-3 text-sm text-gray-700">
                                <Mail size={16} className="text-gray-400" /> {selectedProfile.email}
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-700">
                                <Smartphone size={16} className="text-gray-400" /> {selectedProfile.phone}
                             </div>
                             <div className="flex items-center gap-3 text-sm text-gray-700">
                                <MapPin size={16} className="text-gray-400" /> {selectedProfile.address}
                             </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Total Spent</div>
                                <div className="text-xl font-black text-gray-900">₹{parseFloat(selectedProfile.lifetimeSpend).toLocaleString()}</div>
                            </div>
                            <div className="border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-xs text-gray-400 font-bold uppercase mb-1">Referrals</div>
                                <div className="text-xl font-black text-blue-600">{selectedProfile.networkSize}</div>
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Package size={16}/> Recent Orders</h3>
                        <div className="space-y-3">
                            {selectedProfile.orders && selectedProfile.orders.length > 0 ? selectedProfile.orders.map(order => (
                                <div key={order.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-mono font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            Order #{order.id.slice(-6)}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-xs text-gray-600">
                                            {Array.isArray(order.items) && order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ').slice(0, 40)}...
                                        </div>
                                        <span className="font-bold text-sm">₹{order.subtotal}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-gray-400 text-sm">No orders found.</div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 grid! grid-cols-2! gap-3!">
                             <button onClick={() => { handleOpenNetwork(selectedProfile); }} className="w-full py-3 rounded-lg border border-blue-100 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors flex! items-center! justify-center! gap-2!">
                                <Network size={16} /> View Network
                             </button>
                             <button onClick={() => { setMessageTarget({ ids: [selectedProfile.id], name: selectedProfile.fullName }); setShowMessageModal(true); }} className="w-full py-3 rounded-lg bg-gray-900 text-white font-bold text-sm hover:bg-black transition-colors flex! items-center! justify-center! gap-2!">
                                <Send size={16} /> Send Message
                             </button>
                             {!selectedProfile.is7thHeaven && (
                                <button 
                                    onClick={() => handleUpgradeToVIP(selectedProfile.id)}
                                    className="col-span-2 w-full py-3 rounded-lg bg-linear-to-r from-[#ddb040] to-amber-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex! items-center! justify-center! gap-2! shadow-lg"
                                >
                                    <Zap size={16} fill="currentColor" /> Grant 7th Heaven Access
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      <NetworkGalaxy isOpen={showNetworkModal} onClose={() => setShowNetworkModal(false)} data={networkData} />
      
      {/* Messages Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
                <h3 className="font-bold mb-4">Send Message</h3>
                <p className="text-sm text-gray-500 mb-4">To: {messageTarget?.name}</p>
                <textarea className="w-full border rounded-lg p-2 h-32 mb-4" placeholder="Message content..."></textarea>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowMessageModal(false)} className="px-4 py-2 text-gray-500 text-sm">Cancel</button>
                    <button onClick={() => { toast.success("Message sent!"); setShowMessageModal(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold">Send</button>
                </div>
             </div>
        </div>
      )}

    </div>
  );
}