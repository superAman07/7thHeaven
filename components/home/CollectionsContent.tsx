'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import ProductQuickViewModal from '@/components/home/QuickViewModal';
import { ProductCard } from '@/components/home/ProductCard';
import { PublicProduct } from '@/components/HeroPage';
import { ProductCardSkeleton } from '@/components/home/ProductCardSkeleton'; // <--- ADD THIS

interface Category {
  id: string;
  name: string;
  count?: number;
}

export default function CollectionsContent({ categorySlug }: { categorySlug: string }) {
  const searchParams = useSearchParams();
  
  // State
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 57500]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 57500]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // 1. Initialize filters from URL
  useEffect(() => {
    const genderParam = searchParams.get('gender');
    if (genderParam) {
      const newGenders = genderParam.split(',');
      setSelectedGenders(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newGenders)) return newGenders;
        return prev;
      });
    }

    const statusParam = searchParams.get('status');
    if (statusParam) {
        if (statusParam === 'true') setSelectedStatus(['In Stock']);
        if (statusParam === 'false') setSelectedStatus(['Out of Stock']);
    }

    const sortParam = searchParams.get('sort');
    if (sortParam && sortParam !== sortBy) setSortBy(sortParam);

    // fetchCategories();
  }, [searchParams]); 

  // 2. Debounce Price Range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(prev => {
        if (prev[0] === priceRange[0] && prev[1] === priceRange[1]) return prev;
        return priceRange;
      });
      if (priceRange[0] !== debouncedPriceRange[0] || priceRange[1] !== debouncedPriceRange[1]) {
          setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // 3. Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/v1/categories');
      if (res.data.success) {
        const mappedCategories = res.data.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          count: cat._count?.products || 0
        }));
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileFilterOpen]);

  // 4. Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const searchQuery = searchParams.get('search');
      if (searchQuery) {
          params.append('search', searchQuery);
      }
      params.append('minPrice', debouncedPriceRange[0].toString());
      params.append('maxPrice', debouncedPriceRange[1].toString());
      
      if (selectedGenders.length) params.append('gender', selectedGenders.join(','));
      
      if (selectedStatus.length === 1) {
          if (selectedStatus.includes('In Stock')) params.append('status', 'true');
          if (selectedStatus.includes('Out of Stock')) params.append('status', 'false');
      }

      // Logic: If we are on specifics (e.g. /collections/skyline), use that. 
      // If on /collections/perfumes, use the checkboxes.
      if (categorySlug && categorySlug !== 'perfumes') {
         params.append('collectionSlug', categorySlug); 
      } 
      
      // 2. User Filters (Checkboxes) - Always apply if selected
      if (selectedCategories.length > 0) {
         params.append('category', selectedCategories.join(','));
      }
      
      params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const res = await axios.get(`/api/v1/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages);
        }
      }
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  // FIXED: Added 'selectedCategories' to dependency array so checking boxes actually triggers refresh
  }, [debouncedPriceRange, selectedGenders, selectedStatus, sortBy, currentPage, categorySlug, selectedCategories]);

  // 5. Trigger Fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); 

  // Handlers
  const handleOpenModal = (product: PublicProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGenders(prev =>
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setCurrentPage(1);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = parseInt(e.target.value);
    const newRange = [...priceRange];
    newRange[index] = val;
    setPriceRange(newRange);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const formatCategoryName = (slug: string) => {
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  };

  return (
    <div id="main-wrapper">
      {/* Page Banner */}
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
                <h1>Shop {formatCategoryName(categorySlug)}</h1>
                <ul className="page-breadcrumb">
                  <li><Link href="/">Home</Link></li>
                  <li>{formatCategoryName(categorySlug)}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Section */}
      <div className="shop-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-30 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
        <div className="container">
          <div className="row">
            {/* MOBILE TOOLBAR (Sleek, App-like Sticky Bar) */}
            <div className="d-lg-none w-100 relative mb-4">
               
               {/* Clean Single Line: Title (Count) ----------- Sort */}
               <div className="flex items-center justify-between px-1 pb-3 border-b border-gray-200">
                 <div className="flex items-baseline gap-2">
                    <h2 className="text-lg font-serif font-bold text-[#1a1a1a] m-0 uppercase tracking-wider leading-none">
                      {categorySlug === 'perfumes' ? 'Perfumes' : formatCategoryName(categorySlug || 'Collection')}
                    </h2>
                    <span className="text-xs text-gray-500 font-medium font-sans">
                        ({products.length})
                    </span>
                 </div>
                 
                 {/* Minimal Sort (No box, just text) */}
                 <div className="relative">
                    <select 
                      value={sortBy}
                      onChange={handleSortChange}
                      className="text-[11px] font-bold border-none bg-transparent text-gray-800 focus:ring-0 cursor-pointer pr-4 uppercase tracking-widest text-right"
                      style={{ outline: 'none', boxShadow: 'none' }}
                    > 
                      <option value="newest">Sort</option>
                      <option value="price_asc">Price: Low</option>
                      <option value="price_desc">Price: High</option>
                    </select>
                    {/* Tiny down arrow */}
                    <i className="fa fa-caret-down absolute right-0 top-1/2 -translate-y-1/2 text-gray-800 text-[10px] pointer-events-none"></i>
                 </div>
               </div>

               {/* Vertical Filter Tab (Fixed Left) - Kept as is */}
               <button 
                  onClick={() => setIsMobileFilterOpen(true)}
                  style={{
                    position: 'fixed',
                    left: '0',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 90,
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '14px 6px',
                    borderRadius: '0 6px 6px 0',
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderLeft: 'none'
                  }}
                  className="group"
                >
                  <i className="fa fa-sliders text-[#D4AF37] text-xs "></i>
                  <span style={{ 
                      writingMode: 'vertical-rl', 
                      textOrientation: 'mixed',
                      fontSize: '9px',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      textTransform: 'uppercase'
                  }}>Filter</span>
                </button>
            </div>

                        {/* FILTER SIDEBAR / DRAWER */}
            <div className={`col-lg-3 order-lg-1 order-2`}>
              {/* Overlay for mobile */}
              <div 
                className={`fixed inset-0 bg-black/50 z-9998 transition-opacity duration-300 lg:hidden ${isMobileFilterOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={() => setIsMobileFilterOpen(false)}
              ></div>

              {/* The Sidebar Content */}
              <div className={`
                  filter-sidebar 
                  bg-white 
                  lg:block 
                  /* Mobile Drawer Styles */
                  fixed lg:static top-0 left-0 h-full lg:h-auto w-[85%] lg:w-full z-9999 lg:z-auto 
                  transform transition-transform duration-300 ease-in-out
                  ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                  overflow-y-auto lg:overflow-visible p-6 lg:p-0 shadow-2xl lg:shadow-none
              `}>
                
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h3 className="text-xl font-serif font-bold text-gray-900 m-0">Filters</h3>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <i className="fa fa-times text-xl"></i>
                  </button>
                </div>

                {/* --- EXISTING FILTERS BELOW --- */}

                {/* Price Filter */}
                <div className="mb-6 lg:mb-4 border-b lg:border-none pb-4 lg:pb-0 border-gray-100">
                  <div className={`section-header ${!collapsedSections['price'] ? 'active' : ''}`} onClick={() => toggleSection('price')}>
                    <div className="filter-title">Price</div>
                    <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['price'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                  </div>
                  <div className="section-content" style={{ maxHeight: collapsedSections['price'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    <div className="d-flex gap-3 price-box">
                      <input type="text" value={`₹${priceRange[0]}`} readOnly />
                      <input type="text" value={`₹${priceRange[1]}`} readOnly />
                    </div>
                    <div className="range-container">
                      <div className="range-track"></div>
                      <input
                        type="range"
                        min="0" max="57500"
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        style={{ zIndex: priceRange[0] > priceRange[1] - 100 ? 2 : 1 }}
                      />
                      <input
                        type="range"
                        min="0" max="57500"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        style={{ zIndex: 1 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="mb-6 lg:mb-4 border-b lg:border-none pb-4 lg:pb-0 border-gray-100">
                  <div className={`section-header ${!collapsedSections['status'] ? 'active' : ''}`} onClick={() => toggleSection('status')}>
                    <div className="filter-title">Availability</div>
                    <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['status'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                  </div>
                  <div className="section-content" style={{ maxHeight: collapsedSections['status'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    {['In Stock', 'Out of Stock'].map(status => (
                      <div className="category-item" key={status}>
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(status)}
                            onChange={() => handleStatusChange(status)}
                          /> {status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="mb-6 lg:mb-4 border-b lg:border-none pb-4 lg:pb-0 border-gray-100">
                  <div className={`section-header ${!collapsedSections['gender'] ? 'active' : ''}`} onClick={() => toggleSection('gender')}>
                    <div className="filter-title">Gender</div>
                    <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['gender'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                  </div>
                  <div className="section-content" style={{ maxHeight: collapsedSections['gender'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    {['Male', 'Female', 'Unisex'].map(gender => (
                      <div className="category-item" key={gender}>
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedGenders.includes(gender)}
                            onChange={() => handleGenderChange(gender)}
                          /> {gender === 'Male' ? 'Men' : gender === 'Female' ? 'Women' : gender}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter (Fixed Rendering Logic) */}
                {/* We removed the strict 'perfumes' check so you can debug the list. 
                    If you want it strictly for Perfumes page later, verify categorySlug is exactly 'perfumes' 
                */}
                {(categorySlug === 'perfumes' || categories.length > 0) && (
                  <div className="mb-6 lg:mb-4">
                    <div className={`section-header ${!collapsedSections['category'] ? 'active' : ''}`} onClick={() => toggleSection('category')}>
                      <div className="filter-title">Category</div>
                      <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['category'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                    </div>
                    <div className="section-content" style={{ maxHeight: collapsedSections['category'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    {categories.length === 0 && <p className="text-sm text-gray-500 italic mt-2">No categories found.</p>}
                      {categories.map(cat => (
                        <div className="category-item" key={cat.id}>
                          <div>
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat.id)}
                              onChange={() => handleCategoryChange(cat.id)}
                            /> {cat.name}
                          </div>
                          <span>{cat.count || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Mobile Apply Button */}
                <div className="lg:hidden mt-8">
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-3 bg-[#B6902E] text-white font-bold uppercase tracking-widest rounded shadow-lg"
                  >
                    View {products.length} Results
                  </button>
                </div>
                
              </div>
            </div>

            {/* Product Grid */}
            <div className="col-lg-9 order-lg-2 order-1">
              <div className="row">
                <div className="col-12">
                  <div className="shop-topbar-wrapper d-none d-lg-flex justify-content-md-between align-items-center">
                    <div className="grid-list-option">
                      <ul className="nav">
                        <li><a className="active show" href="#"><i className="fa fa-th"></i></a></li>
                      </ul>
                    </div>
                    <div className="toolbar-short-area d-md-flex align-items-center">
                      <div className="toolbar-shorter">
                        <label>Sort By:</label>
                        <select className="wide" value={sortBy} onChange={handleSortChange}>
                          <option value="newest">Newest</option>
                          <option value="price_asc">Price, low to high</option>
                          <option value="price_desc">Price, high to low</option>
                          <option value="name_asc">Name, A to Z</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-12">
                  <div className="shop-product">
                    <div className="tab-content">
                      <div className="tab-pane fade active show">
                        <div className="product-grid-view">
                          <div className="row">
                            {loading ? (
                              Array.from({ length: 6 }).map((_, i) => (
                                <ProductCardSkeleton key={i} />
                              ))
                            ) : products.length > 0 ? (
                              products.map((product) => (
                                <div className="col-lg-4 col-md-6 col-sm-6" key={product.id}>
                                    <ProductCard 
                                        product={product} 
                                        onQuickView={handleOpenModal} 
                                    />
                                </div>
                              ))
                            ) : (
                              <div className="col-12 text-center py-20">
                                  <div className="mb-4">
                                      <span className="inline-block p-4 rounded-full bg-yellow-50 text-[#B6902E]">
                                          <i className="fa fa-gem text-4xl"></i>
                                      </span>
                                  </div>
                                  <h3 className="font-serif text-2xl text-gray-900 mb-2">Coming Soon</h3>
                                  <p className="text-gray-500 max-w-md mx-auto">
                                      We are curating an exclusive selection of <strong>{formatCategoryName(categorySlug)}</strong> for you. 
                                      Stay tuned for the launch.
                                  </p>
                                  <Link href="/collections" className="inline-block mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors">
                                      BROWSE OTHER COLLECTIONS
                                  </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {totalPages > 0 && (
                <div className="row mb-30">
                  <div className="col">
                    <ul className="page-pagination">
                      <li>
                        <a
                          onClick={() => handlePageChange(currentPage - 1)}
                          style={{ cursor: currentPage > 1 ? 'pointer' : 'not-allowed', opacity: currentPage > 1 ? 1 : 0.5 }}
                        >
                          <i className="fa fa-angle-left"></i>
                        </a>
                      </li>

                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <li key={page} className={currentPage === page ? "active" : ""}>
                            <a onClick={() => handlePageChange(page)} style={{ cursor: 'pointer' }}>
                              {page < 10 ? `0${page}` : page}
                            </a>
                          </li>
                        );
                      })}

                      <li>
                        <a
                          onClick={() => handlePageChange(currentPage + 1)}
                          style={{ cursor: currentPage < totalPages ? 'pointer' : 'not-allowed', opacity: currentPage < totalPages ? 1 : 0.5 }}
                        >
                          <i className="fa fa-angle-right"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedProduct && (
        <ProductQuickViewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          productId={selectedProduct.id}
        />
      )}
      <style jsx global>{`
                .filter-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
                .price-box input { border: 1px solid #dcdcdc; border-radius: 6px; padding: 10px 12px; width: 100%; font-size: 15px; }
                .range-container { position: relative; height: 40px; margin-top: 10px; }
                .range-track { width: 100%; height: 3px; background: #ddb040; border-radius: 10px; position: absolute; top: 18px; }
                input[type=range] { position: absolute; width: 100%; appearance: none; background: transparent; pointer-events: auto; }
                input[type=range]::-webkit-slider-thumb { appearance: none; height: 20px; width: 20px; background: #ddb040; border-radius: 50%; border: 2px solid white; cursor: pointer; }
                .category-item { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 15px; }
                .category-item input { margin-right: 10px; width: 17px; height: 17px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
                .sticky-mobile-filter {
                  position: sticky;
                  top: 60px; /* Adjust based on your header height */
                  z-index: 99;
                  margin: 0 -15px 20px -15px; /* Negative margin to span full width in container */
              }

              /* Remove Negative margins if container padding is issue */
              @media (max-width: 767px) {
                  .container { padding-left: 0; padding-right: 0; }
                  .shop-product .col-6 { padding: 0 5px; } /* Tighter grid */
                  .row { margin-left: 0; margin-right: 0; }
              }
            `}</style>
    </div>
  );
}