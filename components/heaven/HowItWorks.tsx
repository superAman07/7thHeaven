'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

interface HowItWorksProps {
  minPurchaseAmount?: number;
}

/* ──────── SVG Icon Components ──────── */
const ShoppingBagIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const KeyIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);
const UsersIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const NetworkIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="3"/>
    <circle cx="5" cy="19" r="3"/>
    <circle cx="19" cy="19" r="3"/>
    <line x1="12" y1="8" x2="5" y2="16"/>
    <line x1="12" y1="8" x2="19" y2="16"/>
  </svg>
);
const TrophyIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 000-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
    <path d="M18 2H6v7a6 6 0 0012 0V2z"/>
  </svg>
);
const GiftIcon = ({ className = '', style = {} }: { className?: string, style?: React.CSSProperties }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="20 12 20 22 4 22 4 12"/>
    <rect x="2" y="7" width="20" height="5"/>
    <line x1="12" y1="22" x2="12" y2="7"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
  </svg>
);

/* ──────── POP Color Palette ──────── */
const POP = {
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDark: '#7C3AED',
  gold: '#F59E0B',
  goldLight: '#FBBF24',
  goldDark: '#D97706',
  pink: '#EC4899',
  pinkLight: '#F472B6',
  pinkDark: '#DB2777',
  blue: '#3B82F6',
};

/* ──────── Staircase Data ──────── */
const HEAVENS = [
  { level: 1, target: 5,     reward: '₹5,000',    rewardLabel: 'Gift Worth',   hasReward: true,  color: POP.purple },
  { level: 2, target: 25,    reward: null,          rewardLabel: null,           hasReward: false, color: POP.blue },
  { level: 3, target: 125,   reward: '₹25,000',   rewardLabel: 'Reward Worth', hasReward: true,  color: POP.pink },
  { level: 4, target: 625,   reward: null,          rewardLabel: null,           hasReward: false, color: POP.blue },
  { level: 5, target: 3125,  reward: '₹1,25,000', rewardLabel: 'Reward Worth', hasReward: true,  color: POP.purple },
  { level: 6, target: 15625, reward: null,          rewardLabel: null,           hasReward: false, color: POP.blue },
  { level: 7, target: 78125, reward: '₹1 Crore',  rewardLabel: 'GRAND PRIZE',  hasReward: true,  color: POP.gold },
];

