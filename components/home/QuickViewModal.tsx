'use client'
import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { PublicProduct } from '../HeroPage';
import { StarIcon } from '../icons';
import ImageLightbox from '../ImageLightBox';
import { useCart } from '../CartContext';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../WishlistContext';

interface ProductQuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
}

const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ isOpen, onClose, productId }) => {
    const [product, setProduct] = useState<PublicProduct | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [imageLoading, setImageLoading] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState<{ id: string; price: number; size: string; stock?: number } | null>(null);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const router = useRouter();

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    const currentStock = selectedVariant?.stock ?? 0;
    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock > 0 && currentStock <= 5;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setActiveImageIndex(0);
            setQuantity(1);
            setProduct(null);
            setSelectedVariant(null);
            setError(null);
            setIsAdding(false);

            const fetchProduct = async () => {
                if (!productId) return;
                setLoading(true);
                try {
                    const response = await axios.get<{ success: boolean; data: PublicProduct }>(`/api/v1/products/${productId}`);
                    if (response.data.success) {
                        setProduct(response.data.data);
                    } else {
                        setError('Failed to load product data');
                    }
                } catch (err) {
                    setError('Failed to fetch product details.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchProduct();
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, productId]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen || !product) return;

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrevImage();
            } else if (e.key === 'ArrowRight') {
                handleNextImage();
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, product, activeImageIndex]);

    const handlePrevImage = () => {
        if (!product || product.images.length <= 1) return;
        setImageLoading(true);
        setTimeout(() => {
            setActiveImageIndex((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
            );
            setImageLoading(false);
        }, 150);
    };

    const handleNextImage = () => {
        if (!product || product.images.length <= 1) return;
        setImageLoading(true);
        setTimeout(() => {
            setActiveImageIndex((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
            );
            setImageLoading(false);
        }, 150);
    };

    const handleThumbnailClick = (index: number) => {
        if (index === activeImageIndex) return;
        setImageLoading(true);
        setTimeout(() => {
            setActiveImageIndex(index);
            setImageLoading(false);
        }, 150);
    };

    const displayProduct = useMemo(() => {
        if (!product) return null;

        const regularPrice = selectedVariant ? selectedVariant.price : (parseFloat(product.variants?.[0]?.price as any) || 0);
        const sellingPrice = selectedVariant ? (selectedVariant as any).sellingPrice : (product.variants?.[0] as any)?.sellingPrice;
        const hasDiscount = sellingPrice != null && sellingPrice < regularPrice;
        const currentPrice = hasDiscount ? sellingPrice : regularPrice;

        return {
            id: product.id,
            name: product.name,
            images: product.images,
            description: product.description,
            reviews: {
                rating: product.ratingsAvg ?? 0,
                count: product.reviews.length,
            },
            price: {
                current: currentPrice,
                regular: regularPrice,
            },
            categories: [product.category.name],
        };
    }, [product, selectedVariant]);

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || isAdding || !selectedVariant || isOutOfStock) return;

        setIsAdding(true);

        addToCart({
            ...product,
            discountPercentage: product.discountPercentage ?? 0,
            selectedVariant: selectedVariant,
            price: selectedVariant.price
        }, quantity);

        router.push('/cart');
    };

    const handleImagePreview = () => {
        if (displayProduct && displayProduct.images.length > 0) {
            setLightboxOpen(true);
        }
    };

    const handleCloseLightbox = () => {
        setLightboxOpen(false);
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="modal fade quick-view-modal-container show"
            id="quick-view-modal-container"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
        >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        {loading && (
                            <div className="text-center p-4">
                                <p>Loading...</p>
                            </div>
                        )}
                        {error && (
                            <div className="text-center p-4">
                                <p style={{ color: 'red' }}>{error}</p>
                            </div>
                        )}
                        {displayProduct && !loading && (
                            <div className="col-xl-12 col-lg-12">
                                <div className="row">
                                    <div className="col-xl-5 col-lg-6 col-md-6 mb-xxs-25 mb-xs-25 mb-sm-25">
                                        <div className="product-details-left">
                                            {/* Main Image Display with Click Navigation */}
                                            <div className="relative w-full mb-4">
                                                <div
                                                    className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 relative cursor-pointer select-none"
                                                    // onClick={handleImageAreaClick}
                                                    title={displayProduct.images.length > 1 ? "Click left/right to navigate images" : ""}
                                                >
                                                    {displayProduct.images.length > 0 && (
                                                        <>
                                                            <img
                                                                src={displayProduct.images[activeImageIndex]}
                                                                alt={`${displayProduct.name} view ${activeImageIndex + 1}`}
                                                                className={`w-full h-full object-cover transition-all duration-300 ${imageLoading ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}`}
                                                                draggable={false}
                                                            />

                                                            {/* Invisible navigation zones for better UX feedback */}
                                                            {displayProduct.images.length > 1 && (
                                                                <>
                                                                    <div
                                                                        className="absolute left-0 top-0 w-1/4 h-full hover:bg-transparent hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                                                                        onClick={handlePrevImage}
                                                                        title="Previous image"
                                                                    />
                                                                    <div
                                                                        className="absolute right-0 top-0 w-1/4 h-full hover:bg-transparent hover:bg-opacity-5 transition-all duration-200 cursor-pointer"
                                                                        onClick={handleNextImage}
                                                                        title="Next image"
                                                                    />
                                                                </>
                                                            )}
                                                            <div
                                                                className="absolute left-1/4 top-0 w-1/2 h-full hover:bg-transparent hover:bg-opacity-5 transition-all duration-200 cursor-pointer flex items-center justify-center group/preview"
                                                                onClick={handleImagePreview}
                                                                title="Click to preview full image"
                                                            >
                                                                {/* Expand icon that appears on hover */}
                                                                <div className="opacity-0 group-hover/preview:opacity-100 transition-opacity duration-200 bg-transparent bg-opacity-60 rounded-full p-2">
                                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                                    </svg>
                                                                </div>
                                                            </div>

                                                            {/* Image Counter */}
                                                            {displayProduct.images.length > 1 && (
                                                                <div className="absolute bottom-2 right-2 bg-transparent bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                                    {activeImageIndex + 1} / {displayProduct.images.length}
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Thumbnail Images */}
                                            {displayProduct.images.length > 1 && (
                                                <div className="flex gap-2 overflow-x-auto pb-2">
                                                    {displayProduct.images.map((img, index) => (
                                                        <div
                                                            key={index}
                                                            className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${activeImageIndex === index
                                                                ? 'border-yellow-500 bg-yellow-100 shadow-lg ring-2 ring-yellow-300'
                                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                                }`}
                                                            onClick={() => handleThumbnailClick(index)}
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`${displayProduct.name} thumb ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                draggable={false}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-xl-7 col-lg-6 col-md-6">
                                        <div className="product-details-content">
                                            {/* Top-right Navigation Arrows - Now Functional */}
                                            {displayProduct.images.length > 1 && (
                                                <div className="product-nav">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handlePrevImage();
                                                        }}
                                                        className={`transition-opacity duration-200 ${imageLoading ? 'opacity-50 pointer-events-none' : 'hover:opacity-70'}`}
                                                        title="Previous image"
                                                    >
                                                        <i className="fa fa-angle-left"></i>
                                                    </a>
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleNextImage();
                                                        }}
                                                        className={`transition-opacity duration-200 ${imageLoading ? 'opacity-50 pointer-events-none' : 'hover:opacity-70'}`}
                                                        title="Next image"
                                                    >
                                                        <i className="fa fa-angle-right"></i>
                                                    </a>
                                                </div>
                                            )}

                                            <h2>{displayProduct.name}</h2>
                                            <div className="single-product-reviews">
                                                <div className="d-flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} filled={i < Math.round(displayProduct.reviews.rating)} />
                                                    ))}
                                                </div>
                                                <a className="review-link" href="#">({displayProduct.reviews.count} customer review)</a>
                                            </div>
                                            <div className="single-product-price">
                                                <span className="price new-price">Rs. {displayProduct.price.current.toFixed(2)}</span>
                                                {displayProduct.price.current < displayProduct.price.regular && (
                                                    <span className="regular-price">Rs. {displayProduct.price.regular.toFixed(2)}</span>
                                                )}
                                            </div>
                                            {product && product.variants && product.variants.length > 0 && (
                                                <div className="product-size-selector mt-3 mb-3">
                                                    <h6 className="mb-2" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', color: '#333', letterSpacing: '1px' }}>Select Size:</h6>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {product.variants.map((variant) => {
                                                            const displaySize = /[a-zA-Z]/.test(variant.size)
                                                                ? variant.size
                                                                : `${variant.size} ml`;

                                                            return (
                                                                <button
                                                                    key={variant.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedVariant(variant)}
                                                                    className={`btn btn-sm product-variant-option ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                                                                    style={{
                                                                        minWidth: '70px',
                                                                        height: '35px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                >
                                                                    {displaySize}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="product-description" style={{ 
                                                maxHeight: '120px', 
                                                overflowY: 'auto', 
                                                paddingRight: '8px',
                                                marginBottom: '10px',
                                                fontSize: '13px',
                                                lineHeight: '1.7',
                                                color: '#555'
                                            }}>
                                                {(displayProduct.description || 'No description available.').split('\n').map((line, i) => (
                                                    <p key={i} style={{ marginBottom: '6px' }}>{line}</p>
                                                ))}
                                            </div>
                                            <div className="mb-3">
                                                {isOutOfStock ? (
                                                    <span className="text-danger font-weight-bold" style={{ color: '#dc3545', fontWeight: 'bold' }}>
                                                        <i className="fa fa-times-circle mr-1"></i> Currently Out of Stock
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="font-weight-bold" style={{ color: '#e53935' }}>
                                                        <i className="fa fa-exclamation-circle mr-1"></i> Hurry! Only {currentStock} left in stock.
                                                    </span>
                                                ) : (
                                                    <span className="text-success font-weight-bold" style={{ color: '#28a745', fontWeight: 'bold' }}>
                                                        <i className="fa fa-check-circle mr-1"></i> In Stock
                                                    </span>
                                                )}
                                            </div>
                                            <div className="single-product-quantity">
                                                <form className="add-quantity" action="#" onSubmit={handleAddToCart}>
                                                    <div className="product-quantity">
                                                        <input
                                                            value={quantity}
                                                            type="number"
                                                            min="1"
                                                            max={isOutOfStock ? 1 : currentStock}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value) || 1;
                                                                setQuantity(Math.min(currentStock, Math.max(1, val)));
                                                            }}
                                                            disabled={isOutOfStock}
                                                        />
                                                    </div>
                                                    <div className="add-to-cart">
                                                        <button 
                                                            type="submit" 
                                                            className="btn" 
                                                            disabled={isAdding || isOutOfStock}
                                                            style={{ 
                                                                backgroundColor: isOutOfStock ? '#ccc' : undefined,
                                                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                                borderColor: isOutOfStock ? '#ccc' : undefined
                                                            }}
                                                        >
                                                            {isOutOfStock ? 'Out of Stock' : (isAdding ? 'Redirecting...' : 'Add to cart')}
                                                        </button>                                                   </div>
                                                </form>
                                            </div>
                                            <div className="wishlist-compare-btn">
                                                <a 
                                                    href="" 
                                                    className="wishlist-btn mb-md-10 mb-sm-10"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (!displayProduct) return;
                                                        toggleWishlist({
                                                            id: displayProduct.id,
                                                            name: displayProduct.name,
                                                            image: displayProduct.images[0] || '/assets/images/product/default.jpg',
                                                            slug: product?.slug || ''
                                                        });
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {displayProduct && isInWishlist(displayProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                                </a>
                                                {/* <a href="#" className="add-compare">Compare</a> */}
                                            </div>
                                            <div className="product-meta">
                                                <span className="posted-in">
                                                    Categories:{` `}
                                                    {displayProduct.categories.map((cat, index) => (
                                                        <React.Fragment key={cat}>
                                                            <a href="#">{cat}</a>
                                                            {index < displayProduct.categories.length - 1 && ', '}
                                                        </React.Fragment>
                                                    ))}
                                                </span>
                                                {product && product.genderTags && product.genderTags.length > 0 && (
                                                    <span className="posted-in">
                                                        Made for:{` `}
                                                        {product.genderTags.map((tag, index) => (
                                                            <React.Fragment key={tag}>
                                                                <a href="#">{tag}</a>
                                                                {index < product.genderTags.length - 1 && ', '}
                                                            </React.Fragment>
                                                        ))}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="single-product-sharing">
                                                <h3>Share this product</h3>
                                                <ul className="d-flex" style={{ gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
                                                    <li>
                                                        <a 
                                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(displayProduct.name)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/products/' + (product?.slug || '') : '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Share on Twitter"
                                                            style={{ color: '#1DA1F2', fontSize: '18px' }}
                                                        >
                                                            <i className="fa fa-twitter"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a 
                                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/products/' + (product?.slug || '') : '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Share on Facebook"
                                                            style={{ color: '#4267B2', fontSize: '18px' }}
                                                        >
                                                            <i className="fa fa-facebook"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a 
                                                            href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/products/' + (product?.slug || '') : '')}&media=${encodeURIComponent(displayProduct.images[0] || '')}&description=${encodeURIComponent(displayProduct.name)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Share on Pinterest"
                                                            style={{ color: '#E60023', fontSize: '18px' }}
                                                        >
                                                            <i className="fa fa-pinterest"></i>
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a 
                                                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(displayProduct.name + ' - ' + (typeof window !== 'undefined' ? window.location.origin + '/products/' + (product?.slug || '') : ''))}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Share on WhatsApp"
                                                            style={{ color: '#25D366', fontSize: '18px' }}
                                                        >
                                                            <i className="fa fa-whatsapp"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {displayProduct && (
                <ImageLightbox
                    isOpen={lightboxOpen}
                    onClose={handleCloseLightbox}
                    images={displayProduct.images}
                    initialIndex={activeImageIndex}
                    productName={displayProduct.name}
                />
            )}
        </div>
    );
};

export default ProductQuickViewModal;