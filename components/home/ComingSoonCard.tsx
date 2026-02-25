'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface ComingSoonCardProps {
    collectionSlug?: string;
}

export const ComingSoonCard = ({ collectionSlug }: ComingSoonCardProps) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle');

    const handleNotify = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await axios.post('/api/v1/notify-me', {
                email,
                collectionSlug: collectionSlug || 'general',
                source: 'coming_soon',
            });

            if (res.data.success) {
                setStatus(res.data.alreadySubscribed ? 'already' : 'success');
                setEmail('');
            } else {
                setStatus('error');
            }
        } catch (err: any) {
            // If it's a duplicate, still show success (user already subscribed)
            if (err?.response?.status === 409) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        }
    };

    return (
        <>
            <style jsx>{`
                .coming-soon-luxury {
                    position: relative;
                    width: 100%;
                    max-width: 600px;
                    margin: 10px auto;
                    padding: 50px 40px;
                    text-align: center;
                    background: linear-gradient(145deg, #1a1a1a 0%, #2a2520 50%, #1a1a1a 100%);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(212, 175, 55, 0.1);
                }
                .coming-soon-luxury::before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                    border: 1px solid rgba(212, 175, 55, 0.15);
                    border-radius: 4px;
                    pointer-events: none;
                }
                .coming-soon-luxury::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(ellipse at center, rgba(212, 175, 55, 0.05) 0%, transparent 60%);
                    pointer-events: none;
                }
                .cs-gold-line {
                    width: 60px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
                    margin: 0 auto 24px;
                }
                .cs-subtitle {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 5px;
                    text-transform: uppercase;
                    color: #D4AF37;
                    margin-bottom: 14px;
                }
                .cs-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2rem;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 10px;
                    letter-spacing: 1px;
                }
                .cs-desc {
                    color: #999;
                    font-size: 0.85rem;
                    line-height: 1.8;
                    max-width: 380px;
                    margin: 0 auto 30px;
                }
                .cs-notify-form {
                    display: flex;
                    gap: 0;
                    max-width: 340px;
                    margin: 0 auto 20px;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    border-radius: 4px;
                    overflow: hidden;
                }
                @media (max-width: 480px) {
                    .coming-soon-luxury {
                        padding: 40px 20px;
                        margin: 10px 10px;
                    }
                    .cs-notify-form {
                        flex-direction: column;
                        max-width: 100%;
                        border: none;
                        gap: 10px;
                    }
                    .cs-notify-form input {
                        border: 1px solid rgba(212, 175, 55, 0.3) !important;
                        border-radius: 4px !important;
                        background: rgba(255,255,255,0.05) !important;
                        color: #fff !important;
                    }
                    .cs-notify-btn {
                        border-radius: 4px !important;
                        width: 100% !important;
                        padding: 14px 22px !important;
                    }
                    .cs-title {
                        font-size: 1.6rem;
                    }
                }
                .cs-notify-form input {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    outline: none;
                    font-size: 13px;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    min-width: 0;
                }
                .cs-notify-form input::placeholder {
                    color: #777;
                    letter-spacing: 0.5px;
                }
                .cs-notify-btn {
                    padding: 12px 22px;
                    background: linear-gradient(135deg, #D4AF37, #B6902E);
                    color: #1a1a1a;
                    border: none;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .cs-notify-btn:hover {
                    background: linear-gradient(135deg, #e8c84a, #D4AF37);
                    color: #000;
                }
                .cs-notify-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .cs-divider-text {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 20px auto;
                    max-width: 300px;
                    color: #555;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .cs-divider-text::before,
                .cs-divider-text::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: rgba(212, 175, 55, 0.2);
                }
                .cs-browse-link {
                    display: inline-block;
                    color: #D4AF37 !important;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(212, 175, 55, 0.4);
                    padding-bottom: 2px;
                    transition: all 0.3s ease;
                }
                .cs-browse-link:hover {
                    color: #fff;
                    border-bottom-color: #fff;
                }
                .cs-success {
                    color: #D4AF37;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    animation: fadeIn 0.5s ease;
                    margin-bottom: 0;
                }
                .cs-error {
                    color: #e57373;
                    font-size: 12px;
                    margin-top: 8px;
                    animation: fadeIn 0.3s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="col-12">
                <div className="coming-soon-luxury">
                    <div className="cs-subtitle">Exclusively Crafted</div>
                    <h3 className="cs-title">Something Special Awaits</h3>
                    <div className="cs-gold-line"></div>
                    <p className="cs-desc">
                        Our perfumers are crafting something extraordinary for this collection.
                        Be the first to experience it.
                    </p>

                    {(status === 'success' || status === 'already') ? (
                        <p className="cs-success">
                            {status === 'already'
                                ? '🔔 You\'re already on the list! We\'ll notify you at launch.'
                                : '✓ You\'re on the list! We\'ll notify you at launch.'}
                        </p>
                    ) : (
                        <>
                            <form onSubmit={handleNotify} className="cs-notify-form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    className="cs-notify-btn"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Saving...' : 'Notify Me'}
                                </button>
                            </form>
                            {status === 'error' && (
                                <p className="cs-error">Something went wrong. Please try again.</p>
                            )}
                        </>
                    )}

                    <div className="cs-divider-text">
                        <span>or</span>
                    </div>

                    <Link href="/collections/perfumes" className="cs-browse-link" style={{ color: '#D4AF37' }}>
                        Browse All Fragrances
                    </Link>
                </div>
            </div>
        </>
    );
};