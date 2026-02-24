'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Gift, Clock, CheckCircle, Package, Loader2, Search, Filter, Send, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface Claim {
    id: string;
    level: number;
    amount: string;
    status: string;
    claimedAt: string;
    processedAt: string | null;
    note: string | null;
    user: {
        id: string;
        fullName: string;
        email: string;
        phone: string;
        referralCode: string;
    };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; bg: string }> = {
    PENDING: { label: 'Pending', color: 'text-amber-700', icon: Clock, bg: 'bg-amber-50 border-amber-200' },
    APPROVED: { label: 'Approved', color: 'text-green-700', icon: CheckCircle, bg: 'bg-green-50 border-green-200' },
    DELIVERED: { label: 'Delivered', color: 'text-blue-700', icon: Package, bg: 'bg-blue-50 border-blue-200' },
};

export default function RewardClaimsPage() {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingCount, setPendingCount] = useState(0);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [noteModal, setNoteModal] = useState<{ claimId: string; action: string } | null>(null);
    const [noteText, setNoteText] = useState('');

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            const res = await axios.get(`/api/v1/admin/mlm/claims?${params.toString()}`);
            if (res.data.success) {
                setClaims(res.data.data);
                setPendingCount(res.data.pendingCount);
            }
        } catch (error) {
            toast.error('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchClaims(); }, [statusFilter]);

    const handleUpdateStatus = async (claimId: string, status: string, note?: string) => {
        setProcessingId(claimId);
        try {
            const res = await axios.put('/api/v1/admin/mlm/claims', { claimId, status, note });
            if (res.data.success) {
                toast.success(`Claim ${status.toLowerCase()} successfully!`);
                fetchClaims();
                setNoteModal(null);
                setNoteText('');
            }
        } catch (error) {
            toast.error('Failed to update claim');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredClaims = claims.filter(c =>
        c.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-[#E6B422]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E6B422]">7th Heaven Club</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Reward Claims</h1>
                    <p className="text-gray-500 mt-1">Review and process member reward claims.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Pending</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{pendingCount}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-700 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Total Claims</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{claims.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email or referral code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B422] transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {['', 'PENDING', 'APPROVED', 'DELIVERED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all border ${
                                statusFilter === s
                                    ? 'bg-[#E6B422] text-white border-[#E6B422]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black text-white text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Member</th>
                                <th className="px-6 py-4 font-bold text-center">Heaven</th>
                                <th className="px-6 py-4 font-bold text-center">Amount</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                <th className="px-6 py-4 font-bold">Claimed On</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Loading claims...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClaims.length > 0 ? (
                                filteredClaims.map((claim) => {
                                    const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.PENDING;
                                    const StatusIcon = config.icon;
                                    return (
                                        <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#E6B422]/10 text-[#E6B422] flex items-center justify-center font-bold text-lg border border-[#E6B422]/20">
                                                        {claim.user.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{claim.user.fullName}</p>
                                                        <p className="text-xs text-gray-500">{claim.user.email}</p>
                                                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                                                            {claim.user.referralCode}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-10 h-10 bg-[#E6B422]/10 text-[#E6B422] rounded-full font-bold text-lg border border-[#E6B422]/20">
                                                    {claim.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-bold text-gray-900 text-sm">{claim.amount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.bg} ${config.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-gray-600 font-mono">
                                                    {new Date(claim.claimedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </span>
                                                {claim.note && (
                                                    <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[150px]" title={claim.note}>
                                                        📝 {claim.note}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {claim.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => setNoteModal({ claimId: claim.id, action: 'APPROVED' })}
                                                            disabled={processingId === claim.id}
                                                            className="inline-flex! items-center gap-1.5 px-3 py-2 bg-[#E6B422] text-white rounded-lg text-xs font-bold hover:bg-[#b5952f] transition-all disabled:opacity-50"
                                                        >
                                                            {processingId === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                                            Approve
                                                        </button>
                                                    )}
                                                    {claim.status === 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(claim.id, 'DELIVERED')}
                                                            disabled={processingId === claim.id}
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                                        >
                                                            {processingId === claim.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
                                                            Mark Delivered
                                                        </button>
                                                    )}
                                                    {claim.status === 'DELIVERED' && (
                                                        <span className="text-xs text-gray-400 italic">Completed</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <Gift className="w-12 h-12 text-gray-200 mb-3" />
                                            <p className="font-medium">No reward claims found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note Modal (for approving with a note) */}
            {noteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-black p-5 text-center relative">
                            <button onClick={() => { setNoteModal(null); setNoteText(''); }} className="absolute top-3 right-3 text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <CheckCircle className="w-10 h-10 text-[#E6B422] mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-white">Approve Reward</h3>
                        </div>
                        <div className="p-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                                Note for the member (optional)
                            </label>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="e.g. Reward will be credited within 7 business days..."
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E6B422] resize-none"
                                rows={3}
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => handleUpdateStatus(noteModal.claimId, noteModal.action, noteText)}
                                    disabled={processingId === noteModal.claimId}
                                    className="flex-1 py-2.5 bg-[#E6B422] text-white rounded-lg font-bold hover:bg-[#b5952f] transition-all flex! items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processingId === noteModal.claimId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Approve & Notify
                                </button>
                                <button
                                    onClick={() => { setNoteModal(null); setNoteText(''); }}
                                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}