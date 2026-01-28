'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProductCard } from '@/components/home/ProductCard';
import ProductQuickViewModal from '@/components/home/QuickViewModal';
import { PublicProduct } from '@/components/HeroPage';
import ShareButton from '@/components/ShareButton';
import NetworkGalaxy from '@/components/heaven/NetworkGalaxy';

interface LevelData {
  level: number;
  count: number;
  target: number;
  isCompleted: boolean;
  progress: number;
}

interface DirectReferral {
  name: string;
  joinedAt: string;
}

interface NetworkData {
  fullName: string;
  referralCode: string;
  isMember: boolean;
  levels: LevelData[];
  totalTeamSize: number;
  directReferrals: DirectReferral[];
}

export default function SeventhHeavenPage() {
  const [data, setData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [clubProducts, setClubProducts] = useState<PublicProduct[]>([]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(4000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [isGalaxyOpen, setIsGalaxyOpen] = useState(false);
  const [graphData, setGraphData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/v1/network');
        if (res.data.success) {
          setData(res.data.data);
        }

        const prodRes = await axios.get('/api/v1/products/club');
        if (prodRes.data.success) {
          if (prodRes.data.maxPriceLimit) setMaxPriceLimit(prodRes.data.maxPriceLimit);

          const mappedProducts: PublicProduct[] = prodRes.data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: '',
            images: [p.image || '/assets/images/product/shop.webp'],
            genderTags: [],
            inStock: true,
            ratingsAvg: 0,
            createdAt: new Date(),
            categoryId: '',
            isNewArrival: false,
            discountPercentage: p.discountPercentage,
            category: { name: p.category, slug: '' },
            variants: [
              {
                id: p.id,
                price: p.price,
                size: 'Standard',
                stock: 100,
              },
            ],
            reviews: [],
          }));

          setClubProducts(mappedProducts);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setIsGuest(true);
        } else {
          console.error('Failed to fetch network', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axios.get('/api/v1/network/graph');
        if (response.data.success) {
          setGraphData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch galaxy graph', error);
      }
    };

    fetchGraphData();
  }, []);

  const handleOpenModal = (product: PublicProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const copyToClipboard = () => {
    if (data?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/login?ref=${data.referralCode}`);
      setCopySuccess(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your empire...</p>
        </div>
      </div>
    );
  }

  if (isGuest || (data && !data.isMember)) {
    return <MarketingView />;
  }

  if (!data) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="w-full bg-[#1a1a1a] pt-28 pb-32 relative">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-white font-serif text-4xl mb-2">7th Heaven Club</h1>
          <p className="text-[#ddb040] text-lg tracking-wider uppercase">Your Empire Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 -mt-16">
        {/* 1. STATUS CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border-t-4 border-[#ddb040] relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
            <div>
              {/* Personalized Greeting */}
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, <span className="text-[#ddb040]">{data.fullName?.split(' ')[0] || 'Member'}</span>
              </h2>
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                Status: <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
              </p>

              {/* Referral Code Box */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 font-mono text-base font-bold text-gray-800 tracking-wider">
                  {data.referralCode || 'NO CODE'}
                </div>

                <button
                  onClick={copyToClipboard}
                  className="bg-[#1a1a1a] hover:bg-[#333] text-white h-[42px] px-4 rounded-lg shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <i className={`fa ${copySuccess ? 'fa-check text-[#ddb040]' : 'fa-copy'}`} />
                  {copySuccess ? 'Copied' : 'Copy'}
                </button>

                <ShareButton referralCode={data.referralCode} variant="icon" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-end gap-8 text-center divide-x divide-gray-100">
              <div
                className="px-4 cursor-pointer hover:scale-105 transition-transform duration-300 group"
                onClick={() => setIsGalaxyOpen(true)}
                title="View Galaxy Map"
              >
                <div className="text-2xl font-bold text-[#ddb040] mb-1 group-hover:text-[#b6902e] transition-colors">
                  {data.totalTeamSize}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold group-hover:text-gray-600">
                  Heaven Size <i className="fa fa-external-link ml-1 text-[9px]" />
                </div>
              </div>

              <div className="px-4">
                <div className="text-2xl font-bold text-gray-800 mb-1">{data.levels.filter((l) => l.isCompleted).length} / 7</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Heaven Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CLUB ESSENTIALS (Affordable Products) */}
        {clubProducts.length > 0 && (
          <div className="mb-14">
            <div className="flex items-end justify-between mb-6 border-b border-gray-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-800 font-serif">Club Essentials</h3>
                <p className="text-gray-500 text-xs mt-1">Smart picks to maintain your active status.</p>
              </div>

              {/* Professional Filter Link */}
              <Link
                href={`/collections/perfumes?maxPrice=${maxPriceLimit}&sort=price_asc`}
                className="text-[#ddb040] font-bold text-xs hover:text-black uppercase tracking-widest transition-colors"
              >
                View All <i className="fa fa-arrow-right ml-1" />
              </Link>
            </div>

            <div className="row">
              {clubProducts.map((product) => (
                <div className="col-lg-3 col-md-4 col-sm-6" key={product.id}>
                  <ProductCard product={product} onQuickView={handleOpenModal} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. LEVELS GRID */}
        <div className="mb-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6 pl-3 border-l-4 border-[#ddb040]">Heaven Progress</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.levels.map((level) => (
              <div
                key={level.level}
                className={`relative rounded-xl p-5 border bg-white ${level.isCompleted ? 'border-[#ddb040] shadow-md' : 'border-gray-100'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-2xl font-bold text-gray-800">Lvl 0{level.level}</h4>
                  <i className={`fa ${level.isCompleted ? 'fa-check-circle text-[#ddb040]' : 'fa-lock text-gray-300'} text-xl`} />
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                  <div className="bg-[#ddb040] h-full rounded-full transition-all duration-1000" style={{ width: `${level.progress}%` }} />
                </div>

                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Progress</span>
                  <span>
                    {level.count} / {level.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. DIRECT REFERRALS (Improved Empty State) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800">Direct Referrals (Level 1)</h3>
          </div>

          {data.directReferrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-bold">Associate</th>
                    <th className="px-6 py-3 font-bold">Date Joined</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-50">
                  {data.directReferrals.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm">{member.name}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{new Date(member.joinedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <span className="text-xs font-medium text-gray-600">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // PROFESSIONAL EMPTY STATE
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-[#ddb040]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa fa-user-plus text-2xl text-[#ddb040]" />
              </div>

              <h4 className="text-gray-900 font-bold mb-2">Start Your Team</h4>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                You haven't referred anyone yet. Share your unique code to invite friends and unlock Level 1 rewards.
              </p>

              <button
                onClick={copyToClipboard}
                className="bg-[#ddb040] text-black font-bold uppercase text-xs px-6 py-3 rounded hover:bg-[#c59d35] transition-colors"
              >
                Share Referral Code
              </button>
            </div>
          )}
        </div>

        <NetworkGalaxy isOpen={isGalaxyOpen} onClose={() => setIsGalaxyOpen(false)} data={graphData} />

        {selectedProduct && (
          <ProductQuickViewModal isOpen={isModalOpen} onClose={handleCloseModal} productId={selectedProduct.id} />
        )}
      </div>
    </div>
  );
}

/* ----------------
   Marketing / Guest view
   ---------------- */
function MarketingView() {
  return (
    <div className="bg-[#252525] min-h-screen text-white">
      {/* Hero */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/images/hero/slider-1.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-5xl md:text-7xl font-serif mb-6 text-[#E6B422] font-bold"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            7th Heaven Club
          </h1>

          <p className="text-xl md:text-2xl text-[#E6B422] tracking-widest uppercase mb-8">The Path to Prestige</p>

          <p className="max-w-2xl mx-auto text-gray-300 mb-10 text-lg">
            Unlock exclusive luxury rewards, build your influence, and ascend through 7 levels of prestige. Join the elite circle of fragrance connoisseurs.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-[#E6B422] text-black font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Join The Club
            </Link>

            <Link
              href="/collections/perfumes"
              className="px-8 py-4 border border-white text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]">Exclusive Rewards</h3>
            <p className="text-gray-400">Access limited edition fragrances reserved only for club members.</p>
          </div>

          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]">Build Your Network</h3>
            <p className="text-gray-400">Invite friends and grow your influence. Watch your empire expand in real-time.</p>
          </div>

          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]">Luxury Gifts</h3>
            <p className="text-gray-400">Complete Level 7 to unlock a curated luxury gift package from our founders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
