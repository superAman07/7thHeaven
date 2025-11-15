'use client';

import React, { useEffect, useState, useCallback } from 'react';

type Props =
  | { mode?: 'afterSection' | 'start' | 'afterNSections'; nSections?: number; };

export default function ScrollToTopButton({
  mode = 'afterSection',
  nSections = 1,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [threshold, setThreshold] = useState<number>(300);

  useEffect(() => {
    function computeThreshold() {
      if (mode === 'start') {
        setThreshold(1);
        return;
      }
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));
      if (!sections.length) {
        setThreshold(window.innerHeight);
        return;
      }
      if (mode === 'afterSection') {
        const first = sections[0];
        setThreshold(first.offsetTop + first.offsetHeight - 10);
        return;
      }
      const n = Math.max(1, Math.floor(nSections));
      let total = 0;
      for (let i = 0; i < Math.min(n, sections.length); i++) {
        const el = sections[i];
        total = Math.max(total, el.offsetTop + el.offsetHeight);
      }
      if (total === 0) total = n * window.innerHeight;
      setThreshold(total - 10);
    }

    computeThreshold();
    window.addEventListener('resize', computeThreshold);
    return () => window.removeEventListener('resize', computeThreshold);
  }, [mode, nSections]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      setIsVisible(y > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  const scrollToTop = useCallback((duration = 900) => {
    const start = window.pageYOffset || document.documentElement.scrollTop || 0;
    if (start <= 0) return;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const y = Math.round(start - start * progress);
      window.scrollTo(0, y);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, []);

  if (typeof window === 'undefined') return null;

  // keep only transform/opacity inline for smooth show/hide, visuals in CSS
  const dynamicStyle: React.CSSProperties = {
    position: 'fixed',
    right: 20,
    bottom: 20,
    zIndex: 9999,
    cursor: 'pointer',
    transition: 'opacity 300ms linear, transform 300ms linear',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
    pointerEvents: isVisible ? 'auto' : 'none',
  };

  return (
    <button
      id="scrollUp"
      onClick={() => scrollToTop(900)}
      aria-label="Scroll to top"
      style={dynamicStyle}
      className="scroll-to-top"
      title="Back to top"
    >
      <i className="fa fa-angle-up" aria-hidden="true" />
    </button>
  );
}