export default function HowItWorks({ minPurchaseAmount = 2000 }: HowItWorksProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stairsVisible, setStairsVisible] = useState(false);
  const [activeStair, setActiveStair] = useState(-1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stairsRef = useRef<HTMLDivElement>(null);

    // Dynamic steps data using minPurchaseAmount prop
  const STEPS = [
    {
      number: 1,
      title: 'Shop & Join the Club',
      description: `Browse our premium fragrance collection and choose any product worth ₹${minPurchaseAmount.toLocaleString('en-IN')} or more. During checkout, simply opt into the 7th Heaven Club — it's completely free. No hidden charges, no subscription, no catch.`,
      detail: 'One purchase. Lifetime membership. Zero joining fees.',
      tip: `💡 Pro Tip: You're already buying a luxury fragrance — the club membership is just a bonus!`,
      Icon: ShoppingBagIcon,
      color: POP.purple,
      colorLight: POP.purpleLight,
      gradient: `linear-gradient(135deg, ${POP.purple}, ${POP.purpleDark})`,
    },
    {
      number: 2,
      title: 'Receive Your Unique Referral Code',
      description: 'Once you become a member, you\'ll instantly receive a unique referral code via email and on your 7th Heaven dashboard. This code is exclusively yours — it tracks every referral you make.',
      detail: 'Your code is your key to building your network.',
      tip: '💡 Pro Tip: Save your referral code — you can share it unlimited times with anyone!',
      Icon: KeyIcon,
      color: POP.gold,
      colorLight: POP.goldLight,
      gradient: `linear-gradient(135deg, ${POP.gold}, ${POP.goldDark})`,
    },
    {
      number: 3,
      title: 'Refer 5 People — Complete Heaven 1',
      description: `Share your exclusive code on WhatsApp, Instagram, or simply text it to friends who love premium fragrances. When someone purchases worth ₹${minPurchaseAmount.toLocaleString('en-IN')}+ using YOUR code — they become part of your Heaven 1 team and YOU move closer to your first reward.`,
      detail: '5 direct referrals = Heaven 1 complete = ₹5,000 worth reward unlocked!',
      tip: '💡 Pro Tip: Most members complete Heaven 1 within their first week just by sharing with close friends & family.',
      Icon: UsersIcon,
      color: POP.pink,
      colorLight: POP.pinkLight,
      gradient: `linear-gradient(135deg, ${POP.pink}, ${POP.pinkDark})`,
    },
    {
      number: 4,
      title: 'Your Network Grows Automatically',
      description: 'Here\'s where it gets exciting: when YOUR referrals refer their friends, those new members automatically count as YOUR Heaven 2 team. And when THOSE people refer others — that\'s your Heaven 3. This chain continues through all 7 levels, growing your network exponentially without any extra effort from you.',
      detail: 'You refer 5. They each refer 5. The network multiplies on its own.',
      tip: '💡 Pro Tip: You only need to personally refer 5 active people. After that, your network grows through THEIR efforts!',
      Icon: NetworkIcon,
      color: POP.purple,
      colorLight: POP.purpleLight,
      gradient: `linear-gradient(135deg, ${POP.purpleLight}, ${POP.purple})`,
    },
    {
      number: 5,
      title: 'Claim Rewards at Every Milestone',
      description: 'As your network grows and hits milestones at Heaven 1, 3, 5 and 7 — you unlock massive prizes. Simply click "Claim Reward" from your dashboard, and our team will process it within 7 business days. From gifts worth ₹5,000 all the way up to the grand prize of ₹1 CRORE!',
      detail: 'The bigger your tree grows, the bigger your rewards get.',
      tip: '💡 Pro Tip: Track your progress in real-time on your 7th Heaven dashboard — you\'ll see exactly how close you are to each milestone!',
      Icon: TrophyIcon,
      color: POP.gold,
      colorLight: POP.goldLight,
      gradient: `linear-gradient(135deg, ${POP.goldLight}, ${POP.gold})`,
    },
  ];

  // Section observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Staircase observer + climbing animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStairsVisible(true);
          let step = 0;
          const interval = setInterval(() => {
            setActiveStair(step);
            step++;
            if (step >= 7) clearInterval(interval);
          }, 600);
        }
      },
      { threshold: 0.2 }
    );
    if (stairsRef.current) observer.observe(stairsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="how-it-works-section relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* ═══ HEADER ═══ */}
        <div className={`text-center mb-14 md:mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-4">
            <span className="hiw-badge">STEP-BY-STEP GUIDE</span>
          </div>
          <h2 className="hiw-title">
            How <span className="hiw-title-gradient">7th Heaven</span> Works
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-3xl mx-auto mt-4 leading-relaxed">
            Join thousands earning rewards through the power of referrals.
            Your journey to <span className="hiw-highlight-gold">₹1 Crore</span> starts
            with a single purchase — here&apos;s exactly how it works.
          </p>
        </div>

        {/* ═══ 5-STEP TIMELINE ═══ */}
        <div className="hiw-timeline">
          {STEPS.map((step, idx) => (
            <div
              key={step.number}
              className={`hiw-step-row ${idx % 2 === 0 ? 'from-left' : 'from-right'} ${isVisible ? 'animate-in' : ''}`}
              style={{ animationDelay: `${idx * 0.15 + 0.2}s` }}
            >
              {idx < STEPS.length - 1 && (
                <div className="hiw-connector" style={{ borderColor: STEPS[idx + 1].color + '40' }} />
              )}
              <div className="hiw-step-number" style={{ background: step.gradient, boxShadow: `0 0 25px ${step.color}50` }}>
                {step.number}
              </div>
              <div className="hiw-step-card" style={{ '--accent': step.color, '--accent-light': step.colorLight } as React.CSSProperties}>
                <div className="hiw-step-accent" style={{ background: step.gradient }} />
                <div className="hiw-step-body">
                  <div className="hiw-step-icon-wrap" style={{ background: step.color + '15', border: `1px solid ${step.color}30` }}>
                    <step.Icon className="hiw-step-icon" />
                  </div>
                  <div className="hiw-step-text">
                    <h3 className="hiw-step-title">{step.title}</h3>
                    <p className="hiw-step-desc">{step.description}</p>
                    <p className="hiw-step-detail" style={{ color: step.color }}>
                      ✦ {step.detail}
                    </p>
                    {step.tip && <p className="hiw-step-tip">{step.tip}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ═══ STAIRCASE WITH CLIMBING CHARACTER ═══ */}
        <div
          ref={stairsRef}
          className={`mt-20 md:mt-28 mb-16 transition-all duration-1000 ${stairsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          <div className="text-center mb-10">
            <h3 className="hiw-subtitle">
              The <span className="hiw-title-gradient">Stairway</span> to ₹1 Crore
            </h3>
            <p className="text-gray-500 text-xs md:text-sm mt-2 max-w-xl mx-auto">
              Complete each Heaven level by growing your team. Earn massive rewards at Heaven 1, 3, 5 &amp; 7!
            </p>
          </div>

          <div className="staircase-wrapper">
            {/* Heavenly glow behind top */}
            <div className="heaven-glow" />

            {/* Light rays from heaven */}
            <div className="heaven-rays">
              <div className="ray" />
              <div className="ray" />
              <div className="ray" />
              <div className="ray" />
              <div className="ray" />
            </div>

            {/* Floating clouds at top */}
            <div className="heaven-clouds">
              <div className="cloud cloud-1" />
              <div className="cloud cloud-2" />
              <div className="cloud cloud-3" />
              <div className="cloud cloud-4" />
              <div className="cloud cloud-5" />
            </div>

            {/* Twinkling stars */}
            <div className="heaven-stars">
              <span className="hstar">✦</span>
              <span className="hstar">✧</span>
              <span className="hstar">✦</span>
              <span className="hstar">⋆</span>
              <span className="hstar">✧</span>
              <span className="hstar">✦</span>
            </div>

            <div className="staircase-track">
              {HEAVENS.map((h, idx) => (
                <div
                  key={h.level}
                  className={`stair ${h.hasReward ? 'stair-reward' : 'stair-even'} ${stairsVisible ? 'stair-visible' : ''} ${activeStair >= idx ? 'stair-active' : ''}`}
                  style={{
                    '--stair-color': h.color,
                    '--stair-delay': `${idx * 0.12}s`,
                    width: `${100 - idx * 7}%`,
                  } as React.CSSProperties}
                >
                  {/* Climbing character */}
                  {activeStair === idx && (
                    <div className="climber">
                      <svg viewBox="0 0 40 60" className="climber-svg">
                        <circle cx="20" cy="10" r="7" fill={h.color} opacity="0.9"/>
                        <line x1="20" y1="17" x2="20" y2="36" stroke={h.color} strokeWidth="3" strokeLinecap="round"/>
                        {h.level === 7 ? (
                          <>
                            <line x1="20" y1="22" x2="10" y2="14" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="20" y1="22" x2="30" y2="14" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                            <text x="20" y="5" textAnchor="middle" fontSize="12">👑</text>
                          </>
                        ) : (
                          <>
                            <line x1="20" y1="24" x2="12" y2="30" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                            <line x1="20" y1="24" x2="28" y2="20" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                          </>
                        )}
                        <line x1="20" y1="36" x2="13" y2="48" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                        <line x1="20" y1="36" x2="27" y2="48" stroke={h.color} strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                      {h.level === 7 && (
                        <div className="celebration-burst">
                          {['🎉', '⭐', '🏆', '✨', '🎊'].map((e, i) => (
                            <span key={i} className="burst-particle" style={{ '--angle': `${i * 72}deg`, '--delay': `${i * 0.1}s` } as React.CSSProperties}>{e}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="stair-inner">
                    <div className="stair-left">
                      <span className="stair-level" style={{ color: h.color }}>Heaven {h.level}</span>
                      <span className="stair-target">{h.hasReward ? '🎁 Reward Level' : '↗ Growth Level'}</span>
                    </div>
                    {h.hasReward && (
                      <div className="stair-reward-badge" style={{ background: h.color + '18', borderColor: h.color + '40' }}>
                        <span className="stair-reward-label" style={{ color: h.color + 'CC' }}>{h.rewardLabel}</span>
                        <span className="stair-reward-amount" style={{ color: h.color }}>{h.reward}</span>
                      </div>
                    )}
                    {!h.hasReward && (
                      <span className="stair-stepping" style={{ color: h.color + '80' }}>↗ Stepping stone</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ REWARD SUMMARY BANNER ═══ */}
        <div className={`mb-8 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="rewards-banner">
            <div className="rewards-banner-glow" />
            <div className="text-center relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <GiftIcon className="w-6 h-6" style={{ stroke: POP.gold }} />
                <h4 className="text-lg md:text-xl font-bold text-white">
                  Rewards at Every Odd Heaven
                </h4>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {[
                  { level: 1, amount: '₹5,000',    color: POP.purple },
                  { level: 3, amount: '₹25,000',   color: POP.pink },
                  { level: 5, amount: '₹1,25,000', color: POP.purple },
                  { level: 7, amount: '₹1 CRORE',  color: POP.gold },
                ].map((r) => (
                  <div key={r.level} className="reward-pill" style={{ '--pill-color': r.color } as React.CSSProperties}>
                    <span className="reward-pill-level">H{r.level}</span>
                    <span className="reward-pill-amount">{r.amount}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-5 max-w-lg mx-auto">
                Complete Heaven 1 to unlock your first prize. Keep growing to reach ₹1 Crore at Heaven 7!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ GROWTH MATH ═══ */}
      <div className={`mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="growth-math-card">
            <h4 className="text-base md:text-lg font-bold text-white mb-4 text-center">
              🧮 See How Your Network Grows
            </h4>
            <div className="growth-math-steps">
              <div className="growth-step">
                <span className="growth-you">You</span>
                <span className="growth-arrow">→</span>
                <span className="growth-action">refer <strong>5</strong> friends</span>
                <span className="growth-result" style={{ color: POP.purple }}>= Heaven 1 → ₹5,000</span>
              </div>
              <div className="growth-step">
                <span className="growth-you">Your 5</span>
                <span className="growth-arrow">→</span>
                <span className="growth-action">each refer <strong>5</strong></span>
                <span className="growth-result" style={{ color: POP.blue }}>= 25 in Heaven 2</span>
              </div>
              <div className="growth-step">
                <span className="growth-you">Those 25</span>
                <span className="growth-arrow">→</span>
                <span className="growth-action">each refer <strong>5</strong></span>
                <span className="growth-result" style={{ color: POP.pink }}>= Heaven 3 → ₹25,000</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs text-center mt-4">
              You only did <span style={{ color: POP.gold, fontWeight: 700 }}>ONE thing</span>: referred 5 people. The rest grows on its own.
            </p>
          </div>
        </div>

        {/* ═══ FAQ SECTION ═══ */}
        <div className={`mb-16 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="hiw-subtitle text-center mb-8">
            Frequently Asked <span className="hiw-title-gradient">Questions</span>
          </h3>
          <div className="faq-grid">
            {[
              { q: 'Is there a joining fee?', a: `No! Your membership is automatically activated FREE with any purchase of ₹${minPurchaseAmount.toLocaleString('en-IN')}+. No hidden charges ever.` },
              { q: 'Do I need to sell anything?', a: 'Absolutely not. Just share your referral code. When someone buys using your code, they join your network. No inventory, no pressure.' },
              { q: 'How do I claim my rewards?', a: 'Once you hit a milestone (Heaven 1, 3, 5, or 7), a "Claim Reward" button appears on your dashboard. Click it and our team processes your reward within 7 business days.' },
              { q: 'Is there a time limit?', a: 'No deadline at all! Your network keeps growing as long as your referrals stay active. Take your time — the rewards will wait for you.' },
              { q: 'Can I track my progress?', a: 'Yes! Your 7th Heaven dashboard shows real-time stats — your team size, current level, and exactly how close you are to the next reward.' },
              { q: 'What if my referral returns the product?', a: 'If a referred purchase is returned or cancelled, that referral won\'t count toward your network. Only confirmed purchases qualify.' },
            ].map((faq, idx) => (
              <div key={idx} className="faq-item">
                <h5 className="faq-q">{faq.q}</h5>
                <p className="faq-a">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FINAL CTA ═══ */}
        <div className={`text-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="cta-banner">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Join the 7th Heaven Club today and start earning rewards with every referral.
            </p>
            <Link
              href="/collections/perfumes"
              className="cta-button"
            >
              Shop & Join Now →
            </Link>
          </div>
        </div>

      {/* ═══ BACKGROUND PARTICLES ═══ */}
      <div className="hiw-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="hiw-particle"
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--size': `${Math.random() * 4 + 2}px`,
              '--duration': `${Math.random() * 10 + 8}s`,
              '--delay': `${Math.random() * 5}s`,
              '--color': [POP.purple, POP.gold, POP.pink, POP.blue][Math.floor(Math.random() * 4)],
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ═══ ALL STYLES ═══ */}
      <style jsx>{`
        .how-it-works-section {
          padding: 5rem 0;
          background: linear-gradient(180deg, #0f0f12 0%, #16141f 40%, #1a1520 60%, #111015 100%);
          position: relative;
        }

        /* Floating Particles */
        .hiw-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .hiw-particle {
          position: absolute; left: var(--x); top: var(--y);
          width: var(--size); height: var(--size);
          background: var(--color); border-radius: 50%; opacity: 0;
          animation: particleFloat var(--duration) var(--delay) infinite ease-in-out;
        }
        @keyframes particleFloat {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          25% { opacity: 0.6; }
          50% { opacity: 0.3; transform: translateY(-60px) scale(1); }
          75% { opacity: 0.5; }
        }

        /* Badge */
        .hiw-badge {
          display: inline-block; padding: 6px 18px; border-radius: 100px;
          font-size: 0.65rem; font-weight: 700; letter-spacing: 0.15em;
          color: ${POP.gold}; background: ${POP.gold}12; border: 1px solid ${POP.gold}30;
        }

        /* Title */
        .hiw-title {
          font-size: clamp(1.8rem, 5vw, 3rem); font-weight: 700; color: #fff;
          font-family: 'Cormorant Garamond', serif; line-height: 1.2;
        }
        .hiw-title-gradient {
          background: linear-gradient(135deg, ${POP.purple}, ${POP.gold}, ${POP.pink});
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hiw-highlight-gold { color: ${POP.gold}; font-weight: 700; }
        .hiw-subtitle {
          font-size: clamp(1.3rem, 3vw, 2rem); font-weight: 700; color: #fff;
          font-family: 'Cormorant Garamond', serif;
        }

        /* Timeline */
        .hiw-timeline { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 0; position: relative; }

        /* Step Row */
        .hiw-step-row {
          display: flex; align-items: flex-start; gap: 1rem;
          position: relative; padding-bottom: 2rem; opacity: 0; transform: translateY(30px);
        }
        .hiw-step-row.from-left { transform: translateX(-40px) translateY(20px); }
        .hiw-step-row.from-right { transform: translateX(40px) translateY(20px); }
        .hiw-step-row.animate-in { animation: stepSlideIn 0.7s ease forwards; }
        @keyframes stepSlideIn { to { opacity: 1; transform: translateX(0) translateY(0); } }

        .hiw-connector { position: absolute; left: 22px; top: 48px; bottom: 0; width: 2px; border-left: 2px dashed; }

        .hiw-step-number {
          flex-shrink: 0; width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1.1rem; color: #fff; z-index: 2; position: relative;
        }

        .hiw-step-card {
          flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden; transition: all 0.4s ease; position: relative;
        }
        .hiw-step-card:hover {
          border-color: color-mix(in srgb, var(--accent) 40%, transparent);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.3), 0 0 30px color-mix(in srgb, var(--accent) 15%, transparent);
        }
        .hiw-step-accent { height: 3px; width: 100%; }
        .hiw-step-body { padding: 1.25rem; display: flex; gap: 1rem; align-items: flex-start; }
        .hiw-step-icon-wrap {
          flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .hiw-step-icon { width: 22px; height: 22px; stroke: var(--accent); }
        .hiw-step-text { flex: 1; }
        .hiw-step-title { color: #fff; font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
        .hiw-step-desc { color: #9ca3af; font-size: 0.835rem; line-height: 1.65; margin-bottom: 8px; }
        .hiw-step-detail { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.01em; opacity: 0.9; }

        /* ═══ STAIRCASE ═══ */
        .staircase-wrapper { max-width: 780px; margin: 0 auto; padding: 1rem 0; }
        .staircase-track { display: flex; flex-direction: column-reverse; align-items: center; gap: 0; position: relative; }

        .stair {
          position: relative; border-radius: 10px; margin-bottom: 3px;
          opacity: 0; transform: scale(0.95) translateX(-20px); transition: all 0.5s ease;
        }
        .stair.stair-visible { animation: stairAppear 0.5s var(--stair-delay) forwards; }
        @keyframes stairAppear { to { opacity: 1; transform: scale(1) translateX(0); } }

        .stair-even {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
          padding: 0.6rem 1.25rem;
        }
        .stair-reward {
          background: linear-gradient(135deg, color-mix(in srgb, var(--stair-color) 8%, transparent), color-mix(in srgb, var(--stair-color) 3%, transparent));
          border: 1px solid color-mix(in srgb, var(--stair-color) 25%, transparent);
          padding: 0.85rem 1.25rem;
          box-shadow: 0 0 25px color-mix(in srgb, var(--stair-color) 12%, transparent);
        }
        .stair.stair-active {
          border-color: color-mix(in srgb, var(--stair-color) 60%, transparent);
          box-shadow: 0 0 35px color-mix(in srgb, var(--stair-color) 25%, transparent);
        }

        .stair-inner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
        .stair-left { display: flex; align-items: center; gap: 1rem; }
        .stair-level { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
        .stair-target { color: #6b7280; font-size: 0.7rem; white-space: nowrap; }
        .stair-stepping { font-size: 0.7rem; font-weight: 500; white-space: nowrap; }
        .stair-reward-badge {
          display: flex; flex-direction: column; align-items: flex-end;
          padding: 4px 12px; border-radius: 8px; border: 1px solid;
        }
        .stair-reward-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .stair-reward-amount { font-weight: 800; font-size: 0.95rem; text-shadow: 0 0 15px currentColor; }

        /* Climber Character */
        .climber {
          position: absolute; top: -55px; left: 14px; width: 40px; height: 60px;
          animation: climberBounce 0.5s ease; z-index: 10;
          filter: drop-shadow(0 0 8px color-mix(in srgb, var(--stair-color) 60%, transparent));
        }
        .climber-svg { width: 100%; height: 100%; }
        @keyframes climberBounce {
          0% { transform: translateY(20px) scale(0.6); opacity: 0; }
          60% { transform: translateY(-5px) scale(1.05); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        /* Celebration Burst */
        .celebration-burst { position: absolute; top: 50%; left: 50%; width: 0; height: 0; }
        .burst-particle { position: absolute; font-size: 1rem; animation: burst 1s var(--delay) forwards; }
        @keyframes burst {
          0% { transform: translate(0) scale(0); opacity: 0; }
          40% { opacity: 1; }
          100% { transform: rotate(var(--angle)) translateX(50px) scale(1); opacity: 0; }
        }

        /* ═══ REWARD BANNER ═══ */
        .rewards-banner {
          position: relative; background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
          padding: 2rem; overflow: hidden; max-width: 700px; margin: 0 auto;
        }
        .rewards-banner-glow {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, ${POP.purple}08, ${POP.gold}08, ${POP.pink}08);
          pointer-events: none;
        }
        .reward-pill {
          display: flex; align-items: center; gap: 8px;
          background: color-mix(in srgb, var(--pill-color) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--pill-color) 30%, transparent);
          border-radius: 100px; padding: 6px 14px; transition: all 0.3s;
        }
        .reward-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 20px color-mix(in srgb, var(--pill-color) 20%, transparent);
        }
        .reward-pill-level { font-size: 0.65rem; font-weight: 800; color: var(--pill-color); text-transform: uppercase; letter-spacing: 0.05em; }
        .reward-pill-amount { font-size: 0.8rem; font-weight: 700; color: #fff; }

                /* ═══ CLOUDS & HEAVEN EFFECTS ═══ */
        .staircase-wrapper { max-width: 780px; margin: 0 auto; padding: 1rem 0; position: relative; }
                .heaven-clouds {
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          width: 100%; height: 130px; pointer-events: none; z-index: 5;
        }
        .cloud {
          position: absolute;
          background: #2a2535;
          border-radius: 50%;
          box-shadow:
            25px -8px 0 5px #2a2535,
            -25px -8px 0 5px #2a2535,
            50px 0 0 -2px #252030,
            -50px 0 0 -2px #252030,
            0 0 30px rgba(245,158,11,0.08);
          opacity: 0.7;
        }
        .cloud::after {
          content: ''; position: absolute; top: -15px; left: 10px;
          width: 30px; height: 30px; border-radius: 50%;
          background: #2a2535;
          box-shadow: 22px -5px 0 8px #2a2535, 44px 0 0 2px #2a2535;
        }
        .cloud-1 { width: 80px; height: 28px; top: 20px; left: 8%; animation: cloudDrift 12s ease-in-out infinite; }
        .cloud-2 { width: 100px; height: 32px; top: 5px; right: 10%; animation: cloudDrift 15s ease-in-out 2s infinite; }
        .cloud-3 { width: 60px; height: 22px; top: 40px; left: 35%; animation: cloudDrift 10s ease-in-out 1s infinite; opacity: 0.5; }
        .cloud-4 { width: 70px; height: 24px; top: 15px; right: 30%; animation: cloudDrift 13s ease-in-out 3s infinite; opacity: 0.4; }
        .cloud-5 { width: 90px; height: 30px; top: 8px; left: 55%; animation: cloudDrift 14s ease-in-out 1.5s infinite; opacity: 0.6; }
        @keyframes cloudDrift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
        .heaven-glow {
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(ellipse, rgba(245,158,11,0.3), rgba(139,92,246,0.15), transparent 70%);
          filter: blur(25px);
          width: 400px; height: 200px;
          animation: heavenPulse 4s ease-in-out infinite;
        }
        @keyframes heavenPulse {
          0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }
        .heaven-rays {
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
          width: 200px; height: 100px; pointer-events: none; z-index: 4;
        }
        .ray {
          position: absolute; bottom: 0; left: 50%; width: 2px; height: 80px;
          background: linear-gradient(to top, transparent, rgba(245,158,11,0.5), transparent);
          width: 3px;
          transform-origin: bottom center;
        }
        .ray:nth-child(1) { transform: rotate(-30deg); animation: rayPulse 3s ease-in-out infinite; }
        .ray:nth-child(2) { transform: rotate(-15deg); animation: rayPulse 3s ease-in-out 0.3s infinite; }
        .ray:nth-child(3) { transform: rotate(0deg); animation: rayPulse 3s ease-in-out 0.6s infinite; }
        .ray:nth-child(4) { transform: rotate(15deg); animation: rayPulse 3s ease-in-out 0.9s infinite; }
        .ray:nth-child(5) { transform: rotate(30deg); animation: rayPulse 3s ease-in-out 1.2s infinite; }
        @keyframes rayPulse {
          0%, 100% { opacity: 0.3; height: 80px; }
          50% { opacity: 0.7; height: 100px; }
        }
        .heaven-stars {
          position: absolute; top: 0; left: 0; right: 0; height: 100px;
          pointer-events: none; z-index: 4;
        }
        .hstar {
           position: absolute; font-size: 1rem; color: rgba(245,158,11,0.8);
          animation: starTwinkle 2s ease-in-out infinite;
        }
        .hstar:nth-child(1) { top: 5px; left: 20%; animation-delay: 0s; }
        .hstar:nth-child(2) { top: 15px; right: 20%; animation-delay: 0.5s; }
        .hstar:nth-child(3) { top: 25px; left: 40%; animation-delay: 1s; }
        .hstar:nth-child(4) { top: 10px; right: 35%; animation-delay: 1.5s; }
        .hstar:nth-child(5) { top: 30px; left: 15%; animation-delay: 0.7s; }
        .hstar:nth-child(6) { top: 20px; right: 10%; animation-delay: 1.2s; }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }

                /* Pro Tip in Steps */
        .hiw-step-tip {
          font-size: 0.75rem;
          color: #6b7280;
          background: rgba(255,255,255,0.03);
          border-left: 2px solid var(--accent, #666);
          padding: 6px 12px;
          margin-top: 8px;
          border-radius: 0 6px 6px 0;
          font-style: italic;
          line-height: 1.5;
        }

        /* Growth Math */
        .growth-math-card {
          max-width: 600px; margin: 0 auto;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 1.5rem; overflow: hidden;
        }
        .growth-math-steps { display: flex; flex-direction: column; gap: 10px; }
        .growth-step {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 8px 12px; border-radius: 8px;
          background: rgba(255,255,255,0.02);
          font-size: 0.85rem; color: #ccc;
        }
        .growth-you { font-weight: 700; color: #fff; min-width: 60px; }
        .growth-arrow { color: #555; }
        .growth-action { color: #9ca3af; }
        .growth-action strong { color: #fff; }
        .growth-result { font-weight: 700; margin-left: auto; white-space: nowrap; }

        /* FAQ */
        .faq-grid {
          max-width: 720px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr; gap: 12px;
        }
        @media (min-width: 640px) {
          .faq-grid { grid-template-columns: 1fr 1fr; }
        }
        .faq-item {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 1.25rem;
          transition: all 0.3s;
        }
        .faq-item:hover {
          border-color: ${POP.gold}30;
          background: rgba(255,255,255,0.04);
        }
        .faq-q {
          color: #fff; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px;
        }
        .faq-a {
          color: #9ca3af; font-size: 0.8rem; line-height: 1.6; margin: 0;
        }

        /* CTA */
        .cta-banner {
          background: linear-gradient(135deg, rgba(139,92,246,0.08), rgba(245,158,11,0.08), rgba(236,72,153,0.08));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 2.5rem 1.5rem;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 36px;
          background: linear-gradient(135deg, ${POP.gold}, ${POP.goldDark});
          color: #000 !important;
          font-weight: 700; font-size: 0.85rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          border-radius: 100px; text-decoration: none;
          transition: all 0.3s;
          box-shadow: 0 4px 20px ${POP.gold}40;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px ${POP.gold}60;
          color: #000 !important;
        }

        /* ═══ RESPONSIVE ═══ */
        @media (max-width: 768px) {
          .how-it-works-section { padding: 3rem 0 4rem; }
          .hiw-step-body { flex-direction: column; gap: 0.75rem; }
          .hiw-step-icon-wrap { width: 38px; height: 38px; }
          .hiw-step-icon { width: 18px; height: 18px; }
          .stair { min-width: 60%; padding: 0.55rem 0.75rem; }
          .stair-inner { flex-direction: column; gap: 0.25rem; align-items: flex-start; }
          .stair-reward-badge { align-items: flex-start; }
          .stair-left { gap: 0.5rem; flex-wrap: wrap; }
          .climber { left: auto; right: 10px; top: -50px; width: 32px; height: 50px; }
          .reward-pill { padding: 5px 10px; }
          .reward-pill-amount { font-size: 0.7rem; }
          .hiw-step-row { gap: 0.75rem; }
          .hiw-step-number { width: 38px; height: 38px; font-size: 0.95rem; }
          .hiw-connector { left: 18px; }
          .rewards-banner { padding: 1.25rem; }
          .growth-step { font-size: 0.75rem; gap: 4px; }
          .growth-result { margin-left: 0; margin-top: 2px; width: 100%; }
          .growth-you { min-width: auto; }
          .faq-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}