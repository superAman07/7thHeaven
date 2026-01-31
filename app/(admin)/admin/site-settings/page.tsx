'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface SiteSettings {
    companyName: string;
    tagline: string;
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    businessHours: string;
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    aboutTitle: string;
    aboutContent: string;
    aboutImage: string;
    footerText: string;
}

const defaultSettings: SiteSettings = {
    companyName: '',
    tagline: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    businessHours: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    aboutTitle: '',
    aboutContent: '',
    aboutImage: '',
    footerText: ''
};

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'contact' | 'about' | 'social' | 'footer'>('contact');
    const [hasFetched, setHasFetched] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchSettings = useCallback(async () => {
        if (hasFetched) return;
        try {
            const res = await axios.get('/api/v1/site-settings');
            if (res.data.success) {
                setSettings({ ...defaultSettings, ...res.data.data });
            }
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
            setHasFetched(true);
        }
    }, [hasFetched]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put('/api/v1/site-settings', settings);
            if (res.data.success) {
                toast.success('Settings saved successfully!');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/v1/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                handleChange('aboutImage', response.data.data.url);
                toast.success('Image uploaded successfully!');
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            toast.error('Image upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = () => {
        handleChange('aboutImage', '');
    };

    const handleChange = (field: keyof SiteSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="p-6! flex! justify-center! items-center! min-h-[400px]!">
                <div className="animate-spin! rounded-full! h-12! w-12! border-b-2! border-amber-600!"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'contact', label: '📍 Contact & Address' },
        { id: 'about', label: '📝 About Us' },
        { id: 'social', label: '🔗 Social Links' },
        { id: 'footer', label: '📄 Footer' }
    ];

    return (
        <div className="p-6!">
            <div className="flex! justify-between! items-center! mb-6!">
                <div>
                    <h1 className="text-2xl! font-bold! text-gray-800!">Site Settings</h1>
                    <p className="text-gray-500! text-sm!">Manage your website's contact info, about page, and footer</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6! py-2.5! bg-amber-600! text-white! rounded-lg! font-medium! hover:bg-amber-700! disabled:opacity-50! flex! items-center! gap-2!"
                >
                    {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex! gap-2! mb-6! border-b! pb-3! overflow-x-auto!">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4! py-2! rounded-lg! font-medium! whitespace-nowrap! transition-all! ${
                            activeTab === tab.id 
                                ? 'bg-amber-600! text-white!' 
                                : 'bg-gray-100! text-gray-600! hover:bg-gray-200!'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contact Tab */}
            {activeTab === 'contact' && (
                <div className="bg-white! rounded-xl! p-6! shadow-sm!">
                    <h3 className="text-lg! font-semibold! mb-4! text-gray-800!">Contact Information</h3>
                    <div className="grid! grid-cols-1! md:grid-cols-2! gap-4!">
                        <InputField label="Company Name" value={settings.companyName} onChange={v => handleChange('companyName', v)} />
                        <InputField label="Tagline" value={settings.tagline} onChange={v => handleChange('tagline', v)} />
                        <InputField label="Phone" value={settings.phone} onChange={v => handleChange('phone', v)} />
                        <InputField label="Email" value={settings.email} onChange={v => handleChange('email', v)} type="email" />
                        <InputField label="WhatsApp" value={settings.whatsapp} onChange={v => handleChange('whatsapp', v)} />
                        <InputField label="Business Hours" value={settings.businessHours} onChange={v => handleChange('businessHours', v)} placeholder="Mon - Sat: 10AM - 7PM" />
                    </div>
                    
                    <h3 className="text-lg! font-semibold! mt-6! mb-4! text-gray-800!">Address</h3>
                    <div className="grid! grid-cols-1! md:grid-cols-2! gap-4!">
                        <div className="md:col-span-2!">
                            <InputField label="Street Address" value={settings.address} onChange={v => handleChange('address', v)} />
                        </div>
                        <InputField label="City" value={settings.city} onChange={v => handleChange('city', v)} />
                        <InputField label="State" value={settings.state} onChange={v => handleChange('state', v)} />
                        <InputField label="Pincode" value={settings.pincode} onChange={v => handleChange('pincode', v)} />
                        <InputField label="Country" value={settings.country} onChange={v => handleChange('country', v)} />
                    </div>
                </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
                <div className="bg-white! rounded-xl! p-6! shadow-sm!">
                    <h3 className="text-lg! font-semibold! mb-4! text-gray-800!">About Us Content</h3>
                    <div className="space-y-4!">
                        <InputField label="About Title" value={settings.aboutTitle} onChange={v => handleChange('aboutTitle', v)} placeholder="Our Story" />
                        <div>
                            <label className="block! text-sm! font-medium! text-gray-700! mb-1!">About Content</label>
                            <textarea
                                value={settings.aboutContent || ''}
                                onChange={e => handleChange('aboutContent', e.target.value)}
                                rows={8}
                                className="w-full! px-4! py-2.5! border! border-gray-200! rounded-lg! focus:ring-2! focus:ring-amber-500! focus:border-transparent!"
                                placeholder="Tell your brand story..."
                            />
                        </div>
                        
                        {/* Image Upload Section */}
                        <div>
                            <label className="block! text-sm! font-medium! text-gray-700! mb-2!">About Page Image</label>
                            
                            {settings.aboutImage ? (
                                <div className="relative! inline-block!">
                                    <img 
                                        src={settings.aboutImage} 
                                        alt="About preview" 
                                        className="h-48! w-72! object-cover! rounded-lg! border! border-gray-200!" 
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute! -top-2! -right-2! bg-red-500! text-white! rounded-full! p-1! hover:bg-red-600!"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-72! h-48! border-2! border-dashed! border-gray-300! rounded-lg! flex! flex-col! items-center! justify-center! cursor-pointer! hover:border-amber-500! hover:bg-amber-50! transition-all!"
                                >
                                    {isUploading ? (
                                        <div className="animate-spin! rounded-full! h-8! w-8! border-b-2! border-amber-600!"></div>
                                    ) : (
                                        <>
                                            <ImagePlus size={32} className="text-gray-400! mb-2!" />
                                            <span className="text-sm! text-gray-500!">Click to upload image</span>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden!"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
                <div className="bg-white! rounded-xl! p-6! shadow-sm!">
                    <h3 className="text-lg! font-semibold! mb-4! text-gray-800!">Social Media Links</h3>
                    <div className="grid! grid-cols-1! md:grid-cols-2! gap-4!">
                        <InputField label="Instagram URL" value={settings.instagram} onChange={v => handleChange('instagram', v)} placeholder="https://instagram.com/..." />
                        <InputField label="Facebook URL" value={settings.facebook} onChange={v => handleChange('facebook', v)} placeholder="https://facebook.com/..." />
                        <InputField label="Twitter URL" value={settings.twitter} onChange={v => handleChange('twitter', v)} placeholder="https://twitter.com/..." />
                        <InputField label="YouTube URL" value={settings.youtube} onChange={v => handleChange('youtube', v)} placeholder="https://youtube.com/..." />
                    </div>
                </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
                <div className="bg-white! rounded-xl! p-6! shadow-sm!">
                    <h3 className="text-lg! font-semibold! mb-4! text-gray-800!">Footer Settings</h3>
                    <div>
                        <label className="block! text-sm! font-medium! text-gray-700! mb-1!">Footer Text / Copyright</label>
                        <textarea
                            value={settings.footerText || ''}
                            onChange={e => handleChange('footerText', e.target.value)}
                            rows={3}
                            className="w-full! px-4! py-2.5! border! border-gray-200! rounded-lg! focus:ring-2! focus:ring-amber-500! focus:border-transparent!"
                            placeholder="© 2024 Celsius. All rights reserved."
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function InputField({ 
    label, 
    value, 
    onChange, 
    type = 'text',
    placeholder = ''
}: { 
    label: string; 
    value: string; 
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="block! text-sm! font-medium! text-gray-700! mb-1!">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full! px-4! py-2.5! border! border-gray-200! rounded-lg! focus:ring-2! focus:ring-amber-500! focus:border-transparent!"
            />
        </div>
    );
}