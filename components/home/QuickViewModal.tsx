'use client'
import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { PublicProduct } from '../HeroPage';

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

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Reset state when modal is opened
            setActiveImageIndex(0);
            setQuantity(1);
            setProduct(null);
            setError(null);

            const fetchProduct = async () => {
                if (!productId) return;
                setLoading(true);
                try {
                    const response = await axios.get<PublicProduct>(`/api/v1/products/${productId}`);
                    setProduct(response.data);
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
        // Cleanup function
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, productId]);

    const displayProduct = useMemo(() => {
        if (!product) return null;

        const regularPrice = parseFloat(product.variants?.[0]?.price as any) || 0;
        const discount = parseFloat(product.discountPercentage as any) || 0;
        const currentPrice = regularPrice * (1 - discount / 100);

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
    }, [product]);

    const handleAddToCart = (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayProduct) return;
        const payload: any = {
            productId: displayProduct.id,
            productName: displayProduct.name,
            price: displayProduct.price.current,
            quantity: quantity,
        };
        console.log('Cart Payload:', payload);
        alert(`Added ${quantity} of ${displayProduct.name} to cart! Check the console for the payload.`);
        onClose();
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
                        {loading && <p>Loading...</p>}
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        {displayProduct && !loading && (
                            <div className="col-xl-12 col-lg-12">
                                <div className="row">
                                    <div className="col-xl-5 col-lg-6 col-md-6 mb-xxs-25 mb-xs-25 mb-sm-25">
                                        <div className="product-details-left">
                                            <div className="product-details-images slider-lg-image-1 tf-element-carousel">
                                                {/* Main image: display only the active one */}
                                                {displayProduct.images.map((img: any, index: any) => (
                                                    <div className="lg-image" key={index} style={{ display: index === activeImageIndex ? 'block' : 'none' }}>
                                                        <img src={img} alt={displayProduct.name} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="product-details-thumbs slider-thumbs-1 tf-element-carousel">
                                                {/* Thumbnails */}
                                                {displayProduct.images.map((img: any, index: any) => (
                                                    <div
                                                        className="sm-image"
                                                        key={index}
                                                        onClick={() => setActiveImageIndex(index)}
                                                        style={{ cursor: 'pointer', border: activeImageIndex === index ? '2px solid #007bff' : '2px solid transparent', padding: '2px' }} // Simple active state styling
                                                    >
                                                        <img src={img} alt={`product image thumb ${index + 1}`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-7 col-lg-6 col-md-6">
                                        <div className="product-details-content">
                                            <div className="product-nav">
                                                <a href="#"><i className="fa fa-angle-left"></i></a>
                                                <a href="#"><i className="fa fa-angle-right"></i></a>
                                            </div>
                                            <h2>{displayProduct.name}</h2>
                                            <div className="single-product-reviews">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fa ${i < displayProduct.reviews.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                                                ))}
                                                <a className="review-link" href="#">({displayProduct.reviews.count} customer review)</a>
                                            </div>
                                            <div className="single-product-price">
                                                <span className="price new-price">Rs.{displayProduct.price.current.toFixed(2)}</span>
                                                <span className="regular-price">Rs.{displayProduct.price.regular.toFixed(2)}</span>
                                            </div>
                                            <div className="product-description">
                                                <p>{displayProduct.description}</p>
                                            </div>
                                            <div className="single-product-quantity">
                                                <form className="add-quantity" action="#" onSubmit={handleAddToCart}>
                                                    <div className="product-quantity">
                                                        <input value={quantity} type="number" min="1" onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} />
                                                    </div>
                                                    <div className="add-to-link">
                                                        <button type="submit" className="product-add-btn" data-text="add to cart">add to cart</button>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="wishlist-compare-btn">
                                                <a href="#" className="wishlist-btn mb-md-10 mb-sm-10">Add to Wishlist</a>
                                                <a href="#" className="add-compare">Compare</a>
                                            </div>
                                            <div className="product-meta">
                                                <span className="posted-in">
                                                    Categories:
                                                    {displayProduct.categories.map((cat: any, index: any) => (
                                                        <React.Fragment key={cat}>
                                                            <a href="#"> {cat}</a>
                                                            {index < displayProduct.categories.length - 1 && ','}
                                                        </React.Fragment>
                                                    ))}
                                                </span>
                                            </div>
                                            <div className="single-product-sharing">
                                                <h3>Share this product</h3>
                                                <ul>
                                                    <li><a href="#"><i className="fa fa-twitter"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-facebook"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-google-plus"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-pinterest"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-instagram"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-vimeo"></i></a></li>
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
        </div>
    );
};

export default ProductQuickViewModal;
