'use client';

import React, { useMemo, useState } from 'react';
import Link from "next/link";
import Slider from "react-slick";
import { PublicProduct } from '../HeroPage';
import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProductDetailsClientProps {
    product: PublicProduct;
    relatedProducts: PublicProduct[];
}

const ProductDetailsClientPage = ({ product, relatedProducts }: ProductDetailsClientProps) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );

    const currentStock = selectedVariant?.stock ?? 0;
    const isOutOfStock = currentStock === 0;
    const isLowStock = currentStock > 0 && currentStock <= 5;

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(false);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const displayPrice = useMemo(() => {
        if (!selectedVariant) {
            return { current: 0, regular: 0 };
        }
        const regularPrice = selectedVariant.price;
        const discount = product.discountPercentage || 0;
        const current = regularPrice - (regularPrice * discount / 100);
        return { current, regular: regularPrice };
    }, [product, selectedVariant]);

    const handleImageChange = (index: number) => {
        if (index === activeImageIndex) return;
        setImageLoading(true);
        setActiveImageIndex(index);
        setTimeout(() => setImageLoading(false), 300);
    };

    const handlePrevImage = () => {
        const newIndex = activeImageIndex === 0 ? product.images.length - 1 : activeImageIndex - 1;
        handleImageChange(newIndex);
    };

    const handleNextImage = () => {
        const newIndex = activeImageIndex === product.images.length - 1 ? 0 : activeImageIndex + 1;
        handleImageChange(newIndex);
    };

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVariant || isOutOfStock) return;

        setIsAdding(true);
        
        addToCart({ 
            ...product,
            discountPercentage: product.discountPercentage ?? 0,
            selectedVariant: selectedVariant,
            price: selectedVariant.price 
        }, quantity);
        
        setTimeout(() => setIsAdding(false), 1000);
    };

    React.useEffect(() => {
        const checkUserReview = async () => {
            try {
                // 1. Get Current User
                const authRes = await axios.get('/api/v1/auth/me');
                if (authRes.data.success) {
                    const userId = authRes.data.user.id;
                    setCurrentUserId(userId); // Save ID
                    
                    console.log("✅ Logged in as User:", userId);

                    // 2. Fetch fresh reviews
                    const reviewsRes = await axios.get(`/api/v1/products/${product.id}/reviews`);
                    const reviews = reviewsRes.data.reviews || [];
                    
                    console.log("📦 Fetched Reviews:", reviews);

                    // 3. Find match
                    const myReview = reviews.find((r: any) => r.userId === userId);
                    
                    if (myReview) {
                        console.log("🎯 Found User's Review:", myReview);
                        setIsEditingReview(true);
                        setReviewRating(myReview.rating);
                        setReviewText(myReview.text || '');
                    } else {
                        console.log("❌ No review found for this user on this product.");
                    }
                }
            } catch (error) {
                // User not logged in or error, ignore
            }
        };
        checkUserReview();
    }, [product.id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reviewRating === 0) {
            toast.error("Please select a star rating");
            return;
        }

        setIsSubmittingReview(true);
        try {
            const method = isEditingReview ? 'put' : 'post';
            const res = await axios[method](`/api/v1/products/${product.id}/reviews`, {
                rating: reviewRating,
                text: reviewText
            });

            if (res.status === 201) {
                toast.success("Review submitted successfully!");
                setReviewRating(0);
                setReviewText('');
                window.location.reload();
            }
        } catch (error: any) {
            if (error.response?.status === 401) {
                toast.error("Please login to write a review");
            } else if (error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error("Failed to submit review");
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async () => {
        if (!window.confirm("Are you sure you want to delete your review?")) return;

        setIsSubmittingReview(true);
        try {
            const res = await axios.delete(`/api/v1/products/${product.id}/reviews`);
            if (res.status === 200) {
                toast.success("Review deleted successfully");
                setReviewRating(0);
                setReviewText('');
                setIsEditingReview(false);
                window.location.reload();
            }
        } catch (error: any) {
            toast.error("Failed to delete review");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const sliderSettings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        infinite: relatedProducts.length > 4,
        arrows: false,
        dots: true,
        responsive: [
            { breakpoint: 1199, settings: { slidesToShow: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 2, arrows: false, autoplay: true } },
            { breakpoint: 575, settings: { slidesToShow: 1, arrows: false, autoplay: true } },
        ],
    };

    return (
        <>
            <div className="single-product-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-100 pb-lg-80 pb-md-70 pb-sm-30 pb-xs-20">
                <div className="container">
                    <div className="row">
                        <div className="col-xl-5 col-lg-6 col-md-6 mb-xxs-25 mb-xs-25 mb-sm-25">
                            {/* Product Details Left - Same structure as QuickViewModal */}
                            <div className="product-details-left">
                                {/* Main Image Display */}
                                <div className="w-full mb-4">
                                    <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 relative">
                                        {product.images.length > 0 && (
                                            <>
                                                <img
                                                    src={product.images[activeImageIndex]}
                                                    alt={product.name}
                                                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}`}
                                                />

                                                {/* Navigation zones */}
                                                {product.images.length > 1 && (
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

                                                {/* Image Counter */}
                                                {product.images.length > 1 && (
                                                    <div className="absolute bottom-2 right-2 bg-transparent bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                                        {activeImageIndex + 1} / {product.images.length}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Thumbnail Images */}
                                {product.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {product.images.map((img, index) => (
                                            <div
                                                key={index}
                                                className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${activeImageIndex === index
                                                    ? 'border-yellow-500 bg-yellow-100 shadow-lg ring-2 ring-yellow-300'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                                    }`}
                                                onClick={() => handleImageChange(index)}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} thumb ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-xl-7 col-lg-6 col-md-6">
                            {/* Product Details Content - Same structure as QuickViewModal */}
                            <div className="product-details-content">
                                <div className="product-nav">
                                    <a href="#" onClick={(e) => { e.preventDefault(); handlePrevImage(); }} title="Previous image">
                                        <i className="fa fa-angle-left"></i>
                                    </a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleNextImage(); }} title="Next image">
                                        <i className="fa fa-angle-right"></i>
                                    </a>
                                </div>

                                <h2>{product.name}</h2>

                                <div className="single-product-reviews">
                                    <div className="d-flex">
                                        {[...Array(5)].map((_, i) => (
                                            <i key={i} className={`fa ${i < Math.round(product.ratingsAvg || 0) ? 'fa-star' : 'fa-star-o'}`}></i>
                                        ))}
                                    </div>
                                    <a className="review-link" href="#">({product.reviews.length} customer review)</a>
                                </div>

                                <div className="single-product-price">
                                    <span className="price new-price">{displayPrice.current.toFixed(2)}</span>
                                    {displayPrice.current < displayPrice.regular && (
                                        <span className="regular-price">Rs. {displayPrice.regular.toFixed(2)}</span>
                                    )}
                                </div>

                                {product.variants && product.variants.length > 0 && (
                                    <div className="product-size-selector mt-4 mb-3">
                                        <h6 className="mb-2" style={{ fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', color: '#333', letterSpacing: '1px' }}>Select Size:</h6>
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
                                                            minWidth: '80px', // Made wider for "ml" text
                                                            height: '40px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {displaySize}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="product-description">
                                    <p>{product.description}</p>
                                </div>

                                <div className="single-product-quantity">
                                    <form className="add-quantity" action="#" onSubmit={handleAddToCart}>
                                        <div className="product-quantity">
                                            <input
                                                value={quantity}
                                                type="number"
                                                min="1"
                                                max={isOutOfStock ? 1 : currentStock} // Prevent selecting more than stock
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    // Ensure quantity doesn't exceed stock
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
                                                {isOutOfStock ? 'Out of Stock' : (isAdding ? 'Added to Cart!' : 'Add to cart')}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="mt-3">
                                        {isOutOfStock ? (
                                            <span className="text-danger font-weight-bold">
                                                <i className="fa fa-times-circle mr-1"></i> Currently Out of Stock
                                            </span>
                                        ) : isLowStock ? (
                                            <span className="font-weight-bold" style={{ color: '#e53935' }}>
                                                <i className="fa fa-exclamation-circle mr-1"></i> Hurry! Only {currentStock} left in stock.
                                            </span>
                                        ) : (
                                            <span className="text-success font-weight-bold">
                                                <i className="fa fa-check-circle mr-1"></i> In Stock
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="wishlist-compare-btn">
                                    <a 
                                        href="#" 
                                        className="wishlist-btn mb-md-10 mb-sm-10"
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
                                        {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    </a>
                                    {/* <a href="#" className="add-compare">Compare</a> */}
                                </div>

                                <div className="product-meta">
                                    <span className="posted-in">
                                        Categories: {` `}
                                        <a href={`/collections/${product.category.slug}`}> {product.category.name}</a>
                                    </span>
                                    {product.genderTags && product.genderTags.length > 0 && (
                                        <span className="posted-in">
                                            Tags: {` `}
                                            {product.genderTags.map((tag, index) => (
                                                <React.Fragment key={tag}>
                                                    <a href="#"> {tag}</a>
                                                    {index < product.genderTags.length - 1 && ','}
                                                </React.Fragment>
                                            ))}
                                        </span>
                                    )}
                                </div>

                                <div className="single-product-sharing">
                                    <h3>Share this product</h3>
                                    <ul className="d-flex">
                                        <li><a href="#" title="Twitter"><i className="fa fa-twitter"></i></a></li>
                                        <li><a href="#" title="Facebook"><i className="fa fa-facebook"></i></a></li>
                                        <li><a href="#" title="Google Plus"><i className="fa fa-google-plus"></i></a></li>
                                        <li><a href="#" title="Pinterest"><i className="fa fa-pinterest"></i></a></li>
                                        <li><a href="#" title="Instagram"><i className="fa fa-instagram"></i></a></li>
                                        <li><a href="#" title="Vimeo"><i className="fa fa-vimeo"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Single Product Section End */}

            {/* Product Description Review Section Start */}
            <div className="product-description-review-section section">
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="product-review-tab">
                                {/* Review And Description Tab Menu Start */}
                                <ul className="nav dec-and-review-menu">
                                    <li>
                                        <a
                                            className={activeTab === 'description' ? "active" : ""}
                                            href="#description"
                                            onClick={(e) => { e.preventDefault(); setActiveTab('description'); }}
                                        >
                                            Description
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className={activeTab === 'reviews' ? "active" : ""}
                                            href="#reviews"
                                            onClick={(e) => { e.preventDefault(); setActiveTab('reviews'); }}
                                        >
                                            Reviews ({product.reviews.length})
                                        </a>
                                    </li>
                                </ul>
                                {/* Review And Description Tab Menu End */}

                                {/* Review And Description Tab Content Start */}
                                <div className="tab-content product-review-content-tab" id="myTabContent-4">
                                    <div className={`tab-pane fade ${activeTab === 'description' ? 'active show' : ''}`} id="description">
                                        <div className="single-product-description" dangerouslySetInnerHTML={{ __html: product.description || '' }} />
                                    </div>
                                    <div className={`tab-pane fade ${activeTab === 'reviews' ? 'active show' : ''}`} id="reviews">
                                        <div className="review-page-comment">
                                            <h2>{product.reviews.length} review for {product.name}</h2>
                                            <ul>
                                                {product.reviews.map((review: any) => (
                                                    <li key={review.id}>
                                                        <div className="product-comment">
                                                            <div className="w-[60px] h-[60px] bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 mr-4 shrink-0">
                                                                {review.user?.fullName?.charAt(0) || 'U'}
                                                            </div>
                                                            <div className="product-comment-content">
                                                                <div className="product-reviews">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <i key={i} className={`fa ${i < review.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                                                                    ))}
                                                                </div>
                                                                <p className="meta">
                                                                    <strong>{review.user?.fullName || 'Anonymous'}</strong> - <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                                </p>
                                                                <div className="description">
                                                                    <p>{review.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="review-form-wrapper">
                                                <div className="review-form">
                                                    <span className="comment-reply-title">
                                                        {isEditingReview ? 'Edit your review' : 'Add a review'} 
                                                    </span>
                                                    {isEditingReview && (
                                                        <button
                                                            type="button"
                                                            onClick={handleDeleteReview}
                                                            disabled={isSubmittingReview}
                                                            className="text-red-500! text-sm! hover:text-red-700! underline!"
                                                        >
                                                            Delete my Review
                                                        </button>
                                                    )}
                                                    <form onSubmit={handleReviewSubmit}>
                                                        <p className="comment-notes">
                                                            <span id="email-notes">Your email address will not be published. </span>
                                                            Required fields are marked
                                                            <span className="required">*</span>
                                                        </p>
                                                        <div className="comment-form-rating">
                                                            <label>Your rating</label>
                                                            <div className="rating flex gap-1 cursor-pointer">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <i 
                                                                        key={star}
                                                                        className={`fa ${star <= (reviewHover || reviewRating) ? 'fa-star' : 'fa-star-o'}`}
                                                                        style={{ color: '#ffb400', fontSize: '18px' }}
                                                                        onMouseEnter={() => setReviewHover(star)}
                                                                        onMouseLeave={() => setReviewHover(0)}
                                                                        onClick={() => setReviewRating(star)}
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="input-element">
                                                            <div className="comment-form-comment">
                                                                <label>Comment</label>
                                                                <textarea 
                                                                    name="message" 
                                                                    cols={40} 
                                                                    rows={8}
                                                                    value={reviewText}
                                                                    onChange={(e) => setReviewText(e.target.value)}
                                                                    required
                                                                ></textarea>
                                                            </div>
                                                            {/* Removed Name/Email inputs as they are handled by Auth */}
                                                            
                                                            <div className="comment-submit">
                                                                <button 
                                                                    type="submit" 
                                                                    className="form-button"
                                                                    disabled={isSubmittingReview}
                                                                >
                                                                    {isSubmittingReview ? 'Processing...' : (isEditingReview ? 'Update Review' : 'Submit Review')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Review And Description Tab Content End */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Section Start - Using ProductSection.tsx CSS Structure */}
            <div className="shop-section section pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-45 pb-70 pb-lg-50 pb-md-40 pb-sm-60 pb-xs-50">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 order-lg-2 order-1">
                            <div className="row">
                                <div className="col-12">
                                    <div className="shop-banner-title text-center">
                                        <h2>RELATED PRODUCTS</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    <div className="shop-product">
                                        <div id="myTabContent-2" className="tab-content">
                                            <div id="grid" className="tab-pane fade active show">
                                                {relatedProducts.length > 0 ? (
                                                    <div className="product-slider tf-element-carousel">
                                                        <Slider {...sliderSettings}>
                                                            {relatedProducts.map((item) => {
                                                                const itemPrice = item.variants?.[0]?.price || 0;
                                                                const itemDiscount = item.discountPercentage || 0;
                                                                const currentItemPrice = itemPrice * (1 - itemDiscount / 100);

                                                                return (
                                                                    <div key={item.id} className="col-12" style={{ padding: '0 15px' }}>
                                                                        <div className="single-product mb-30">
                                                                            <div className="product-img">
                                                                                <Link href={`/products/${item.slug}`}>
                                                                                    <img src={item.images[0]} alt={item.name} style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: '100%' }} />
                                                                                </Link>
                                                                                {item.isNewArrival && <span className="sticker">New</span>}
                                                                                {itemDiscount > 0 && <span className="descount-sticker">-{itemDiscount}%</span>}
                                                                                <div className="product-action d-flex justify-content-between">
                                                                                    <a className="product-btn" href="#">Add to Cart</a>
                                                                                    <ul className="d-flex">
                                                                                        <li><a href="#" title="Quick View"><i className="fa fa-eye"></i></a></li>
                                                                                        <li><a href="#"><i className="fa fa-heart-o"></i></a></li>
                                                                                        <li><a href="#"><i className="fa fa-exchange"></i></a></li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                            <div className="product-content">
                                                                                <h3><Link href={`/products/${item.slug}`}>{item.name}</Link></h3>
                                                                                <div className="ratting">
                                                                                    {[...Array(5)].map((_, i) => (
                                                                                        <i key={i} className={`fa ${i < (item.ratingsAvg || 0) ? 'fa-star' : 'fa-star-o'}`}></i>
                                                                                    ))}
                                                                                </div>
                                                                                <h4 className="price">
                                                                                    <span className="new">Rs. {currentItemPrice.toFixed(2)}</span>
                                                                                    {itemDiscount > 0 && <span className="old">Rs. {itemPrice.toFixed(2)}</span>}
                                                                                </h4>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </Slider>
                                                    </div>
                                                ) : (
                                                    <div className="no-products-message text-center py-5">
                                                        <div className="mb-4">
                                                            <i className="fa fa-box-open" style={{ fontSize: '4rem', color: '#ddd' }}></i>
                                                        </div>
                                                        <h4 className="mb-3" style={{ color: '#666' }}>No Related Products Found</h4>
                                                        <p className="mb-4" style={{ color: '#888', fontSize: '0.95rem' }}>
                                                            We don't have any related products in the same category at the moment.<br />
                                                            Check back soon or explore our other collections!
                                                        </p>
                                                        <Link
                                                            href="/collections"
                                                            className="btn btn-primary px-4 py-2"
                                                            style={{
                                                                backgroundColor: '#333',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                textDecoration: 'none',
                                                                display: 'inline-block'
                                                            }}
                                                        >
                                                            Browse All Products
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
                </div>
            </div>
            {/* Related Products Section End */}
        </>
    );
};

export default ProductDetailsClientPage;