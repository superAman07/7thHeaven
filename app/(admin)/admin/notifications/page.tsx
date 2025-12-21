'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bell, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
    const [email, setEmail] = useState('');
    const [isBroadcast, setIsBroadcast] = useState(false); // New State
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/v1/admin/notifications/send', {
                targetEmail: isBroadcast ? undefined : email,
                broadcast: isBroadcast,
                title,
                body
            });
            toast.success(isBroadcast ? 'Broadcast Sent Successfully!' : 'Notification Sent!');
            setBody(''); 
        } catch (error) {
            toast.error('Failed to send.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
                    <Bell className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Push Notifications</h1>
                    <p className="text-gray-500">Send alerts to specific users or broadcast to everyone.</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSend} className="space-y-4">
                    
                    {/* Broadcast Toggle */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer" onClick={() => setIsBroadcast(!isBroadcast)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isBroadcast ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-white border-gray-400'}`}>
                            {isBroadcast && <Users className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700 select-none">Send to All Users (Broadcast)</span>
                    </div>

                    {!isBroadcast && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target User Email</label>
                            <input 
                                type="email" 
                                required={!isBroadcast}
                                className="w-full p-2 border rounded-lg"
                                placeholder="customer@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g., Special Offer!"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea 
                            required
                            rows={4}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Type your message here..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#D4AF37] text-white py-3 rounded-lg font-bold hover:bg-[#b8952b] transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Sending...' : <><Send className="w-4 h-4" /> {isBroadcast ? 'Send Broadcast' : 'Send Notification'}</>}
                    </button>
                </form>
            </div>
        </div>
    );
}