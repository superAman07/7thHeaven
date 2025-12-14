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

    fetchCategories();
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

  // 4. Fetch Products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('minPrice', debouncedPriceRange[0].toString());
      params.append('maxPrice', debouncedPriceRange[1].toString());
      
      if (selectedGenders.length) params.append('gender', selectedGenders.join(','));
      
      // Logic: If 'In Stock' is selected, we send status=true. 
      // If 'Out of Stock' is selected, we send status=false.
      // If BOTH or NEITHER are selected, we don't send the param (show all).
      if (selectedStatus.length === 1) {
          if (selectedStatus.includes('In Stock')) params.append('status', 'true');
          if (selectedStatus.includes('Out of Stock')) params.append('status', 'false');
      }
      
      params.append('category', categorySlug);
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
  }, [debouncedPriceRange, selectedGenders, selectedStatus, sortBy, currentPage, categorySlug]);

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

  const formatCategoryName = (slug: string) => {
    return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  };

  return (
    <div id="main-wrapper">
      {/* Page Banner */}
      <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
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
      <div className="shop-section section pt-100 pb-70">
        <div className="container">
          <div className="row">
            <div className="filter-title d-block d-lg-none mb-3">Filter</div>

            {/* Sidebar */}
            <div className="col-lg-3 order-lg-1 order-2">
              <div className="filter-sidebar">

                {/* Price Filter */}
                <div className="mb-4">
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
                <div className="mb-4">
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
                <div className="mb-4">
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
              </div>
            </div>

            {/* Product Grid */}
            <div className="col-lg-9 order-lg-2 order-1">
              <div className="row">
                <div className="col-12">
                  <div className="shop-topbar-wrapper d-md-flex justify-content-md-between align-items-center">
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
                              <div className="col-12 text-center py-5">No products found matching your filters.</div>
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
            `}</style>
    </div>
  );
}