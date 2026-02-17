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
                    margin: 0 auto;
                    padding: 50px 40px;
                    text-align: center;
                    background: linear-gradient(135deg, #fdfbf7 0%, #f5f0e8 100%);
                    border: 1px solid rgba(182, 144, 46, 0.2);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .coming-soon-luxury::before {
                    content: '';
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    right: 12px;
                    bottom: 12px;
                    border: 1px solid rgba(182, 144, 46, 0.15);
                    border-radius: 2px;
                    pointer-events: none;
                }
                .cs-gold-line {
                    width: 50px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #B6902E, transparent);
                    margin: 0 auto 20px;
                }
                .cs-subtitle {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    color: #B6902E;
                    margin-bottom: 12px;
                }
                .cs-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 2rem;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                    letter-spacing: 1px;
                }
                .cs-desc {
                    color: #888;
                    font-size: 0.85rem;
                    line-height: 1.7;
                    max-width: 380px;
                    margin: 0 auto 28px;
                }
                .cs-notify-form {
                    display: flex;
                    gap: 0;
                    max-width: 360px;
                    margin: 0 auto 20px;
                    border: 1px solid #ddd;
                    border-radius: 2px;
                    overflow: hidden;
                }
                .cs-notify-form input {
                    flex: 1;
                    padding: 12px 16px;
                    border: none;
                    outline: none;
                    font-size: 13px;
                    background: white;
                    color: #333;
                }
                .cs-notify-form input::placeholder {
                    color: #bbb;
                    letter-spacing: 0.5px;
                }
                .cs-notify-btn {
                    padding: 12px 22px;
                    background: #1a1a1a;
                    color: #D4AF37;
                    border: none;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }
                .cs-notify-btn:hover {
                    background: #B6902E;
                    color: #fff;
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
                    color: #ccc;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .cs-divider-text::before,
                .cs-divider-text::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e0d9cc;
                }
                .cs-browse-link {
                    display: inline-block;
                    color: #1a1a1a;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    text-decoration: none;
                    border-bottom: 1px solid #B6902E;
                    padding-bottom: 2px;
                    transition: all 0.3s ease;
                }
                .cs-browse-link:hover {
                    color: #B6902E;
                }
                .cs-success {
                    color: #B6902E;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    animation: fadeIn 0.5s ease;
                    margin-bottom: 0;
                }
                .cs-error {
                    color: #dc3545;
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

                    <Link href="/collections/perfumes" className="cs-browse-link">
                        Browse All Fragrances
                    </Link>
                </div>
            </div>
        </>
    );
};