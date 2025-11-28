'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useCart } from '@/components/CartContext';
import ProductQuickViewModal from '@/components/home/QuickViewModal';
import toast from 'react-hot-toast';
import { useWishlist } from '@/components/WishlistContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  discountPercentage?: number;
  rating?: number;
  isNew?: boolean;
  variants: { price: number; size?: string }[];
  description?: string;
  category?: { name: string };
  reviews?: any[];
  ratingsAvg?: number;
}

interface Category {
  id: string;
  name: string;
  count?: number;
}

function CollectionsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 57500]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [priceRange, setPriceRange] = useState([0, 57500]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const genderParam = searchParams.get('gender');
    if (genderParam) setSelectedGenders(genderParam.split(','));

    const sortParam = searchParams.get('sort');
    if (sortParam) setSortBy(sortParam);

    fetchCategories();
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedPriceRange, selectedGenders, selectedCategories, sortBy]);

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());
      if (selectedGenders.length) params.append('gender', selectedGenders.join(','));
      if (selectedCategories.length) params.append('category', selectedCategories.join(','));
      params.append('sort', sortBy);

      const res = await axios.get(`/api/v1/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product as any, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleOpenModal = (product: Product) => {
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
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = parseInt(e.target.value);
    const newRange = [...priceRange];
    newRange[index] = val;
    setPriceRange(newRange);
  };

  return (
    <div id="main-wrapper">
      {/* Page Banner */}
      <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="page-banner text-center">
                <h1>Shop Collections</h1>
                <ul className="page-breadcrumb">
                  <li><Link href="/">Home</Link></li>
                  <li>Shop Collections</li>
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

                {/* Gender Filter */}
                <div className="mb-4">
                  <div className={`section-header ${!collapsedSections['gender'] ? 'active' : ''}`} onClick={() => toggleSection('gender')}>
                    <div className="filter-title">Gender</div>
                    <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['gender'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                  </div>
                  <div className="section-content" style={{ maxHeight: collapsedSections['gender'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                    {['Men', 'Women', 'Unisex'].map(gender => (
                      <div className="category-item" key={gender}>
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedGenders.includes(gender)}
                            onChange={() => handleGenderChange(gender)}
                          /> {gender}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-4">
                  <div className={`section-header ${!collapsedSections['category'] ? 'active' : ''}`} onClick={() => toggleSection('category')}>
                    <div className="filter-title">Category</div>
                    <span style={{ fontSize: '20px', cursor: 'pointer', transform: !collapsedSections['category'] ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>⌃</span>
                  </div>
                  <div className="section-content" style={{ maxHeight: collapsedSections['category'] ? '0px' : '500px', overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
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
                        <select className="wide" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
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
                              <div className="col-12 text-center py-5">Loading products...</div>
                            ) : products.length > 0 ? (
                              products.map((product) => {
                                // Calculate Price Logic
                                const basePrice = Number(product.variants?.[0]?.price) || 0;
                                const discount = product.discountPercentage || 0;
                                const finalPrice = basePrice - (basePrice * discount / 100);

                                return (
                                  <div className="col-lg-4 col-md-6 col-sm-6" key={product.id}>
                                    <div className="single-product mb-30">
                                      <div className="product-img">
                                        <Link href={`/products/${product.slug}`}>
                                          <img src={product.images[0] || '/assets/images/product/default.jpg'} alt={product.name} />
                                        </Link>
                                        {discount > 0 && (
                                          <span className="descount-sticker">-{discount}%</span>
                                        )}
                                        {product.isNew && <span className="sticker">New</span>}
                                        <div className="product-action d-flex justify-content-between">
                                          <a
                                            className="product-btn"
                                            onClick={(e) => handleAddToCart(e, product)}
                                          >
                                            Add to Cart
                                          </a>
                                          <ul className="d-flex">
                                            <li>
                                              <a
                                                title="Quick View"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  handleOpenModal(product);
                                                }}
                                              >
                                                <i className="fa fa-eye"></i>
                                              </a>
                                            </li>
                                            <li>
                                              <a
                                                title={isInWishlist(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  toggleWishlist({
                                                    id: product.id,
                                                    name: product.name,
                                                    image: product.images[0] || '/assets/images/product/default.jpg',
                                                    slug: product.slug
                                                  });
                                                }}
                                                style={{ cursor: 'pointer' }}
                                              >
                                                <i
                                                  className={`fa ${isInWishlist(product.id) ? 'fa-heart' : 'fa-heart-o'}`}
                                                  style={{ color: isInWishlist(product.id) ? '#dc3545' : 'inherit' }}
                                                ></i>
                                              </a>
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                      <div className="product-content">
                                        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                                        <div className="ratting">
                                          {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa fa-star${(product.rating || 0) > i ? '' : '-o'}`}></i>
                                          ))}
                                        </div>
                                        <h4 className="price">
                                          <span className="new">Rs.{finalPrice.toFixed(2)}</span>
                                          {discount > 0 && <span className="old">Rs.{basePrice.toFixed(2)}</span>}
                                        </h4>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
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

              {/* Pagination (Static for now, can be made dynamic) */}
              <div className="row mb-30">
                <div className="col">
                  <ul className="page-pagination">
                    <li><a href="#"><i className="fa fa-angle-left"></i></a></li>
                    <li className="active"><a href="#">01</a></li>
                    <li><a href="#"><i className="fa fa-angle-right"></i></a></li>
                  </ul>
                </div>
              </div>
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

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading collections...</div>}>
      <CollectionsContent />
    </Suspense>
  );
}