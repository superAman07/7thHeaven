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
    referralCode: string;
    isMember: boolean;
    levels: LevelData[];
    totalTeamSize: number;
    directReferrals: DirectReferral[];
}

export default function SeventhHeavenPage() {
    const [data, setData] = useState<NetworkData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/v1/network');
                if (res.data.success) {
                    setData(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch network", error);
                toast.error("Failed to load network data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const copyToClipboard = () => {
        if (data?.referralCode) {
            navigator.clipboard.writeText(`${window.location.origin}/login?ref=${data.referralCode}`);
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
        <div className="bg-gray-50 min-h-screen pb-20">
            <div className="w-full bg-[#1a1a1a] pt-28 pb-32 relative">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-white font-serif text-4xl mb-2" style={{ fontFamily: '"Cormorant Garamond", serif' }}>7th Heaven Club</h1>
                    <p className="text-[#ddb040] text-lg tracking-wider uppercase">Your Exclusive Network</p>
                </div>
            </div>
            <div className="container mx-auto px-4 relative z-10 -mt-16">
                {/* --- Status Card --- */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border-t-4 border-[#ddb040] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <i className="fa fa-trophy text-9xl text-[#ddb040]"></i>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Welcome, Member
                            </h2>
                            <p className="text-gray-600 mb-4 flex items-center gap-2">
                                Status:
                                <span className={`text-xs font-bold px-2 py-1 rounded ${data.isMember ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {data.isMember ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="bg-gray-50 px-4 py-2 rounded border border-gray-200 font-mono text-lg font-bold text-gray-700 tracking-wide">
                                    {data.referralCode || 'NO CODE'}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-[#ddb040] hover:bg-[#c59d35] text-white px-5 py-2 rounded transition-colors duration-200 shadow-sm flex items-center gap-2 font-medium"
                                >
                                    <i className={`fa ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                                    {copySuccess ? ' Copied!' : ' Copy Link'}
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Stats */}
                        <div className="flex justify-center lg:justify-end gap-8 text-center">
                            <div>
                                <div className="text-4xl font-bold text-[#ddb040] mb-1">{data.totalTeamSize}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Members</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-800 mb-1">{data.levels.filter(l => l.isCompleted).length}/7</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Levels Unlocked</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Levels Grid --- */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 pl-3 border-l-4 border-[#ddb040]">Your Progress</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.levels.map((level) => (
                            <div
                                key={level.level}
                                className={`relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 bg-white border ${level.isCompleted
                                        ? 'border-[#ddb040] shadow-md'
                                        : 'border-gray-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Level</span>
                                        <h4 className="text-3xl font-bold text-gray-800">0{level.level}</h4>
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${level.isCompleted ? 'bg-[#ddb040] text-white' : 'bg-gray-100 text-gray-400'
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

                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-[#ddb040] h-full rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${level.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Direct Referrals Table --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">Direct Referrals</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Member Name</th>
                                    <th className="px-6 py-4 font-semibold">Join Date</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.directReferrals.length > 0 ? (
                                    data.directReferrals.map((member, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#ddb040]/10 text-[#ddb040] flex items-center justify-center text-sm font-bold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    {member.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(member.joinedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
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