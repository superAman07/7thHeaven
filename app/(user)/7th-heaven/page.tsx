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
import HowItWorks from '@/components/heaven/HowItWorks';

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
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [minAmount, setMinAmount] = useState(2000);
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
                id: p.variantId || p.variants?.[0]?.id || '',
                price: p.price,
                size: p.size || 'Standard',
                stock: 100,
              },
            ],
            reviews: [],
          }));
          const settingsRes = await axios.get('/api/v1/settings');
          if (settingsRes.data.success && settingsRes.data.value) {
            setMinAmount(settingsRes.data.value);
          }

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
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return;
        }
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
      navigator.clipboard.writeText(`${window.location.origin}/7th-heaven?ref=${data.referralCode}`);
      setCopySuccess(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };


  if (isGuest) {
    return <MarketingView isLoggedIn={false} />; 
  }
  
  if (!loading && data && !data.isMember) {
    return <MarketingView isLoggedIn={true} />; 
  }
  if (!loading && !data && !isGuest) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="w-full bg-[#1a1a1a] pt-[200px] md:pt-[220px] lg:pt-[260px] pb-24 md:pb-24 relative">
        <div className="container mx-auto px-4 pt-3 text-center">
          <h1 className="text-white font-serif text-4xl mb-2">7th Heaven Club</h1>
          <p className="text-[#ddb040] text-lg tracking-wider uppercase">Your Empire Dashboard</p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 -mt-16">
        {/* 1. STATUS CARD */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-12 border-t-4 border-[#ddb040] relative overflow-hidden">
            {!data ? (
              <div className="flex items-center justify-center py-8">
                  <div className="w-10 h-10 border-3 border-[#ddb040] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center relative z-10">
                <div>
                  {/* Personalized Greeting */}
                  <h2 className="text-2xl font-serif text-gray-800 mb-2">
                    Welcome, <span className="text-[#ddb040] ">{data?.fullName?.split(' ')[0] || 'Member'}</span>
                  </h2>
                  <p className="text-gray-600 mb-4 flex items-center gap-2">
                    Status: <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">ACTIVE</span>
                  </p>
                  {/* Referral Code Box */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 font-mono text-base font-bold text-gray-800 tracking-wider">
                      {data?.referralCode || 'NO CODE'}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="bg-[#1a1a1a] hover:bg-[#333] text-white h-[42px] px-4 rounded-lg shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      <i className={`fa ${copySuccess ? 'fa-check text-[#ddb040]' : 'fa-copy'}`} />
                      {copySuccess ? 'Copied' : 'Copy'}
                    </button>
                    <ShareButton referralCode={data?.referralCode || ''} variant="icon" />
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
                      {data?.totalTeamSize || 0}
                    </div>
                    <div className="text-[8px]! md:text-[10px]! text-gray-400 uppercase tracking-widest font-bold whitespace-nowrap">
                      Heaven Size <i className="fa fa-external-link ml-1 text-[8px] md:text-[9px]" />
                    </div>
                  </div>
                  <div className="px-4">
                    <div className="text-2xl font-bold text-gray-800 mb-1">{data?.levels?.filter((l) => l.isCompleted).length || 0} / 7</div>
                    <div className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-bold">Heaven Unlocked</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. CLUB ESSENTIALS (Affordable Products) */}
          {clubProducts.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center md:items-end justify-between mb-6 border-b border-gray-200 pb-3">
                <div className="pr-4">
                  <h3 className="text-2xl! md:text-3xl! font-serif! text-gray-900">Club Essentials</h3>
                  <p className="text-gray-600 text-[10px] md:text-xs mt-1 md:mt-2 font-sans tracking-wide leading-tight">
                      Smart picks to maintain active status.
                  </p>
                </div>
                <Link
                  href={`/collections/perfumes?maxPrice=${maxPriceLimit}&sort=price_asc`}
                  className="text-[#ddb040] font-bold text-[10px] md:text-xs hover:text-black uppercase tracking-widest transition-colors whitespace-nowrap shrink-0"
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
              <h3 className="text-3xl! font-serif! text-gray-900 mb-8 pl-4 border-l-4 border-[#ddb040]">Heaven Progress</h3>
              {!data ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-3 border-[#ddb040] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.levels.map((level) => {
                    const previousLevel = data.levels.find(l => l.level === level.level - 1);
                    const isUnlocked = level.level === 1 || previousLevel?.isCompleted;
                    return (
                      <div
                        key={level.level}
                        className={`relative rounded-xl p-6 border bg-white transition-all duration-300 ${level.isCompleted ? 'border-[#ddb040] shadow-md ring-1 ring-[#ddb040]/30' : 'border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className={`text-2xl font-serif ${level.isCompleted ? 'text-[#ddb040]' : 'text-gray-800'}`}>
                            Heaven 0{level.level}
                          </h4>
                          <i className={`fa ${level.isCompleted ? 'fa-check-circle text-[#ddb040]' : 'fa-lock text-gray-200'} text-xl`} />
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3 overflow-hidden">
                          <div 
                              className={`h-full rounded-full transition-all duration-1000 ${level.isCompleted ? 'bg-[#ddb040]' : 'bg-gray-300'}`} 
                              style={{ width: isUnlocked ? `${level.progress}%` : '0%' }} 
                          />
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-gray-400">
                          <span>Progress</span>
                          <span className={level.isCompleted ? 'text-[#ddb040]' : ''}>
                            {isUnlocked ? `${level.count} / ${level.target}` : '???'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* 4. DIRECT REFERRALS (Improved Empty State) */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl! md:text-3xl! font-serif! text-gray-900">Direct Referrals</h3>
            </div>

            {!data ? (
              <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-[#ddb040] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.directReferrals?.length > 0 ? (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left relative border-collapse">
                  <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4 font-bold! bg-gray-50/95 backdrop-blur-sm whitespace-nowrap">Associate</th>
                      <th className="px-6 py-4 font-bold! bg-gray-50/95 backdrop-blur-sm whitespace-nowrap">Date Joined</th>
                      <th className="px-6 py-4 font-bold! bg-gray-50/95 backdrop-blur-sm whitespace-nowrap">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50">
                    {data.directReferrals.map((member, index) => (
                      <tr key={index} className="hover:bg-amber-50/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <span className="font-serif! font-bold! text-gray-800 text-sm block">
                              {member.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-xs! font-mono! tracking-tight">
                              {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Active</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <i className="fa fa-users text-gray-300 text-2xl" />
                  </div>
                  <p className="font-serif text-lg text-gray-500 italic mb-2">"Great empires begin with a single step."</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">start referring to unlock the galaxy</p>
              </div>
            )}
          </div> 
        </div>

        <div className="container mx-auto px-4 mt-12 text-center">
            <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="inline-flex! items-center! gap-3! px-8! py-4! bg-linear-to-r! from-[#1a1a1a]! to-[#2a2a2a]! text-white! rounded-full! font-bold! uppercase! tracking-widest! text-xs! hover:from-[#ddb040]! hover:to-[#b6902e]! hover:text-black! transition-all! duration-300! shadow-lg! hover:shadow-xl! group!"
            >
                <span className="w-8 h-8 rounded-full bg-[#ddb040]/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <i className={`fa ${showHowItWorks ? 'fa-chevron-up' : 'fa-question'} text-[#ddb040] group-hover:text-black transition-colors`} />
                </span>
                {showHowItWorks ? 'Hide Guide' : 'How 7th Heaven Works'}
            </button>
        </div>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showHowItWorks ? 'max-h-[3000px] opacity-100 mt-8' : 'max-h-0 opacity-0'}`}>
          <div className="w-full bg-linear-to-b from-[#1a1a1a] to-[#252525] py-12 px-4 md:px-8">
              <HowItWorks minPurchaseAmount={minAmount} />
          </div>
        </div>

        <div className="container mx-auto px-4">
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
function MarketingView({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [minAmount, setMinAmount] = useState(2000);
  const [clubProducts, setClubProducts] = useState<PublicProduct[]>([]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(4000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleOpenModal = (product: PublicProduct) => {
    setSelectedProductId(product.id);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
        localStorage.setItem('7thHeavenReferral', ref);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await axios.get('/api/v1/settings');
        if (settingsRes.data.success && settingsRes.data.value) {
          setMinAmount(settingsRes.data.value);
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
            isBestSeller: p.isBestSeller || false,
            discountPercentage: p.discountPercentage,
            category: { name: p.category, slug: '' },
            variants: [{ id: p.variantId || '', price: p.price, size: p.size || 'Standard', stock: 100 }],
            reviews: [],
          }));
          setClubProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);
  const scrollToProducts = () => {
    document.getElementById('club-products')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="bg-linear-to-b from-[#1a1a1a] to-[#252525] min-h-screen text-white">
      {/* Hero */}
      <div className="relative h-[75vh] sm:h-screen flex items-center justify-center overflow-hidden pt-20! md:pt-40! lg:pt-20">
        <div className="absolute inset-0 bg-[url('/assets/images/hero/slider-1.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 text-center px-4">
          <h1
            className="text-2xl! md:text-4xl! font-serif! mb-6! text-[#E6B422]! font-bold!"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            7th Heaven Club
          </h1>

          <p className="text-xl md:text-2xl text-[#E6B422] tracking-widest uppercase mb-8">The Path to Prestige</p>

          <p className="max-w-2xl mx-auto text-gray-300 mb-10 text-lg">
            Unlock exclusive luxury rewards, build your influence, and ascend through 7 levels of prestige. Join the elite circle of fragrance connoisseurs.
          </p>

          <div className="flex gap-2 md:gap-4 justify-center items-center w-full sm:w-auto px-2 sm:px-0">
            <button onClick={scrollToProducts} className="px-4 py-3 md:px-8 md:py-4 bg-[#E6B422] text-black text-[10px] sm:text-xs md:text-base font-bold uppercase tracking-wider hover:bg-white transition-colors cursor-pointer">
              Join The Club
            </button>

            <Link
              href="/collections/perfumes"
              className="px-4 py-3 md:px-8 md:py-4 border border-white text-white text-[10px] sm:text-xs md:text-base font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors whitespace-nowrap flex-1 sm:flex-none text-center"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      <HowItWorks minPurchaseAmount={minAmount} />

      {clubProducts.length > 0 && (
        <div id="club-products" className="py-20 bg-[#f5f5f5]"> {/* Light background */}
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl! md:text-4xl! font-serif! text-[#1a1a1a]! mb-4!">Best Sellers</h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Purchase any product worth ₹{minAmount.toLocaleString()}+ to become a 7th Heaven member
              </p>
            </div>
            <div className="row">
              {clubProducts.map((product) => (
                <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={product.id}>
                  <div className="relative">
                    <ProductCard product={product} onQuickView={handleOpenModal} />
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={`/collections/perfumes?maxPrice=${maxPriceLimit}&sort=price_asc`} className="inline-block px-8 py-3 border border-[#1a1a1a] text-[#1a1a1a] font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-white transition-colors">
                View All Eligible Products
              </Link>
            </div>
          </div>
          <ProductQuickViewModal isOpen={isModalOpen} onClose={handleCloseModal} productId={selectedProductId || ''} />
        </div>
      )}

      {/* Features */}
      <div className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]!">Exclusive Rewards</h3>
            <p className="text-gray-400">Access limited edition fragrances reserved only for club members.</p>
          </div>

          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]!">Build Your Network</h3>
            <p className="text-gray-400">Invite friends and grow your influence. Watch your empire expand in real-time.</p>
          </div>

          <div className="p-8 border border-white/10 rounded-xl hover:border-[#E6B422]/50 transition-colors">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2 text-[#E6B422]!">Luxury Gifts</h3>
            <p className="text-gray-400">Complete Level 7 to unlock a curated luxury gift package from our founders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
