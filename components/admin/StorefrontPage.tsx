'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Layout, 
    Plus, 
    Trash2, 
    ArrowUp, 
    ArrowDown, 
    Save, 
    Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface Category {
    id: string;
    name: string;
    slug: string;
}

interface HomeSection {
    id: string;
    title: string;
    categorySlug: string;
    bgClass?: string;
    order: number;
}

export default function StorefrontPage() {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Stats
    const [selectedCatId, setSelectedCatId] = useState('');
    const [customTitle, setCustomTitle] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sectRes, catRes] = await Promise.all([
                axios.get('/api/v1/content/home_sections'),
                axios.get('/api/v1/admin/categories')
            ]);
            
            if (sectRes.data.success) {
                // Ensure sorted by user preference (order) or index
                setSections(sectRes.data.data || []);
            }
            if (catRes.data.success) {
                setCategories(catRes.data.data);
            }
        } catch (error) {
            toast.error("Failed to load storefront data");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = () => {
        if (!selectedCatId || !customTitle) {
            toast.error("Please select a category and enter a display title");
            return;
        }

        const category = categories.find(c => c.id === selectedCatId);
        if (!category) return;

        const newSection: HomeSection = {
            id: Date.now().toString(),
            title: customTitle,
            categorySlug: category.slug, // This drives the API
            order: sections.length + 1,
            bgClass: (sections.length % 2 === 0) ? 'bg-[#fcfaf7]' : 'bg-white' 
        };

        setSections([...sections, newSection]);
        setCustomTitle('');
        setSelectedCatId('');
        toast.success("Section added to list (unsaved)");
    };

    const handleRemoveSection = (id: string) => {
        setSections(sections.filter(s => s.id !== id));
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setSections(newSections);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Re-assign order numbers based on current array position
            const orderedSections = sections.map((s, idx) => ({ ...s, order: idx + 1 }));
            
            await axios.put('/api/v1/content/home_sections', orderedSections);
            setSections(orderedSections);
            toast.success("Homepage updated successfully!");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Storefront...</div>;

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#E6B422]/10 rounded-xl text-[#E6B422]">
                        <Layout className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Homepage Switchboard</h1>
                        <p className="text-gray-500">Manage what your customers see first.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT: Builder Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                            <h3 className="font-bold text-gray-900 mb-4">Add New Section</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Display Title</label>
                                    <input 
                                        type="text" 
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="e.g. Summer Essentials"
                                        className="w-full mt-1 p-3 bg-gray-50 rounded-lg border-2 border-transparent focus:border-[#E6B422]/50 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Linked Category</label>
                                    <select 
                                        value={selectedCatId}
                                        onChange={(e) => setSelectedCatId(e.target.value)}
                                        className="w-full mt-1 p-3 bg-gray-50 rounded-lg outline-none"
                                    >
                                        <option value="">Select Category...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={handleAddSection}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add to Feed
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Live Preview List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-600 text-sm">Active Sections ({sections.length})</span>
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    // Professional Save Button
                                    className="px-6 py-2 bg-[#E6B422] text-white rounded-lg font-bold shadow-lg shadow-[#E6B422]/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                                    Publish Changes
                                </button>
                            </div>

                            <div className="divide-y divide-gray-50">
                                {sections.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        No sections active. The homepage will be empty!
                                    </div>
                                ) : (
                                    sections.map((section, index) => (
                                        <div key={section.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 group transition-colors">
                                            {/* Order Badge */}
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-xs">
                                                {index + 1}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{section.title}</h4>
                                                <p className="text-xs text-gray-400 font-mono">Linked to: /collections/{section.categorySlug}</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => moveSection(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-2 text-gray-400 hover:text-black disabled:opacity-30"
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => moveSection(index, 'down')}
                                                    disabled={index === sections.length - 1}
                                                    className="p-2 text-gray-400 hover:text-black disabled:opacity-30"
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                                                <button 
                                                    onClick={() => handleRemoveSection(section.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Changes are reflected immediately on the Website and Mobile App after clicking Publish.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}