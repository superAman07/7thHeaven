'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface SiteSettings {
    companyName: string;
    tagline: string;
    logoUrl: string;  
    phone: string;
    email: string;
    whatsapp: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    gstNumber: string;
    businessHours: string;
    instagram: string;
    facebook: string;
    twitter: string;
    youtube: string;
    aboutTitle: string;
    aboutContent: string;
    aboutImage: string;
    footerText: string;
    announcementText: string;
    showAnnouncement: boolean;
    announcementLink: string;
}

const defaultSettings: SiteSettings = {
    companyName: '',
    tagline: '',
    logoUrl: '',
    phone: '',
    email: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstNumber: '',
    businessHours: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    aboutTitle: '',
    aboutContent: '',
    aboutImage: '',
    footerText: '',
    announcementText: '',
    showAnnouncement: false,
    announcementLink: ''
};

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'contact' | 'about' | 'homeAbout' | 'social' | 'announcement' | 'footer'>('contact');
    const [hasFetched, setHasFetched] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [homeAbout, setHomeAbout] = useState({
        displayTitle: 'The Celsius Story',
        image: '/assets/images/bg-hero.png',
        imageAlt: 'Celsius Luxury Perfume',
        paragraphs: [
            'Celsius is not just a perfume; it\'s a statement of Indian luxury.',
            'Our perfumers source the finest essential oils from across the globe.',
            'With Celsius by 7th Heaven, you are buying direct luxury.',
        ],
        buttonText: 'Read More',
        buttonLink: '/about',
        showButton: true,
    });
    const [homeAboutLoaded, setHomeAboutLoaded] = useState(false);
    const homeAboutImageRef = useRef<HTMLInputElement>(null);
    const [isUploadingHomeAboutImage, setIsUploadingHomeAboutImage] = useState(false);
    
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

    useEffect(() => {
        if (activeTab === 'homeAbout' && !homeAboutLoaded) {
            axios.get('/api/v1/content/home_about')
                .then(res => {
                    if (res.data.success && res.data.data) {
                        setHomeAbout(prev => ({ ...prev, ...res.data.data }));
                    }
                })
                .catch(() => toast.error('Failed to load homepage about data'))
                .finally(() => setHomeAboutLoaded(true));
        }
    }, [activeTab, homeAboutLoaded]);

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

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploadingLogo(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/v1/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                handleChange('logoUrl', response.data.data.url);
                toast.success('Logo uploaded successfully!');
            }
        } catch (err) {
            console.error('Logo upload failed:', err);
            toast.error('Logo upload failed. Please try again.');
        } finally {
            setIsUploadingLogo(false);
            if (logoInputRef.current) {
                logoInputRef.current.value = '';
            }
        }
    };

    const handleSaveHomeAbout = async () => {
        setSaving(true);
        try {
            const res = await axios.put('/api/v1/content/home_about', homeAbout);
            if (res.data.success) {
                toast.success('Homepage About section saved!');
            }
        } catch (error) {
            toast.error('Failed to save homepage about section');
        } finally {
            setSaving(false);
        }
    };
    // Image upload for Homepage About section
    const handleHomeAboutImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setIsUploadingHomeAboutImage(true);
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post('/api/v1/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                setHomeAbout(prev => ({ ...prev, image: response.data.data.url }));
                toast.success('Image uploaded!');
            }
        } catch (err) {
            toast.error('Image upload failed.');
        } finally {
            setIsUploadingHomeAboutImage(false);
            if (homeAboutImageRef.current) {
                homeAboutImageRef.current.value = '';
            }
        }
    };
    // Paragraph helpers
    const updateParagraph = (index: number, value: string) => {
        const updated = [...homeAbout.paragraphs];
        updated[index] = value;
        setHomeAbout(prev => ({ ...prev, paragraphs: updated }));
    };
    const addParagraph = () => {
        setHomeAbout(prev => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }));
    };
    const removeParagraph = (index: number) => {
        setHomeAbout(prev => ({
            ...prev,
            paragraphs: prev.paragraphs.filter((_, i) => i !== index),
        }));
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
        { id: 'homeAbout', label: '🏠 Homepage About' },
        { id: 'social', label: '🔗 Social Links' },
        { id: 'announcement', label: '📢 Announcement' },
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
                    onClick={activeTab === 'homeAbout' ? handleSaveHomeAbout : handleSave}
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
                    <h3 className="text-lg! font-semibold! mb-4! text-gray-800!">Site Logo</h3>
                    <div className="mb-6! pb-6! border-b! border-gray-200!">
                        {settings.logoUrl ? (
                            <div className="relative! inline-block!">
                                <img 
                                    src={settings.logoUrl} 
                                    alt="Site Logo" 
                                    className="h-20! max-w-[200px]! object-contain! rounded-lg! border! border-gray-200! bg-gray-50! p-2!" 
                                />
                                <button
                                    type="button"
                                    onClick={() => handleChange('logoUrl', '')}
                                    className="absolute! -top-2! -right-2! bg-red-500! text-white! rounded-full! p-1! hover:bg-red-600!"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="w-48! h-20! border-2! border-dashed! border-gray-300! rounded-lg! flex! flex-col! items-center! justify-center! cursor-pointer! hover:border-amber-500! hover:bg-amber-50! transition-all!"
                            >
                                {isUploadingLogo ? (
                                    <div className="animate-spin! rounded-full! h-6! w-6! border-b-2! border-amber-600!"></div>
                                ) : (
                                    <>
                                        <ImagePlus size={24} className="text-gray-400! mb-1!" />
                                        <span className="text-xs! text-gray-500!">Upload Logo</span>
                                    </>
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={logoInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden!"
                        />
                        <p className="text-xs! text-gray-400! mt-2!">Recommended: PNG with transparent background, max height 80px</p>
                    </div>
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
                    <div className="grid! grid-cols-1! gap-4! mt-4!">
                        <label>GST Number: </label>
                        <input 
                            type="text" 
                            value={settings.gstNumber || ''} 
                            onChange={(e) => setSettings({...settings, gstNumber: e.target.value})}
                            placeholder="e.g. 22AAAAA0000A1Z5"
                        />
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

            {/* Homepage About Tab */}
            {activeTab === 'homeAbout' && (
                <div className="bg-white! rounded-xl! p-6! shadow-sm!">
                    <div className="flex! items-center! gap-2! mb-1!">
                        <h3 className="text-lg! font-semibold! text-gray-800!">Homepage — About Us Section</h3>
                    </div>
                    <p className="text-sm! text-gray-500! mb-6!">This content appears on the homepage as a short teaser. Different from the full About page.</p>

                    <div className="space-y-5!">
                        {/* Title */}
                        <InputField
                            label="Display Title"
                            value={homeAbout.displayTitle}
                            onChange={v => setHomeAbout(prev => ({ ...prev, displayTitle: v }))}
                            placeholder="e.g., The Celsius Story"
                        />

                        {/* Image */}
                        <div>
                            <label className="block! text-sm! font-medium! text-gray-700! mb-2!">Section Image</label>
                            {homeAbout.image ? (
                                <div className="relative! inline-block!">
                                    <img
                                        src={homeAbout.image}
                                        alt={homeAbout.imageAlt}
                                        className="h-48! w-72! object-cover! rounded-lg! border! border-gray-200!"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setHomeAbout(prev => ({ ...prev, image: '' }))}
                                        className="absolute! -top-2! -right-2! bg-red-500! text-white! rounded-full! p-1! hover:bg-red-600!"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => homeAboutImageRef.current?.click()}
                                    className="w-72! h-48! border-2! border-dashed! border-gray-300! rounded-lg! flex! flex-col! items-center! justify-center! cursor-pointer! hover:border-amber-500! hover:bg-amber-50! transition-all!"
                                >
                                    {isUploadingHomeAboutImage ? (
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
                                ref={homeAboutImageRef}
                                onChange={handleHomeAboutImageUpload}
                                accept="image/*"
                                className="hidden!"
                            />
                        </div>

                        {/* Image Alt */}
                        <InputField
                            label="Image Alt Text"
                            value={homeAbout.imageAlt}
                            onChange={v => setHomeAbout(prev => ({ ...prev, imageAlt: v }))}
                            placeholder="e.g., Celsius Luxury Perfume"
                        />

                        {/* Paragraphs */}
                        <div>
                            <label className="block! text-sm! font-medium! text-gray-700! mb-2!">
                                Paragraphs ({homeAbout.paragraphs.length})
                            </label>
                            <div className="space-y-3!">
                                {homeAbout.paragraphs.map((p, i) => (
                                    <div key={i} className="flex! gap-2!">
                                        <textarea
                                            value={p}
                                            onChange={e => updateParagraph(i, e.target.value)}
                                            rows={3}
                                            className="flex-1! px-4! py-2.5! border! border-gray-200! rounded-lg! focus:ring-2! focus:ring-amber-500! focus:border-transparent!"
                                            placeholder={`Paragraph ${i + 1}`}
                                        />
                                        <button
                                            onClick={() => removeParagraph(i)}
                                            className="text-red-500! hover:text-red-700! px-2! self-start! mt-2!"
                                            title="Remove paragraph"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addParagraph}
                                className="mt-3! text-amber-600! hover:text-amber-800! text-sm! font-medium!"
                            >
                                + Add Paragraph
                            </button>
                        </div>

                        {/* Button Settings */}
                        <div className="p-4! bg-gray-50! rounded-lg! border! border-gray-200!">
                            <div className="flex! items-center! justify-between! mb-4!">
                                <div>
                                    <h4 className="font-medium! text-gray-900!">Show Button</h4>
                                    <p className="text-sm! text-gray-500!">Show a "Read More" style button below the text</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={homeAbout.showButton}
                                        onChange={e => setHomeAbout(prev => ({ ...prev, showButton: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                </label>
                            </div>
                            {homeAbout.showButton && (
                                <div className="grid! grid-cols-1! md:grid-cols-2! gap-4!">
                                    <InputField
                                        label="Button Text"
                                        value={homeAbout.buttonText}
                                        onChange={v => setHomeAbout(prev => ({ ...prev, buttonText: v }))}
                                        placeholder="Read More"
                                    />
                                    <InputField
                                        label="Button Link"
                                        value={homeAbout.buttonLink}
                                        onChange={v => setHomeAbout(prev => ({ ...prev, buttonLink: v }))}
                                        placeholder="/about"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'announcement' && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Announcement Bar</h3>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <h4 className="font-medium text-gray-900">Show Announcement Bar</h4>
                            <p className="text-sm text-gray-500">Enable to show the strip at the top of the website</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.showAnnouncement}
                                onChange={e => setSettings(prev => ({ ...prev, showAnnouncement: e.target.checked }))}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <InputField 
                            label="Announcement Text" 
                            value={settings.announcementText} 
                            onChange={v => handleChange('announcementText', v)} 
                            placeholder="e.g., Free Shipping on Orders Over ₹999!" 
                        />
                        
                        <InputField 
                            label="Link URL (Optional)" 
                            value={settings.announcementLink} 
                            onChange={v => handleChange('announcementLink', v)} 
                            placeholder="e.g., /collections/sale" 
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            If provided, the entire bar becomes clickable. Start with <code>/</code> for internal pages.
                        </p>
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