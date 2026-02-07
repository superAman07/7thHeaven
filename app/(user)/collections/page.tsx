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
                  <UnifiedCollectionCard key={col.id} col={col} />
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UnifiedCollectionCard({ col }: { col: Collection }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 1023px)').matches);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    if (!isMobile) return;

    if (!('IntersectionObserver' in window)) {
        setIsFocused(true);
        return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFocused(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    const currentRef = cardRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
      observer.disconnect();
    };
  }, [isMobile]);

  const handleMouseEnter = () => {
    if (!isMobile) setIsFocused(true);
  };

  const handleMouseLeave = () => {
    if (!isMobile) setIsFocused(false);
  };
  
  const overlayStyle: React.CSSProperties = {
    opacity: isFocused ? 0.9 : 0.8,
    transition: 'opacity 0.5s ease'
  };

  const contentStyle: React.CSSProperties = {
    opacity: isFocused ? 1 : 0,
    transform: isFocused ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.5s ease'
  };

  const imageStyle: React.CSSProperties = {
    transform: isFocused ? 'scale(1.1)' : 'scale(1)',
    transition: 'transform 0.7s ease'
  };

  return (
    <Link 
      ref={cardRef}
      href={`/collections/${col.slug}`} 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="block relative overflow-hidden rounded-2xl aspect-4/5 shadow-lg transition-all duration-500"
    >
      <div className="absolute inset-0 bg-gray-200">
        {col.image ? (
          <img 
            src={col.image} 
            alt={col.name} 
            className="w-full h-full object-cover text-gray-300"
            style={imageStyle}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">No Image</div>
        )}
      </div>

      <div 
        className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
        style={overlayStyle}
      ></div>

      <div className="absolute bottom-0 left-0 w-full p-8 text-white" style={contentStyle}>
        
        <p className="text-xs font-bold tracking-widest uppercase text-yellow-500 mb-2">
          {col._count?.categories || 0} Categories
        </p>
        
        <h3 
            className="text-3xl! font-serif! font-medium! mb-3! transition-colors!"
            style={{ color: isFocused ? '#FEF3C7' : '#FFF' }}
        >
          {col.name}
        </h3>
        
        {col.description && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-4">
             {col.description}
          </p>
        )}
        
        <div 
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-b w-fit pb-1 transition-all"
            style={{ borderColor: isFocused ? '#EAB308' : 'transparent' }} // Yellow-500 border on focus
        >
          View Collection <ArrowRight className="w-4 h-4" />
        </div>

      </div>
    </Link>
  );
}