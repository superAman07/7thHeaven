'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mail, Send, Trash2, Users, CheckCircle, Clock, X } from 'lucide-react';

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
    const [composeSlug, setComposeSlug] = useState<string | null>(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [useCustom, setUseCustom] = useState(false);

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

    const openCompose = (slug: string) => {
        const pendingCount = summary[slug]?.pending || 0;
        if (pendingCount === 0) {
            toast.error('No pending subscribers for this collection');
            return;
        }
        const name = formatSlug(slug);
        setComposeSlug(slug);
        setEmailSubject(`🎉 ${name} is Live! Shop Now`);
        setEmailBody(`The wait is over!\n\nThe ${name} collection you signed up for is now live. Be among the first to explore and shop these exclusive new fragrances.\n\nWe've crafted something truly special for you — don't miss out!`);
        setUseCustom(false);
    };

    const handleSend = async () => {
        if (!composeSlug) return;
        setSending(composeSlug);
        try {
            const payload: any = { collectionSlug: composeSlug };
            if (useCustom) {
                if (!emailSubject.trim() || !emailBody.trim()) {
                    toast.error('Subject and body are required');
                    setSending(null);
                    return;
                }
                payload.customSubject = emailSubject;
                payload.customBody = emailBody;
            }
            const res = await axios.post('/api/v1/notify-me/send', payload);
            if (res.data.success) {
                toast.success(`✅ Sent to ${res.data.sentCount} subscriber(s)!${res.data.failedCount > 0 ? ` (${res.data.failedCount} failed)` : ''}`);
                setComposeSlug(null);
                fetchSubscribers();
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
            <div className= "p-6! flex! justify-center! items-center! min-h-[400px]!" >
                <div className="animate-spin! rounded-full! h-12! w-12! border-b-2! border-amber-600!" > </div>
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
                {collections.map((slug) => (
                <div
                    key={slug}
                    className="bg-white! rounded-xl! p-5! shadow-sm! border! border-gray-100!"
                >
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
                    onClick={() => openCompose(slug)}
                    disabled={sending === slug || summary[slug].pending === 0}
                    className="w-full! py-2! px-3! rounded-lg! text-sm! font-medium! flex! items-center! justify-center! gap-2! transition-all! disabled:opacity-40! disabled:cursor-not-allowed! bg-black! text-amber-400! hover:bg-gray-800!"
                    >
                    {sending === slug ? (
                        <>
                        <div className="animate-spin! rounded-full! h-4! w-4! border-2! border-amber-400! border-t-transparent!" />
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
                className={`px-3! py-1.5! rounded-lg! text-sm! font-medium! transition-all! ${
                filter === 'all'
                    ? 'bg-amber-600! text-white!'
                    : 'bg-gray-100! text-gray-600! hover:bg-gray-200!'
                }`}
            >
                All({subscribers.length})
            </button>

            {collections.map((slug) => (
                <button
                key={slug}
                onClick={() => setFilter(slug)}
                className={`px-3! py-1.5! rounded-lg! text-sm! font-medium! transition-all! ${
                    filter === slug
                    ? 'bg-amber-600! text-white!'
                    : 'bg-gray-100! text-gray-600! hover:bg-gray-200!'
                }`}
                >
                {formatSlug(slug)}({summary[slug].total})
                </button>
            ))}
            </div>

            {/* Subscribers Table */}
            <div className="bg-white! rounded-xl! shadow-sm! overflow-hidden!">
            {filteredSubscribers.length === 0 ? (
                <div className="p-12! text-center! text-gray-400!">
                <Users className="w-12! h-12! mx-auto! mb-3! opacity-50!" />
                <p className="font-medium!">No subscribers yet</p>
                <p className="text-sm! mt-1!">
                    Subscribers will appear here when users sign up on "Coming Soon"
                    collections
                </p>
                </div>
            ) : (
                <table className="w-full! text-sm!">
                <thead>
                    <tr className="bg-gray-50! border-b! border-gray-100!">
                    <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">
                        Email
                    </th>
                    <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">
                        Collection
                    </th>
                    <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">
                        Status
                    </th>
                    <th className="text-left! px-4! py-3! font-semibold! text-gray-600!">
                        Subscribed
                    </th>
                    <th className="text-right! px-4! py-3! font-semibold! text-gray-600!">
                        Action
                    </th>
                    </tr>
                </thead>

                <tbody>
                    {filteredSubscribers.map((sub) => (
                    <tr
                        key={sub.id}
                        className="border-b! border-gray-50! hover:bg-gray-50! transition-colors!"
                    >
                        <td className="px-4! py-3! font-medium! text-gray-800!">
                        {sub.email}
                        </td>

                        <td className="px-4! py-3! text-gray-600!">
                        {formatSlug(sub.collectionSlug || 'General')}
                        </td>

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

                        <td className="px-4! py-3! text-gray-500!">
                        {formatDate(sub.createdAt)}
                        </td>

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

            {/* ========== COMPOSE MODAL ========== */}
            {composeSlug && (
            <div className="fixed! inset-0! z-50! flex! items-center! justify-center! bg-black/50! backdrop-blur-sm!">
                <div className="bg-white! rounded-2xl! w-full! max-w-lg! mx-4! shadow-2xl! overflow-hidden!">
                {/* Modal Header */}
                <div className="flex! items-center! justify-between! px-6! py-4! border-b! border-gray-100! bg-gray-50!">
                    <div>
                    <h3 className="font-bold! text-gray-800! text-lg!">
                        📧 Send Launch Notification
                    </h3>
                    <p className="text-sm! text-gray-500! mt-0.5!">
                        {formatSlug(composeSlug)} • {summary[composeSlug]?.pending}{' '}
                        subscriber(s)
                    </p>
                    </div>

                    <button
                    onClick={() => setComposeSlug(null)}
                    className="text-gray-400! hover:text-gray-600! p-1!"
                    >
                    <X className="w-5! h-5!" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="px-6! py-5!">
                    {/* Toggle */}
                    <div className="flex! items-center! gap-3! mb-5! p-3! bg-gray-50! rounded-lg!">
                    <button
                        onClick={() => setUseCustom(false)}
                        className={`flex-1! py-2! rounded-md! text-sm! font-medium! transition-all! ${
                        !useCustom
                            ? 'bg-white! shadow-sm! text-gray-800!'
                            : 'text-gray-500! hover:text-gray-700!'
                        }`}
                    >
                        🎨 Default Template
                    </button>

                    <button
                        onClick={() => setUseCustom(true)}
                        className={`flex-1! py-2! rounded-md! text-sm! font-medium! transition-all! ${
                        useCustom
                            ? 'bg-white! shadow-sm! text-gray-800!'
                            : 'text-gray-500! hover:text-gray-700!'
                        }`}
                    >
                        ✏️ Custom Email
                    </button>
                    </div>

                    {!useCustom ? (
                    <div className="border! border-gray-200! rounded-lg! p-4! bg-gray-50!">
                        <p className="text-xs! text-gray-400! uppercase! tracking-wider! font-semibold! mb-2!">
                        Email Preview
                        </p>

                        <p className="text-sm! font-semibold! text-gray-800! mb-1!">
                        Subject: 🎉 {formatSlug(composeSlug)} is Live! Shop Now
                        </p>

                        <hr className="my-2! border-gray-200!" />

                        <p className="text-sm! text-gray-600! leading-relaxed!">
                        The wait is over. The collection you signed up for is now
                        live. Be among the first to explore and shop these exclusive
                        new fragrances.
                        </p>

                        <div className="mt-3! text-center!">
                        <span className="inline-block! bg-amber-500! text-black! px-4! py-1.5! rounded! text-xs! font-bold! uppercase!">
                            Shop {formatSlug(composeSlug)}
                        </span>
                        </div>
                    </div>
                    ) : (
                    <div className="space-y-4!">
                        <div>
                        <label className="block! text-sm! font-semibold! text-gray-700! mb-1.5!">
                            Email Subject
                        </label>
                        <input
                            type="text"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            placeholder="e.g. 🎉 New Collection is Live!"
                            className="w-full! px-3! py-2.5! border! border-gray-300! rounded-lg! text-sm! focus:ring-2! focus:ring-amber-500! focus:border-amber-500! outline-none!"
                        />
                        </div>

                        <div>
                        <label className="block! text-sm! font-semibold! text-gray-700! mb-1.5!">
                            Email Body
                        </label>
                        <textarea
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={6}
                            placeholder="Write your custom message here..."
                            className="w-full! px-3! py-2.5! border! border-gray-300! rounded-lg! text-sm! focus:ring-2! focus:ring-amber-500! focus:border-amber-500! outline-none! resize-none!"
                        />
                        <p className="text-xs! text-gray-400! mt-1!">
                            The &quot;Shop Now&quot; button linking to the collection page
                            will be added automatically.
                        </p>
                        </div>
                    </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex! items-center! justify-end! gap-3! px-6! py-4! border-t! border-gray-100! bg-gray-50!">
                    <button
                    onClick={() => setComposeSlug(null)}
                    className="px-4! py-2! text-sm! font-medium! text-gray-600! hover:text-gray-800!"
                    >
                    Cancel
                    </button>

                    <button
                    onClick={handleSend}
                    disabled={sending === composeSlug}
                    className="px-5! py-2! bg-black! text-amber-400! rounded-lg! text-sm! font-semibold! flex! items-center! gap-2! hover:bg-gray-800! disabled:opacity-50!"
                    >
                    {sending === composeSlug ? (
                        <>
                        <div className="animate-spin! rounded-full! h-4! w-4! border-2! border-amber-400! border-t-transparent!" />
                        Sending...
                        </>
                    ) : (
                        <>
                        <Send className="w-4! h-4!" />
                        Send to {summary[composeSlug]?.pending} Subscriber(s)
                        </>
                    )}
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
}