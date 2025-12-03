'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LevelData {
    level: number;
    count: number;
    target: number;
    isCompleted: boolean;
    progress: number;
}

interface DirectReferral {
    name: string;
    joinedAt: string;
}

interface NetworkData {
    referralCode: string | null;
    isMember: boolean;
    levels: LevelData[];
    totalTeamSize: number;
    directReferrals: DirectReferral[];
}

export default function SeventhHeavenPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<NetworkData | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        fetchNetworkData();
    }, []);

    const fetchNetworkData = async () => {
        try {
            const res = await axios.get('/api/v1/network');
            if (res.data.success) {
                setData(res.data.data);
            } else {
                toast.error("Could not load network data.");
            }
        } catch (error: any) {
            console.error("Network fetch error", error);
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (data?.referralCode) {
            const link = `${window.location.origin}/login?ref=${data.referralCode}`;
            navigator.clipboard.writeText(link);
            setCopySuccess(true);
            toast.success("Referral link copied!");
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your empire...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div id="main-wrapper" className="bg-gray-50 min-h-screen pb-20">
            {/* --- Page Banner --- */}
            <div className="page-banner-section section" style={{ backgroundColor: '#1a1a1a', padding: '60px 0' }}>
                <div className="container">
                    <div className="row">
                        <div className="col text-center">
                            <h1 className="text-white font-serif text-4xl mb-2" style={{ fontFamily: '"Cormorant Garamond", serif' }}>7th Heaven Club</h1>
                            <p className="text-[#ddb040] text-lg tracking-wider uppercase">Your Exclusive Network</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-10">
                {/* --- Status Card --- */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-[#ddb040] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <i className="fa fa-trophy text-9xl text-[#ddb040]"></i>
                    </div>
                    
                    <div className="row align-items-center relative z-10">
                        <div className="col-lg-6 mb-6 mb-lg-0">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Welcome, Member
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Status: <span className={`font-bold px-2 py-1 rounded ${data.isMember ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {data.isMember ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 font-mono text-lg font-bold text-gray-700">
                                    {data.referralCode || 'NO CODE'}
                                </div>
                                <button 
                                    onClick={copyToClipboard}
                                    className="bg-[#ddb040] hover:bg-[#cca33b] text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <i className={`fa ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                                    {copySuccess ? 'Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center lg:text-right">
                            <div className="inline-block text-center mx-4">
                                <div className="text-4xl font-bold text-[#ddb040] mb-1">{data.totalTeamSize}</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Total Members</div>
                            </div>
                            <div className="inline-block text-center mx-4">
                                <div className="text-4xl font-bold text-gray-800 mb-1">{data.levels.filter(l => l.isCompleted).length}/7</div>
                                <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Levels Unlocked</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Levels Grid --- */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6 pl-2 border-l-4 border-[#ddb040]">Your Progress</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                    {data.levels.map((level) => (
                        <div 
                            key={level.level} 
                            className={`relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                                level.isCompleted 
                                    ? 'bg-linear-to-br from-white to-yellow-50 border border-[#ddb040] shadow-md' 
                                    : 'bg-white border border-gray-200 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Level</span>
                                    <h4 className="text-3xl font-bold text-gray-800">0{level.level}</h4>
                                </div>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    level.isCompleted ? 'bg-[#ddb040] text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                    <i className={`fa ${level.isCompleted ? 'fa-check' : 'fa-lock'}`}></i>
                                </div>
                            </div>

                            <div className="mb-2 flex justify-between text-sm font-medium">
                                <span className="text-gray-600">Members</span>
                                <span className={level.isCompleted ? 'text-[#ddb040]' : 'text-gray-400'}>
                                    {level.count} / {level.target}
                                </span>
                            </div>

                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-[#ddb040] h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${level.progress}%` }}
                                ></div>
                            </div>
                            
                            {level.isCompleted && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ddb040]"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- Direct Referrals Table --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Direct Team (Level 1)</h3>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                            {data.directReferrals.length} Members
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Member Name</th>
                                    <th className="px-6 py-4">Join Date</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.directReferrals.length > 0 ? (
                                    data.directReferrals.map((member, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#ddb040]/10 text-[#ddb040] flex items-center justify-center text-sm font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {member.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(member.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            <div className="mb-2"><i className="fa fa-user-plus text-3xl text-gray-300"></i></div>
                                            <p>No direct referrals yet. Share your code to start building!</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}