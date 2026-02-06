'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, ArrowRight } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  _count?: {
    categories: number;
  };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get('/api/v1/collections');
        if (res.data.success) {
          setCollections(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch collections', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div id="main-wrapper">
      <div 
        className="page-banner-section section min-h-[35vh]! lg:min-h-[45vh]! flex! items-end! pb-[20px]!"
        style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)' }}
      >
        <div className="container-fluid px-4 px-md-5"> 
          <div className="row">
            <div className="col-12 p-0">
              <div className="page-banner w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end">
                <div className="order-2 order-md-1 mt-2 mt-md-0">
                   <ul className="page-breadcrumb justify-content-center justify-content-md-start mb-0!" style={{ fontSize: '14px' }}>
                    <li><Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link></li>
                    <li className="text-white/80">Collections</li>
                  </ul>
                </div>
                <div className="order-1 order-md-2 text-center text-md-end">
                   <h1 className="text-white! mb-0!" style={{ fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.1, letterSpacing: '0.05em' }}>
                      Our Collections
                   </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section pt-100 pb-70 bg-white">
        <div className="container">
          {loading ? (
             <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
             </div>
          ) : collections.length === 0 ? (
             <div className="text-center py-20 text-gray-400">
                <p>No collections found.</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collections.map((col) => (
                  <React.Fragment key={col.id}>
                      {/* DESKTOP CARD: Hidden on mobile, Visible on Large screens */}
                      <DesktopCard col={col} className="hidden lg:block h-full w-full" />
                      
                      {/* MOBILE CARD: Visible on mobile, Hidden on Large screens */}
                      <MobileCard col={col} className="block lg:hidden h-full w-full" />
                  </React.Fragment>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. DESKTOP CARD (Standard Hover Logic)
// ==========================================
function DesktopCard({ col, className = '' }: { col: Collection, className?: string }) {
  // Logic: 
  // - Default: Text is hidden (opacity-0) and pushed down (translate-y-4)
  // - Group Hover: Text becomes visible (opacity-100) and slides up (translate-y-0)
  return (
    <Link 
      href={`/collections/${col.slug}`} 
      className={`group block relative overflow-hidden rounded-2xl aspect-4/5 md:aspect-3/4 lg:aspect-4/5 shadow-lg hover:shadow-2xl transition-all duration-500 ${className}`}
    >
      {/* Background Image: Scales Up on Hover */}
      <div className="absolute inset-0 bg-gray-200">
        {col.image ? (
          <img 
            src={col.image} 
            alt={col.name} 
            className="w-full h-full object-cover transform transition-transform duration-700 text-gray-300 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">No Image</div>
        )}
      </div>

      {/* Overlay: Darken on Hover */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 opacity-80 group-hover:opacity-90"></div>

      {/* Content: Slide Up & Fade In on Hover */}
      <div className="absolute bottom-0 left-0 w-full p-8 text-white transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
        
        <p className="text-xs font-bold tracking-widest uppercase text-yellow-500 mb-2">
          {col._count?.categories || 0} Categories
        </p>
        <h3 className="text-3xl! font-serif! font-medium! mb-3! transition-colors! group-hover:text-yellow-100!">
          {col.name}
        </h3>
        
        {/* Description: slightly delayed fade-in */}
        {col.description && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-4 transition-opacity duration-300 delay-100 opacity-0 group-hover:opacity-100">
             {col.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-b border-transparent w-fit pb-1 transition-all group-hover:border-yellow-500">
          View Collection <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </Link>
  );
}

// ==========================================
// 2. MOBILE CARD (Auto-Scroll Logic)
// ==========================================
function MobileCard({ col, className = '' }: { col: Collection, className?: string }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Safety check
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0.5 } // 50% Visible
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Link 
      ref={cardRef}
      href={`/collections/${col.slug}`} 
      className={`group block relative overflow-hidden rounded-2xl aspect-4/5 shadow-lg transition-all duration-500 ${className}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gray-200">
        {col.image ? (
          <img 
            src={col.image} 
            alt={col.name} 
            className={`w-full h-full object-cover transform transition-transform duration-700 text-gray-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">No Image</div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-80'}`}></div>

      {/* Content - Controlled by isActive state */}
      <div className={`absolute bottom-0 left-0 w-full p-8 text-white transition-all duration-300 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
        <p className="text-xs font-bold tracking-widest uppercase text-yellow-500 mb-2">
          {col._count?.categories || 0} Categories
        </p>
        <h3 className={`text-3xl! font-serif! font-medium! mb-3! transition-colors! ${isActive ? 'text-yellow-100!' : 'text-white'}`}>
          {col.name}
        </h3>
        {col.description && (
          <p className={`text-gray-300 text-sm line-clamp-2 mb-4 transition-opacity duration-300 delay-100 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
             {col.description}
          </p>
        )}
        <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-b border-transparent w-fit pb-1 transition-all ${isActive ? 'border-yellow-500' : 'border-transparent'}`}>
          View Collection <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}