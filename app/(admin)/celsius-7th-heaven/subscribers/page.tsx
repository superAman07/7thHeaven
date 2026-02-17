'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Send, Trash2, Users, CheckCircle, Clock } from 'lucide-react';

interface Subscriber {
    id: string;
    email: string;
    collectionSlug: string | null;
    source: string;
    isNotified: boolean;
    createdAt: string;
}

interface CollectionSummary {
    total: number;
    notified: number;
    pending: number;
}

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [summary, setSummary] = useState<Record<string, CollectionSummary>>({});
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get('/api/v1/notify-me');
            if (res.data.success) {
                setSubscribers(res.data.data);
                setSummary(res.data.summary || {});
            }
        } catch {
            toast.error('Failed to load subscribers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleSendNotification = async (collectionSlug: string) => {
        const pendingCount = summary[collectionSlug]?.pending || 0;
        if (pendingCount === 0) {
            toast.error('No pending subscribers for this collection');
            return;
        }

        if (!confirm(`Send launch notification to ${pendingCount} subscriber(s) for "${formatSlug(collectionSlug)}"?\n\nThis will send an email to each person who signed up.`)) {
            return;
        }

        setSending(collectionSlug);
        try {
            const res = await axios.post('/api/v1/notify-me/send', { collectionSlug });
            if (res.data.success) {
                toast.success(`✅ Sent to ${res.data.sentCount} subscriber(s)!${res.data.failedCount > 0 ? ` (${res.data.failedCount} failed)` : ''}`);
                fetchSubscribers(); // Refresh
            }
        } catch {
            toast.error('Failed to send notifications');
        } finally {
            setSending(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this subscriber?')) return;
        try {
            await axios.delete('/api/v1/notify-me', { data: { id } });
            toast.success('Subscriber removed');
            setSubscribers(prev => prev.filter(s => s.id !== id));
        } catch {
            toast.error('Failed to delete');
        }
    };

    const formatSlug = (slug: string) =>
        slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const collections = Object.keys(summary);

    const filteredSubscribers = filter === 'all'
        ? subscribers
        : subscribers.filter(s => (s.collectionSlug || 'general') === filter);

    if (loading) {
        return (
            <div className="p-6! flex! justify-center! items-center! min-h-[400px]!">
                <div className="animate-spin! rounded-full! h-12! w-12! border-b-2! border-amber-600!"></div>
            </div>
        );
    }

    return (
        <div className="p-6!">
            {/* Header */}
            <div className="mb-6!">
                <h1 className="text-2xl! font-bold! text-gray-800! flex! items-center! gap-2!">
                    <Mail className="w-6! h-6! text-amber-600!" />
                    Launch Subscribers
                </h1>
                <p className="text-gray-500! text-sm! mt-1!">
                    People who signed up for "Notify Me" on coming soon collections
                </p>
            </div>

            {/* Summary Cards */}
            {collections.length > 0 && (
                <div className="grid! grid-cols-1! md:grid-cols-2! lg:grid-cols-3! gap-4! mb-6!">
                    {collections.map(slug => (
                        <div key={slug} className="bg-white! rounded-xl! p-5! shadow-sm! border! border-gray-100!">
                            <div className="flex! items-center! justify-between! mb-3!">
                                <h3 className="font-semibold! text-gray-800! text-sm! uppercase! tracking-wider!">
                                    {formatSlug(slug)}
                                </h3>
                                <span className="text-xs! bg-amber-50! text-amber-700! px-2! py-1! rounded-full! font-medium!">
                                    {summary[slug].total} total
                                </span>
                            </div>

                            <div className="flex! items-center! gap-4! text-sm! mb-4!">
                                <div className="flex! items-center! gap-1! text-green-600!">
                                    <CheckCircle className="w-3.5! h-3.5!" />
                                    <span>{summary[slug].notified} notified</span>
                                </div>
                                <div className="flex! items-center! gap-1! text-orange-500!">
                                    <Clock className="w-3.5! h-3.5!" />
                                    <span>{summary[slug].pending} pending</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSendNotification(slug)}
                                disabled={sending === slug || summary[slug].pending === 0}
                                className="w-full! py-2! px-3! rounded-lg! text-sm! font-medium! flex! items-center! justify-center! gap-2! transition-all! disabled:opacity-40! disabled:cursor-not-allowed! bg-black! text-amber-400! hover:bg-gray-800!"
                            >
                                {sending === slug ? (
                                    <>
                                        <div className="animate-spin! rounded-full! h-4! w-4! border-2! border-amber-400! border-t-transparent!"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4! h-4!" />
                                        Send Launch Email ({summary[slug].pending})
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex! gap-2! mb-4! flex-wrap!">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3! py-1.5! rounded-lg! text-sm! font-medium! transition-all! ${filter === 'all' ? 'bg-amber-600! text-white!' : 'bg-gray-100! text-gray-600! hover:bg-gray-200!'}`}
                >
                    All ({subscribers.length})
                </button>
                {collections.map(slug => (
                    <button
                        key={slug}
                        onClick={() => setFilter(slug)}
                        className={`px-3! py-1.5! rounded-lg! text-sm! font-medium! transition-all! ${filter === slug ? 'bg-amber-600! text-white!' : 'bg-gray-100! text-gray-600! hover:bg-gray-200!'}`}
                    >
                        {formatSlug(slug)} ({summary[slug].total})
                    </button>
                ))}
            </div>

            {/* Subscribers Table */}
            <div className="bg-white! rounded-xl! shadow-sm! overflow-hidden!">
                {filteredSubscribers.length === 0 ? (
                    <div className="p-12! text-center! text-gray-400!">
                        <Users className="w-12! h-12! mx-auto! mb-3! opacity-50!" />
                        <p className="font-medium!">No subscribers yet</p>
                        <p className="text-sm! mt-1!">Subscribers will appear here when users sign up on "Coming Soon" collections</p>
                    </div>
                ) : (
                    <table className="w-full! text-sm!">
                        <thead>
                            <tr className="bg-gray-50! border-b! border-gray-100!">
                                <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">Email</th>
                                <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">Collection</th>
                                <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">Status</th>
                                <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">Subscribed</th>
                                <th className="text-right! px-4! py-3! font-semibold! text-gray-600!">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscribers.map(sub => (
                                <tr key={sub.id} className="border-b! border-gray-50! hover:bg-gray-50! transition-colors!">
                                    <td className="px-4! py-3! font-medium! text-gray-800!">{sub.email}</td>
                                    <td className="px-4! py-3! text-gray-600!">{formatSlug(sub.collectionSlug || 'General')}</td>
                                    <td className="px-4! py-3!">
                                        {sub.isNotified ? (
                                            <span className="inline-flex! items-center! gap-1! bg-green-50! text-green-700! px-2! py-1! rounded-full! text-xs! font-medium!">
                                                <CheckCircle className="w-3! h-3!" /> Notified
                                            </span>
                                        ) : (
                                            <span className="inline-flex! items-center! gap-1! bg-orange-50! text-orange-600! px-2! py-1! rounded-full! text-xs! font-medium!">
                                                <Clock className="w-3! h-3!" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4! py-3! text-gray-500!">{formatDate(sub.createdAt)}</td>
                                    <td className="px-4! py-3! text-right!">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-gray-400! hover:text-red-500! transition-colors! p-1!"
                                            title="Remove subscriber"
                                        >
                                            <Trash2 className="w-4! h-4!" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}