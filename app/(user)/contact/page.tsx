'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SiteSettings {
    id: string;
    companyName: string;
    tagline: string | null;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    pincode: string | null;
    businessHours: string | null;
}

interface TicketResponse {
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
}

interface Ticket {
    id: string;
    subject: string;
    category: string;
    message: string;
    status: string;
    createdAt: string;
    responses: TicketResponse[];
}

const CATEGORIES = [
    { value: 'ORDER_ISSUE', label: 'Order Issue' },
    { value: 'PAYMENT', label: 'Payment Problem' },
    { value: 'PRODUCT_QUERY', label: 'Product Query' },
    { value: 'RETURN_REFUND', label: 'Return / Refund' },
    { value: '7TH_HEAVEN_CLUB', label: '7th Heaven Club' },
    { value: 'WEBSITE', label: 'Website Issue' },
    { value: 'OTHER', label: 'Other' }
];

export default function ContactPage() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

    // Form state
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('');
    const [message, setMessage] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    useEffect(() => {
        let isMounted = true;
        
        const init = async () => {
            try {
                // Fetch dynamic settings
                const settingsRes = await axios.get('/api/v1/site-settings');
                if (settingsRes.data.success && isMounted) {
                    setSiteSettings(settingsRes.data.data);
                }

                const res = await axios.get('/api/v1/auth/me');
                if (!isMounted) return;
                if (res.data.success) {
                    setIsLoggedIn(true);
                    const ticketRes = await axios.get('/api/v1/tickets');
                    if (ticketRes.data.success && isMounted) {
                        setTickets(ticketRes.data.tickets);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch {
                if (isMounted) setIsLoggedIn(false);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        init();
        
        return () => { isMounted = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!subject || !category || !message) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!isLoggedIn && (!guestName || !guestEmail || !guestPhone)) {
            toast.error('Please provide your contact details');
            return;
        }

        setSubmitting(true);
        try {
            const payload: any = { subject, category, message };
            if (!isLoggedIn) {
                payload.guestName = guestName;
                payload.guestEmail = guestEmail;
                payload.guestPhone = guestPhone;
            }

            const res = await axios.post('/api/v1/tickets', payload);
            if (res.data.success) {
                toast.success(res.data.message);
                setSubject('');
                setCategory('');
                setMessage('');
                setGuestName('');
                setGuestEmail('');
                setGuestPhone('');
                if (isLoggedIn) {
                    const ticketRes = await axios.get('/api/v1/tickets');
                    if (ticketRes.data.success) {
                        setTickets(ticketRes.data.tickets);
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to submit ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryLabel = (value: string) => {
        return CATEGORIES.find(c => c.value === value)?.label || value;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Construct Address dynamically
    // const parts = [
    //     siteSettings?.address,
    //     siteSettings?.city,
    //     siteSettings?.state ? `${siteSettings.state} - ${siteSettings.pincode || ''}` : siteSettings?.pincode,
    //     siteSettings?.country
    // ].filter(Boolean);
    // const displayAddress = parts.join(', ');

        return (
        <div id="main-wrapper">
            {/* Banner - Always Visible */}
            <div 
                className="page-banner-section section min-h-[35vh]! lg:min-h-[45vh]! flex! items-end! pb-[20px]!" 
                style={{ 
                    background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)',
                }}
            >
                <div className="container-fluid px-4 px-md-5">
                    <div className="row">
                        <div className="col-12 p-0">
                            <div className="page-banner w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                                <div className="order-2 order-md-1 mt-2 mt-md-0">
                                    <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                                        <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                                        <li className="text-white/80">Contact Us</li>
                                    </ul>
                                </div>

                                <div className="order-1 order-md-2 text-center text-md-end">
                                    <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                                        Contact Us
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section - Handles Loading Internally */}
            <div className="contact-section section" style={{ padding: '60px 0' }}>
                <div className="container">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                             <div className="text-center">
                                <div className="w-12 h-12 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading contact details...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="row">
                            {/* Dynamic Contact Info */}
                            <div className="col-lg-4 col-12" style={{ marginBottom: '30px' }}>
                                <div className="contact-info" style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(45,42,38,0.08)' }}>
                                    <h3 style={{ color: '#2D2A26', marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>Get In Touch</h3>
                                    
                                    {/* 1. Legal Name */}
                                    {siteSettings?.companyName && (
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '18px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="fa fa-briefcase" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '600' }}>Our Company</h5>
                                                <p style={{ margin: 0, color: '#5C5550', fontSize: '13px' }}>{siteSettings.companyName}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Phone */}
                                    {siteSettings?.phone && (
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '18px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="fa fa-phone" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '600' }}>Phone</h5>
                                                <p style={{ margin: 0, color: '#5C5550', fontSize: '13px' }}>{siteSettings.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. Email */}
                                    {siteSettings?.email && (
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '18px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="fa fa-envelope" style={{ color: 'white', fontSize: '14px' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '600' }}>Email</h5>
                                                <p style={{ margin: 0, color: '#5C5550', fontSize: '13px' }}>{siteSettings.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 5. Hours */}
                                    {siteSettings?.businessHours && (
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #C9A227, #B8860B)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="fa fa-clock-o" style={{ color: 'white', fontSize: '16px' }}></i>
                                            </div>
                                            <div>
                                                <h5 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '600' }}>Hours</h5>
                                                <p style={{ margin: 0, color: '#5C5550', fontSize: '13px' }}>{siteSettings.businessHours}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="col-lg-8 col-12">
                                <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(45,42,38,0.08)' }}>
                                    <h3 style={{ marginBottom: '8px', color: '#2D2A26', fontSize: '20px', fontWeight: '600' }}>Submit a Support Ticket</h3>
                                    <p style={{ color: '#5C5550', marginBottom: '20px', fontSize: '14px' }}>We'll respond within 24-48 hours.</p>
                                    
                                    <form onSubmit={handleSubmit}>
                                        {/* Guest Fields - Rendered if Not Logged In */}
                                        {isLoggedIn === false && (
                                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                                                <p style={{ margin: '0 0 12px', color: '#5C5550', fontSize: '13px' }}>
                                                    <i className="fa fa-info-circle" style={{ color: '#C9A227', marginRight: '6px' }}></i>
                                                    Please provide your contact details.
                                                </p>
                                                <div className="row">
                                                    <div className="col-md-4 col-12" style={{ marginBottom: '12px' }}>
                                                        <input 
                                                            type="text" 
                                                            placeholder="Your Name *"
                                                            value={guestName}
                                                            onChange={(e) => setGuestName(e.target.value)}
                                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px' }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4 col-12" style={{ marginBottom: '12px' }}>
                                                        <input 
                                                            type="email" 
                                                            placeholder="Email *"
                                                            value={guestEmail}
                                                            onChange={(e) => setGuestEmail(e.target.value)}
                                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px' }}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4 col-12" style={{ marginBottom: '12px' }}>
                                                        <input 
                                                            type="tel" 
                                                            placeholder="Phone *"
                                                            value={guestPhone}
                                                            onChange={(e) => setGuestPhone(e.target.value)}
                                                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px' }}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="row">
                                            <div className="col-md-6 col-12" style={{ marginBottom: '12px' }}>
                                                <select 
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px', background: 'white' }}
                                                    required
                                                >
                                                    <option value="">Select Category *</option>
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-md-6 col-12" style={{ marginBottom: '12px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Subject *"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px' }}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12" style={{ marginBottom: '15px' }}>
                                                <textarea 
                                                    placeholder="Describe your issue in detail... *"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    rows={4}
                                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5DFD5', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12">
                                                <button 
                                                    type="submit" 
                                                    disabled={submitting}
                                                    style={{ 
                                                        background: 'linear-gradient(135deg, #C9A227, #B8860B)', 
                                                        color: 'white', 
                                                        border: 'none', 
                                                        padding: '12px 30px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '14px', 
                                                        fontWeight: '600', 
                                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                                        opacity: submitting ? 0.7 : 1
                                                    }}
                                                >
                                                    {submitting ? 'Submitting...' : '✈ Submit Ticket'}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User's Tickets Section */}
                    {isLoggedIn && tickets.length > 0 && (
                        <div className="row" style={{ marginTop: '40px' }}>
                            <div className="col-12">
                                <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(45,42,38,0.08)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#2D2A26' }}>
                                            🎫 Your Support Tickets ({tickets.length})
                                        </h4>
                                    </div>
                                    
                                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                        {tickets.map(ticket => (
                                            <div 
                                                key={ticket.id} 
                                                style={{ 
                                                    border: '1px solid #E5DFD5', 
                                                    borderRadius: '8px', 
                                                    marginBottom: '10px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <div 
                                                    onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                                                    style={{ 
                                                        padding: '12px 15px', 
                                                        background: expandedTicket === ticket.id ? '#fafafa' : 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                                            <span style={{ 
                                                                background: ticket.status === 'OPEN' ? '#28a745' : '#6c757d',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '10px',
                                                                fontSize: '10px',
                                                                fontWeight: '600'
                                                            }}>
                                                                {ticket.status}
                                                            </span>
                                                            <span style={{ fontSize: '11px', color: '#8A847D' }}>#{ticket.id.slice(-6).toUpperCase()}</span>
                                                            <span style={{ background: '#C9A227', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>
                                                                {getCategoryLabel(ticket.category)}
                                                            </span>
                                                        </div>
                                                        <h6 style={{ margin: 0, fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</h6>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                                        {ticket.responses.length > 0 && (
                                                            <span style={{ fontSize: '11px', color: '#28a745' }}>
                                                                💬 {ticket.responses.length}
                                                            </span>
                                                        )}
                                                        <i className={`fa fa-chevron-${expandedTicket === ticket.id ? 'up' : 'down'}`} style={{ color: '#8A847D', fontSize: '12px' }}></i>
                                                    </div>
                                                </div>

                                                {expandedTicket === ticket.id && (
                                                    <div style={{ padding: '12px 15px', borderTop: '1px solid #E5DFD5', background: '#fafafa', fontSize: '13px' }}>
                                                        <p style={{ margin: '0 0 10px', color: '#5C5550' }}><strong>Your message:</strong> {ticket.message}</p>
                                                        <p style={{ margin: '0 0 10px', color: '#8A847D', fontSize: '11px' }}>Submitted: {formatDate(ticket.createdAt)}</p>
                                                        
                                                        {ticket.responses.length > 0 ? (
                                                            <div style={{ marginTop: '10px' }}>
                                                                <p style={{ fontSize: '11px', color: '#8A847D', marginBottom: '8px' }}>Responses:</p>
                                                                {ticket.responses.map(response => (
                                                                    <div 
                                                                        key={response.id}
                                                                        style={{ 
                                                                            background: response.isAdmin ? 'linear-gradient(135deg, #C9A227, #B8860B)' : '#fff',
                                                                            color: response.isAdmin ? 'white' : '#2D2A26',
                                                                            padding: '10px 12px',
                                                                            borderRadius: '6px',
                                                                            marginBottom: '6px',
                                                                            border: response.isAdmin ? 'none' : '1px solid #E5DFD5'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                            <span style={{ fontWeight: '600', fontSize: '11px' }}>{response.isAdmin ? '👤 Support' : 'You'}</span>
                                                                            <span style={{ fontSize: '10px', opacity: 0.8 }}>{formatDate(response.createdAt)}</span>
                                                                        </div>
                                                                        <p style={{ margin: 0, fontSize: '12px' }}>{response.message}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p style={{ color: '#8A847D', fontStyle: 'italic', margin: 0, fontSize: '12px' }}>
                                                                ⏳ Awaiting response...
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}