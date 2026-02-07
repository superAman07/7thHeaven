'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface HowItWorksProps {
  minPurchaseAmount?: number;
}

// Reward data for each heaven (odd levels have rewards)
const HEAVEN_REWARDS = [
  { heaven: 1, reward: '₹5,000', rewardLabel: 'Gift Worth' },
  { heaven: 2, reward: null, rewardLabel: null },
  { heaven: 3, reward: '₹25,000', rewardLabel: 'Reward Worth' },
  { heaven: 4, reward: null, rewardLabel: null },
  { heaven: 5, reward: '₹1,25,000', rewardLabel: 'Reward Worth' },
  { heaven: 6, reward: null, rewardLabel: null },
  { heaven: 7, reward: '₹1 Crore', rewardLabel: 'Grand Prize' },
];

export default function HowItWorks({ minPurchaseAmount = 2000 }: HowItWorksProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="how-it-works-section py-16 md:py-24 bg-gradient-to-b from-[#1a1a1a] to-[#252525] overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center mb-12 md:mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2
            className="text-3xl! md:text-4xl! lg:text-5xl! font-serif text-[#E6B422]! mb-4"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            How 7th Heaven Works?
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto">
            Your journey to <span className="text-[#E6B422] font-bold">₹1 Crore</span> starts
            with a single purchase. Follow the path and ascend through 7 Heavens.
          </p>
        </div>

        {/* Steps Section */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-20 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Step 1 */}
          <div className="step-card group">
            <div className="step-number">1</div>
            <div className="step-icon">🛒</div>
            <h3 className="step-title">Make a Purchase</h3>
            <p className="step-desc">
              Purchase products worth{' '}
              <span className="text-[#E6B422] font-bold">₹{minPurchaseAmount.toLocaleString('en-IN')}</span>{' '}
              or more to become a 7th Heaven member.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card group">
            <div className="step-number">2</div>
            <div className="step-icon">🔑</div>
            <h3 className="step-title">Get Your Referral Code</h3>
            <p className="step-desc">
              Receive your unique referral code via email or find it on your{' '}
              <Link href="/my-account" className="text-[#E6B422] underline hover:text-white transition-colors">
                Account Page
              </Link>
              .
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card group">
            <div className="step-number">3</div>
            <div className="step-icon">👥</div>
            <h3 className="step-title">Refer 5 People</h3>
            <p className="step-desc">
              Share your code! Each referral must purchase ₹{minPurchaseAmount.toLocaleString('en-IN')}+ to
              count as your <span className="text-[#E6B422]">Heaven 1</span> team.
            </p>
          </div>

          {/* Step 4 */}
          <div className="step-card group">
            <div className="step-number">4</div>
            <div className="step-icon">🏆</div>
            <h3 className="step-title">Ascend & Earn Rewards</h3>
            <p className="step-desc">
              As your team grows through 7 Heavens, unlock exclusive rewards at{' '}
              <span className="text-[#E6B422]">Heaven 1, 3, 5 & 7</span>!
            </p>
          </div>
        </div>

        {/* Staircase Visualization */}
        <div
          className={`mb-16 md:mb-20 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-center text-xl md:text-2xl font-serif text-white mb-8">
            The <span className="text-[#E6B422]">Stairway</span> to Heaven
          </h3>

          {/* Staircase Container */}
          <div className="staircase-container">
            {HEAVEN_REWARDS.slice()
              .reverse()
              .map((item, index) => {
                const actualHeaven = 7 - index;
                const hasReward = item.reward !== null;
                const delayClass = `delay-${(index + 1) * 100}`;

                return (
                  <div
                    key={item.heaven}
                    className={`stair-step ${hasReward ? 'has-reward' : ''} ${
                      isVisible ? 'animate-stair' : ''
                    }`}
                    style={{
                      animationDelay: `${(index + 1) * 0.1}s`,
                      width: `${45 + index * 8}%`,
                    }}
                  >
                    <div className="stair-content">
                      <span className="heaven-label">Heaven {actualHeaven}</span>
                      {hasReward && (
                        <div className="reward-badge">
                          <span className="reward-label">{item.rewardLabel}</span>
                          <span className="reward-amount">{item.reward}</span>
                        </div>
                      )}
                    </div>
                    {actualHeaven === 7 && (
                      <div className="crown-icon">👑</div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Referral Tree Visualization */}
        <div
          className={`mb-12 transition-all duration-1000 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h3 className="text-center text-xl md:text-2xl font-serif text-white mb-3">
            Your <span className="text-[#E6B422]">Network</span> Grows Exponentially
          </h3>
          <p className="text-center text-gray-500 text-xs md:text-sm mb-8">
            Each member refers 5 people, and so does their team!
          </p>

          {/* Tree Container with Fade Edges */}
          <div className="tree-wrapper">
            <div className="tree-container">
              {/* You (Root) */}
              <div className="tree-level level-root">
                <div className="tree-node root-node">
                  <span>YOU</span>
                </div>
              </div>

              {/* Connector Lines */}
              <div className="tree-connector"></div>

              {/* Heaven 1 - 5 Referrals */}
              <div className="tree-level level-1">
                <div className="level-label">Heaven 1</div>
                <div className="tree-nodes">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="tree-node child-node">
                      <span>👤</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector Lines */}
              <div className="tree-connector multi"></div>

              {/* Heaven 2 - Faded indication */}
              <div className="tree-level level-2">
                <div className="level-label">Heaven 2</div>
                <div className="tree-nodes faded-level">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="tree-node grandchild-node">
                      <span>👤</span>
                    </div>
                  ))}
                  <div className="more-indicator">+16 more</div>
                </div>
              </div>

              {/* Fade indicator for remaining levels */}
              <div className="remaining-levels">
                <div className="dots-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="text-gray-500 text-xs uppercase tracking-widest">
                  Continues to Heaven 7
                </p>
              </div>
            </div>

            {/* Gradient Fade Overlays */}
            <div className="fade-left"></div>
            <div className="fade-right"></div>
          </div>
        </div>

        {/* Important Note */}
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-r from-[#E6B422]/10 via-[#E6B422]/20 to-[#E6B422]/10 border border-[#E6B422]/30 rounded-xl p-6 md:p-8">
            <div className="text-3xl mb-3">🎁</div>
            <h4 className="text-lg! md:text-xl! font-serif! text-[#E6B422]! mb-2!">
              Rewards at Every Odd Heaven
            </h4>
            <p className="text-gray-400! text-sm!">
              Complete <span className="text-white! font-bold!">Heaven 1</span> → Gift worth ₹5,000 |{' '}
              <span className="text-white! font-bold!">Heaven 3</span> → ₹25,000 |{' '}
              <span className="text-white! font-bold!">Heaven 5</span> → ₹1,25,000 |{' '}
              <span className="text-[#E6B422]! font-bold!">Heaven 7</span> → <span className="text-[#E6B422]! font-bold! text-lg!">₹1 CRORE!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Inline Styles */}
      <style jsx>{`
        /* Step Cards */
        .step-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .step-card:hover {
          border-color: rgba(230, 180, 34, 0.3);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #E6B422, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .step-card:hover::before {
          opacity: 1;
        }
        .step-number {
          position: absolute;
          top: 10px;
          left: 10px;
          width: 24px;
          height: 24px;
          background: #E6B422;
          color: #1a1a1a;
          border-radius: 50%;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .step-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .step-title {
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .step-desc {
          color: #9ca3af;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        /* Staircase */
        .staircase-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 2rem 0;
        }
        .stair-step {
          background: linear-gradient(90deg, rgba(230,180,34,0.1), rgba(230,180,34,0.05));
          border: 1px solid rgba(230,180,34,0.2);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          margin-bottom: -1px;
          position: relative;
          opacity: 0;
          transform: translateX(-30px);
          transition: all 0.3s ease;
        }
        .stair-step.animate-stair {
          animation: slideInStair 0.6s ease forwards;
        }
        @keyframes slideInStair {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .stair-step.has-reward {
          background: linear-gradient(90deg, rgba(230,180,34,0.25), rgba(230,180,34,0.1));
          border-color: rgba(230,180,34,0.5);
          box-shadow: 0 0 20px rgba(230,180,34,0.2);
        }
        .stair-step:hover {
          transform: scale(1.02);
          box-shadow: 0 0 30px rgba(230,180,34,0.3);
        }
        .stair-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .heaven-label {
          color: #E6B422;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .reward-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .reward-label {
          color: #9ca3af;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .reward-amount {
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
        }
        .stair-step.has-reward .reward-amount {
          color: #E6B422;
          text-shadow: 0 0 10px rgba(230,180,34,0.5);
        }
        .crown-icon {
          position: absolute;
          top: -20px;
          right: 10px;
          font-size: 1.5rem;
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        /* Tree Visualization */
        .tree-wrapper {
          position: relative;
          overflow: hidden;
          padding: 1rem 0;
        }
        .tree-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0 2rem;
        }
        .tree-level {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .level-label {
          color: #E6B422;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .tree-nodes {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
        }
        .tree-node {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: all 0.3s;
        }
        .root-node {
          width: 60px;
          height: 60px;
          background: linear-gradient(145deg, #E6B422, #b8912a);
          color: #1a1a1a;
          font-weight: bold;
          font-size: 0.75rem;
          box-shadow: 0 0 30px rgba(230,180,34,0.5);
        }
        .child-node {
          background: linear-gradient(145deg, rgba(230,180,34,0.3), rgba(230,180,34,0.1));
          border: 2px solid rgba(230,180,34,0.5);
        }
        .grandchild-node {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          width: 35px;
          height: 35px;
          font-size: 0.8rem;
        }
        .faded-level {
          position: relative;
        }
        .faded-level::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 100%;
          background: linear-gradient(to bottom, transparent 30%, #252525);
          pointer-events: none;
        }
        .more-indicator {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          color: #6b7280;
          font-size: 0.7rem;
          white-space: nowrap;
        }
        .tree-connector {
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, #E6B422, rgba(230,180,34,0.3));
        }
        .tree-connector.multi {
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(230,180,34,0.3), #E6B422, rgba(230,180,34,0.3), transparent);
        }
        .remaining-levels {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
        }
        .dots-indicator {
          display: flex;
          gap: 8px;
        }
        .dots-indicator span {
          width: 8px;
          height: 8px;
          background: rgba(230,180,34,0.4);
          border-radius: 50%;
          animation: dot-pulse 1.5s infinite;
        }
        .dots-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dots-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Fade Overlays */
        .fade-left, .fade-right {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 80px;
          pointer-events: none;
          z-index: 10;
        }
        .fade-left {
          left: 0;
          background: linear-gradient(to right, #252525, transparent);
        }
        .fade-right {
          right: 0;
          background: linear-gradient(to left, #252525, transparent);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stair-step {
            width: 90% !important;
            padding: 0.6rem 1rem;
          }
          .stair-content {
            flex-direction: column;
            gap: 0.3rem;
            text-align: center;
          }
          .reward-badge {
            align-items: center;
          }
          .tree-node.child-node {
            width: 38px;
            height: 38px;
          }
          .tree-node.grandchild-node {
            width: 30px;
            height: 30px;
          }
          .step-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}