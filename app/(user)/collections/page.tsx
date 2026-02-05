'use client';

import React, { useEffect, useState } from 'react';
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
      {/* 1. Hero Banner */}
      <div 
        className="page-banner-section section min-h-[30vh]! lg:min-h-[45vh]! flex! items-end! pb-[30px]! lg:pb-[40px]!" 
        style={{ 
          background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)',
        }}
      >
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="page-banner text-center">
                <h1>Our Collections</h1>
                <ul className="page-breadcrumb">
                  <li><Link href="/">Home</Link></li>
                  <li>Collections</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Collections Grid */}
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
                  <Link 
                    href={`/collections/${col.slug}`} 
                    key={col.id} 
                    className="group block relative overflow-hidden rounded-2xl aspect-4/5 md:aspect-3/4 lg:aspect-4/5 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 bg-gray-200">
                      {col.image ? (
                        <img 
                          src={col.image} 
                          alt={col.name} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 text-gray-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 w-full p-8 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-xs font-bold tracking-widest uppercase text-yellow-500 mb-2">
                        {col._count?.categories || 0} Categories
                      </p>
                      <h3 className="text-3xl! font-serif! font-medium! mb-3! group-hover:text-yellow-100! transition-colors!">
                        {col.name}
                      </h3>
                      {col.description && (
                        <p className="text-gray-300 text-sm line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                           {col.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-b border-transparent group-hover:border-yellow-500 w-fit pb-1 transition-all">
                        View Collection <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}