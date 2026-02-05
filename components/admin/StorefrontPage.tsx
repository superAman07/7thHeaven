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
    Loader2,
    AlertCircle,
    CheckCircle2
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
    type?: 'CATEGORY' | 'COLLECTION';
    categorySlug: string;
    collectionSlug?: string;         
    bgClass?: string;
    order: number;
}

export default function StorefrontPage() {
    // State
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [originalSections, setOriginalSections] = useState<HomeSection[]>([]); // To track changes
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [contentType, setContentType] = useState<'CATEGORY' | 'COLLECTION'>('CATEGORY');
    const [selectedColId, setSelectedColId] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [selectedCatId, setSelectedCatId] = useState('');
    const [customTitle, setCustomTitle] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sectRes, catRes, colRes] = await Promise.all([
                axios.get('/api/v1/content/home_sections'),
                axios.get('/api/v1/admin/categories'),
                axios.get('/api/v1/collections')
            ]);
            
            if (sectRes.data.success) {
                const fetchedSections = sectRes.data.data || [];
                setSections(fetchedSections);
                setOriginalSections(fetchedSections); // Sync baseline
            }
            if (catRes.data.success) {
                setCategories(catRes.data.data);
            }
            if (colRes.data.success) setCollections(colRes.data.data);
        } catch (error) {
            toast.error("Failed to load storefront data");
        } finally {
            setLoading(false);
        }
    };

    const hasChanges = JSON.stringify(sections) !== JSON.stringify(originalSections);

    const handleAddSection = () => {
        if (!customTitle) { toast.error("Enter a title"); return; }
        let targetSlug = '';
        if (contentType === 'CATEGORY') {
            const cat = categories.find(c => c.id === selectedCatId);
            if (!cat) return;
            targetSlug = cat.slug;
        } else {
            const col = collections.find(c => c.id === selectedColId);
            if (!col) return;
            targetSlug = col.slug;
        }
        const newSection: HomeSection = {
            id: Date.now().toString(),
            title: customTitle,
            type: contentType, // SAVE THE TYPE
            categorySlug: contentType === 'CATEGORY' ? targetSlug : '',
            collectionSlug: contentType === 'COLLECTION' ? targetSlug : '',
            order: sections.length + 1,
            bgClass: 'bg-[#fcfaf7]' // Default standard background
        };

        setSections([...sections, newSection]);
        setCustomTitle('');
        // Keep category selected for faster adding if needed, or clear it:
        setSelectedCatId(''); 
        toast.success("Section added! Don't forget to Publish.");
    };

    const handleRemoveSection = (id: string) => {
        if(confirm("Remove this section from the home page?")){
             setSections(sections.filter(s => s.id !== id));
        }
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
            // Re-assign order numbers based on visual list position
            const orderedSections = sections.map((s, idx) => ({ ...s, order: idx + 1 }));
            
            await axios.put('/api/v1/content/home_sections', orderedSections);
            
            setSections(orderedSections);
            setOriginalSections(orderedSections); // Update baseline to new saved state
            toast.success("Homepage updated successfully!");
        } catch (error) {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        if(confirm("Discard all unsaved changes and reload?")) {
            setSections(originalSections);
            toast("Changes discarded");
        }
    }

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#E6B422]" />
        </div>
    );

    return (
        <div className="p-6 md:p-10 min-h-screen bg-gray-50/50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#E6B422]/10 rounded-xl text-[#E6B422]">
                            <Layout className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900">Homepage Switchboard</h1>
                            <p className="text-gray-500">Manage your active storefront sections.</p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        {hasChanges && (
                            <div className="flex items-center gap-2 px-3 text-amber-600 animate-pulse font-medium text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Unsaved Changes</span>
                            </div>
                        )}
                         {hasChanges && (
                             <button 
                                onClick={handleDiscard}
                                className="px-4 py-2 text-gray-500 hover:text-gray-900 font-bold text-sm transition-colors"
                             >
                                 Discard
                             </button>
                         )}
                        <button 
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className={`
                                px-6 py-2 rounded-lg font-bold shadow-lg flex! items-center! gap-2 transition-all
                                ${hasChanges 
                                    ? 'bg-[#E6B422] text-white shadow-[#E6B422]/20 hover:scale-105 active:scale-95' 
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}
                            `}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                            {saving ? 'Publishing...' : 'Publish Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT: Builder Form (4 columns) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-[#E6B422]" />
                                Add New Section
                            </h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">1. Select Source</label>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" checked={contentType === 'CATEGORY'} onChange={() => setContentType('CATEGORY')} /> 
                                            Specific Category
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" checked={contentType === 'COLLECTION'} onChange={() => setContentType('COLLECTION')} /> 
                                            Whole Collection
                                        </label>
                                    </div>
                                    {contentType === 'CATEGORY' ? (
                                        <select value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg outline-none border border-gray-200">
                                            <option value="">-- Choose Category --</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                        </select>
                                    ) : (
                                        <select value={selectedColId} onChange={(e) => setSelectedColId(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg outline-none border border-gray-200">
                                            <option value="">-- Choose Collection --</option>
                                            {collections.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                                        </select>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">2. Display Title</label>
                                    <input 
                                        type="text" 
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="e.g. Summer Essentials"
                                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 focus:border-[#E6B422] outline-none transition-colors"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">What the customer sees as the header.</p>
                                </div>

                                <button 
                                    onClick={handleAddSection}
                                    className="w-full py-3 bg-black text-white rounded-xl font-bold uppercase tracking-wider flex! items-center! justify-center! gap-2 hover:bg-gray-800 transition-colors mt-4"
                                >
                                    Add to Feed <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Live Preview List (8 columns) */}
                    <div className="lg:col-span-8">
                         {sections.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                                <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Layout className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Your Homepage is Empty</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                                    Add your first section using the form on the left to start showcasing your products.
                                </p>
                            </div>
                         ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                                    <span>Active Sections ({sections.length})</span>
                                    <span>Preview Order</span>
                                </div>

                                {sections.map((section, index) => (
                                    <div 
                                        key={section.id} 
                                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group transition-all hover:shadow-md hover:border-[#E6B422]/30"
                                    >
                                        {/* Order Badge */}
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-50 text-gray-900 font-black flex items-center justify-center text-lg border border-gray-100">
                                            {index + 1}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-lg truncate">{section.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Category: {section.categorySlug}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <div className="flex flex-col gap-1 mr-2">
                                                <button 
                                                    onClick={() => moveSection(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                                    title="Move Up"
                                                >
                                                    <ArrowUp className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => moveSection(index, 'down')}
                                                    disabled={index === sections.length - 1}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-black disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                                                    title="Move Down"
                                                >
                                                    <ArrowDown className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="w-px h-10 bg-gray-100 mx-2"></div>
                                            
                                            <button 
                                                onClick={() => handleRemoveSection(section.id)}
                                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove Section"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                         
                         <div className="mt-8 text-center">
                            <p className="text-xs text-gray-400 bg-gray-100/50 inline-block px-4 py-2 rounded-full border border-gray-100">
                                <CheckCircle2 className="w-3 h-3 inline mr-1 mb-0.5" />
                                Changes are reflected immediately on the live website after clicking <strong>Publish</strong>.
                            </p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}