'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Bell, Users, Trash2, RefreshCw, Search, History, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationHistory {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    recipientCount: number;
    isBroadcast: boolean;
    user?: {
        email: string;
        fullName: string;
    };
}

export default function AdminNotificationsPage() {
    // Form State
    const [email, setEmail] = useState('');
    const [isBroadcast, setIsBroadcast] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    // History State
    const [history, setHistory] = useState<NotificationHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [filterEmail, setFilterEmail] = useState('');

    // Fetch History
    const fetchHistory = async (targetEmail?: string) => {
        setLoadingHistory(true);
        try {
            const params = new URLSearchParams();
            if (targetEmail) params.append('email', targetEmail);
            
            const res = await axios.get(`/api/v1/admin/notifications/send?${params.toString()}`);
            if (res.data.success) {
                setHistory(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load history");
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            await axios.post('/api/v1/admin/notifications/send', {
                targetEmail: isBroadcast ? undefined : email,
                broadcast: isBroadcast,
                title,
                body
            });
            toast.success(isBroadcast ? 'Broadcast Sent!' : 'Notification Sent!');
            setBody(''); 
            fetchHistory(isBroadcast ? undefined : email);
        } catch (error) {
            toast.error('Failed to send.');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!confirm("Are you sure? If this was a broadcast, it will be deleted for ALL users.")) return;
        try {
            await axios.delete(`/api/v1/admin/notifications/send?id=${id}`);
            // Optimistic update: remove from list immediately
            setHistory(prev => prev.filter(n => n.id !== id));
            toast.success("Deleted");
        } catch (error) {
            toast.error("Failed to delete");
            fetchHistory(); // Re-fetch on error to ensure sync
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
                    <Bell className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
                    <p className="text-gray-500">Manage push alerts and view communication history.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: SEND FORM */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Send className="w-4 h-4" /> Compose
                        </h2>
                        
                        <form onSubmit={handleSend} className="space-y-4">
                            <div 
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isBroadcast ? 'bg-[#D4AF37]/10 border-[#D4AF37]' : 'bg-gray-50 border-gray-200'}`} 
                                onClick={() => setIsBroadcast(!isBroadcast)}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${isBroadcast ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-white border-gray-400'}`}>
                                    {isBroadcast && <Users className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-sm font-medium text-gray-700 select-none">Broadcast to All</span>
                            </div>

                            {!isBroadcast && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Email</label>
                                    <input 
                                        type="email" 
                                        required={!isBroadcast}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                        placeholder="customer@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                    placeholder="e.g., Flash Sale!"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Message Body</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#D4AF37] outline-none"
                                    placeholder="Type your alert here..."
                                    value={body}
                                    onChange={e => setBody(e.target.value)}
                                />
                            </div>
                            
                            {/* FIX: Added before:content-none to prevent style.css interference */}
                            <button 
                                type="submit" 
                                disabled={sending}
                                className="w-full bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-[#b8952b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 before:content-none after:content-none"
                            >
                                {sending ? 'Sending...' : <><Send className="w-4 h-4" /> Send Now</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: HISTORY LIST */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <History className="w-4 h-4" /> Recent Activity
                            </h2>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter by email..." 
                                        className="pl-9 pr-3 py-2 text-sm border rounded-lg w-full focus:outline-none focus:border-[#D4AF37]"
                                        value={filterEmail}
                                        onChange={(e) => setFilterEmail(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchHistory(filterEmail)}
                                    />
                                </div>
                                <button 
                                    onClick={() => fetchHistory(filterEmail)}
                                    className="p-2 bg-white border rounded-lg hover:bg-gray-50 text-gray-600"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <div className="divide-y max-h-[600px] overflow-y-auto">
                            {loadingHistory ? (
                                <div className="p-8 text-center text-gray-500">Loading history...</div>
                            ) : history.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No notifications found.</div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    {/* Show Broadcast Badge */}
                                                    {(item.isBroadcast || item.recipientCount > 1) && (
                                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Megaphone className="w-3 h-3" /> Broadcast
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{item.body}</p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                                                    <span>•</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                        {item.isBroadcast || item.recipientCount > 1 
                                                            ? `Sent to All (${item.recipientCount} users)` 
                                                            : item.user?.email || 'Unknown User'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* FIX: Removed opacity-0 to make button always visible */}
                                            <button 
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2"
                                                title="Delete Notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}