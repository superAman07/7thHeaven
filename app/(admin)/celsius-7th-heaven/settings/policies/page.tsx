"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Save } from "lucide-react";

// The 4 key policies we need
const POLICY_SECTIONS = [
    { id: "legal_terms", label: "Terms & Conditions" },
    { id: "legal_privacy", label: "Privacy Policy" },
    { id: "legal_refund", label: "Refund Policy" },
    { id: "legal_shipping", label: "Shipping Policy" },
];

export default function PoliciesAdminPage() {
    const [activeSection, setActiveSection] = useState(POLICY_SECTIONS[0].id);
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch content whenever the active tab changes
    useEffect(() => {
        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/api/v1/content/${activeSection}`);
                // Safely extract the text. If it's a new policy, default to empty string.
                const data = res.data.data?.content || {};
                setContent(data.text || "");
            } catch (error) {
                console.error("Failed to fetch", error);
                setContent(""); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, [activeSection]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put(`/api/v1/content/${activeSection}`, {
                content: { text: content } // We store it as specific JSON
            });
            toast.success("Policy updated successfully!");
        } catch (error) {
            toast.error("Failed to update policy");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Legal Policies Management</h1>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* 1. Sidebar Tabs */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    {POLICY_SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`text-left px-4 py-3 rounded-lg font-medium transition-colors border ${
                                activeSection === section.id
                                    ? "bg-[#1a1511] text-white border-[#1a1511] shadow-md"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* 2. Editor Area */}
                <div className="flex-1">
                    <div className="mb-4 bg-yellow-50 p-4 rounded-md border border-yellow-100 text-sm text-yellow-800">
                        <p><strong>Tip:</strong> You can use basic HTML tags for formatting. 
                        Example: <code>&lt;h3&gt;Title&lt;/h3&gt;</code> for headings, <code>&lt;p&gt;</code> for paragraphs, or <code>&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</code> for lists.</p>
                    </div>

                    <div className="relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                            </div>
                        )}
                        
                        <textarea
                            className="w-full h-[600px] p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed focus:ring-2 focus:ring-[#B6902E] focus:border-transparent resize-y"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Start typing your policy here... (e.g. <h2>1. Introduction</h2>...)"
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className={`flex! items-center! px-6 py-2 bg-[#B6902E] text-white font-bold rounded-lg transition-all ${
                                isSaving ? "opacity-70 cursor-wait" : "hover:bg-[#9a7820] hover:shadow-lg"
                            }`}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}