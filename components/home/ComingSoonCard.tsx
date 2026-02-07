'use client';

import React from 'react';
import Link from 'next/link';

export const ComingSoonCard = () => {
    return (
        <>
            <style jsx>{`
                .coming-soon-card {
                    position: relative;
                    background: linear-gradient(145deg, #fafafa, #f0f0f0);
                    border: 2px dashed #ddb040;
                    border-radius: 12px;
                    overflow: hidden;
                    min-height: 420px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 30px 20px;
                    transition: all 0.3s ease;
                }
                .coming-soon-card:hover {
                    border-color: #b6902e;
                    box-shadow: 0 10px 30px rgba(221, 176, 64, 0.15);
                }
                .coming-soon-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.05); opacity: 1; }
                }
                .coming-soon-title {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.8rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                    letter-spacing: 2px;
                }
                .coming-soon-text {
                    color: #777;
                    font-size: 0.9rem;
                    margin-bottom: 20px;
                    max-width: 200px;
                }
                .coming-soon-btn {
                    display: inline-block;
                    background-color: #ddb040;
                    color: #1a1a1a;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    padding: 12px 25px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .coming-soon-btn:hover {
                    background-color: #1a1a1a;
                    color: #ddb040;
                }
            `}</style>

            <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-30">
                <div className="coming-soon-card">
                    <div className="coming-soon-icon">🚀</div>
                    <h3 className="coming-soon-title">Coming Soon</h3>
                    <p className="coming-soon-text">
                        Exciting new products are on the way!
                    </p>
                    <Link href="/contact" className="coming-soon-btn">
                        Enquire Now
                    </Link>
                </div>
            </div>
        </>
    );
};