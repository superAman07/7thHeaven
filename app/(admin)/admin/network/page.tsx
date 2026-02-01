'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trophy, Users, Gift, Star, Crown, X, Phone, Mail, CheckCircle, Send, Network, Activity, Loader2} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import NetworkGalaxy, { NetworkNode } from '@/components/heaven/NetworkGalaxy';

interface Leader {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    referralCode: string;
    createdAt: string;
    stats: {
        totalTeam: number;
        level7Count: number;
        level7Progress: number;
        level1Count: number;
    };
}

export default function NetworkLeadersPage() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processingStep, setProcessingStep] = useState<'initial' | 'sending' | 'completed'>('initial');
    const [showNetworkModal, setShowNetworkModal] = useState(false);
    const [networkData, setNetworkData] = useState<NetworkNode | null>(null);

    useEffect(() => {
        fetchLeaders();
    }, []);

    const fetchLeaders = async () => {
        try {
            const res = await axios.get('/api/v1/admin/mlm/leaders');
            if (res.data.success) {
                setLeaders(res.data.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load network data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenNetwork = async (leader: Leader) => {
        setShowNetworkModal(true);
        setNetworkData(null); 
        try {
            const res = await axios.get(`/api/v1/network/graph?targetUserId=${leader.id}`);
            if(res.data.success) setNetworkData(res.data.data);
            else toast.error("Failed to load network.");
        } catch (error) {
            toast.error("Could not fetch user network.");
        }
    };

    const openRewardModal = (leader: Leader) => {
        setSelectedLeader(leader);
        setProcessingStep('initial');
        setIsModalOpen(true);
    };

    // NEW: Simulate sending the digital message
    const handleSendCongratulation = async () => {
        if (!selectedLeader) return;
        setProcessingStep('sending');
        
        // In real life: await axios.post('/api/v1/admin/mlm/notify-winner', { userId: selectedLeader.id });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        
        toast.success(`Official congratulation sent to ${selectedLeader.fullName}`);
        setProcessingStep('completed');
    };

    const filteredLeaders = leaders.filter(l => 
        l.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Top Stats
    const totalMembers = leaders.length;
    const totalNetworkSize = leaders.reduce((acc, curr) => acc + curr.stats.totalTeam, 0);
    const potentialWinners = leaders.filter(l => l.stats.level7Progress > 0).length;

    return (
        <div className="p-6 min-h-screen bg-gray-50/50">
            {/* --- Header Section --- */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-[#E6B422]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E6B422]">7th Heaven Club</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Network Leaders</h1>
                    <p className="text-gray-500 mt-1">Monitor top performers and manage reward eligibility.</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-black text-white rounded-full">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Club Members</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{totalMembers}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-2 bg-[#E6B422] text-white rounded-full">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400">Total Network</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{totalNetworkSize}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Search & Filter --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search by name, email or referral code..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B422] transition-all"
                    />
                </div>
                <button onClick={fetchLeaders} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors">
                    Refresh
                </button>
            </div>

            {/* --- Leaders Table --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-black text-white text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-bold">Leader Profile</th>
                                <th className="px-6 py-4 font-bold text-center">Direct Referrals</th>
                                <th className="px-6 py-4 font-bold text-center">Total Team</th>
                                <th className="px-6 py-4 font-bold">Level 7 Progress</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Loading network data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLeaders.length > 0 ? (
                                filteredLeaders.map((leader) => (
                                    <tr key={leader.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#E6B422]/10 text-[#E6B422] flex items-center justify-center font-bold text-lg border border-[#E6B422]/20">
                                                    {leader.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{leader.fullName}</p>
                                                    <p className="text-xs text-gray-500">{leader.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                                                        {leader.referralCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-gray-700">{leader.stats.level1Count}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-sm">
                                                <button 
                                                    onClick={() => handleOpenNetwork(leader)}
                                                    className="group/btn relative inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-bold text-sm hover:text-white transition-all cursor-pointer border border-blue-100"
                                                >
                                                    <Users className="w-3 h-3 group-hover/btn:hidden" />
                                                    <Network className="w-3 h-3 hidden group-hover/btn:block" />
                                                    {leader.stats.totalTeam}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-bold text-gray-600">Level 7</span>
                                                    <span className="text-[#E6B422] font-bold">{leader.stats.level7Progress.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-linear-to-r from-[#E6B422] to-[#F3E5AB] h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.max(5, leader.stats.level7Progress)}%` }}
                                                    ></div>
                                                </div>
                                                {leader.stats.level7Progress >= 100 && (
                                                    <span className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                                                        <Star className="w-3 h-3 fill-current" /> COMPLETED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openRewardModal(leader)}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm cursor-pointer border ${
                                                    leader.stats.level7Progress >= 100 
                                                    ? 'bg-[#E6B422] text-white border-[#E6B422] hover:bg-black hover:border-black' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {leader.stats.level7Progress >= 100 ? (
                                                     <><Gift className="w-4 h-4" /> Process Reward</>
                                                ) : (
                                                     <><Activity className="w-4 h-4" /> Check Status</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Users className="w-12 h-12 text-gray-200 mb-3" />
                                            <p className="font-medium">No club members found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                          </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedLeader && (
                <div className="fixed inset-0 z-99! flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E6B422]">
                        {/* Modal Header */}
                        <div className="bg-black p-6 text-center relative">
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-[#E6B422] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#E6B422]/30">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">Reward Concierge</h3>
                            <p className="text-[#E6B422] text-xs font-bold mt-1">LEVEL 7 COMPLETED</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <h4 className="text-lg font-bold text-gray-900">{selectedLeader.fullName}</h4>
                                <p className="text-sm text-gray-500">Referral Code: {selectedLeader.referralCode}</p>
                            </div>

                            {/* Contact Info Card */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Winner Contact Details</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{selectedLeader.phone || 'No Phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                            <Mail className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{selectedLeader.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-3">
                                {selectedLeader.stats.level7Progress >= 100 ? (
                                    /* --- CASE 1: WINNER (Level 7 Complete) --- */
                                    <>
                                        <div className="bg-[#E6B422]/10 p-4 rounded-xl text-center mb-2 border border-[#E6B422]/20">
                                            <p className="text-[#E6B422] font-black text-lg">ELIGIBLE FOR REWARD</p>
                                            <p className="text-xs text-gray-600">User has completed the 7th Heaven Cycle.</p>
                                        </div>
                                        {processingStep === 'completed' ? (
                                            <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100">
                                                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                                <p className="text-green-800 font-bold">Notification Sent!</p>
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={handleSendCongratulation}
                                                disabled={processingStep === 'sending'}
                                                className="w-full bg-[#E6B422] text-white py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-95"
                                            >
                                                {processingStep === 'sending' ? 'Sending...' : <><Send className="w-4 h-4" /> Send Prize Notification</>}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    /* --- CASE 2: IN PROGRESS (Show Stats) --- */
                                    <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                            <Trophy className="w-8 h-8 opacity-50" />
                                        </div>
                                        <h5 className="text-gray-900 font-bold mb-1">Not Eligible Yet</h5>
                                        <p className="text-sm text-gray-500 mb-4">
                                            User is at <span className="text-[#E6B422] font-bold">{selectedLeader.stats.level7Progress.toFixed(1)}%</span> completion.
                                        </p>
                                        
                                        {/* Progress Bar inside Modal */}
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                                            <div 
                                                className="bg-gray-400 h-full rounded-full" 
                                                style={{ width: `${selectedLeader.stats.level7Progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Target: 100%</p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-full py-3 text-gray-500 font-medium text-sm hover:text-gray-800"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <NetworkGalaxy 
                isOpen={showNetworkModal} 
                onClose={() => setShowNetworkModal(false)} 
                data={networkData} 
            />
        </div>
    );
}