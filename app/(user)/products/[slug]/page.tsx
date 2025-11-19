'use client';

import React, { useState } from 'react';
import Link from "next/link";
import Slider from "react-slick";

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

export interface ProductImage {
  id: string;
  url: string;
  thumbUrl?: string;
  alt: string;
}

export interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  isNew?: boolean;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  currency: string;
  shortDescription: string;
  fullDescription: string;
  categories: string[];
  images: ProductImage[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  relatedProducts: RelatedProduct[];
}

export const PRODUCT_PAYLOAD: Product = {
  id: "prod_lattafa_angham",
  name: "Lattafa Angham Eau de Parfum",
  price: 6600.00,
  oldPrice: 7700.00,
  currency: "Rs.",
  shortDescription: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco,Proin lectus ipsum, gravida et mattis vulputate, tristique ut lectus",
  fullDescription: `
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam fringilla augue nec est tristique auctor. Donec non est at libero vulputate rutrum. Morbi ornare lectus quis justo gravida semper. Nulla tellus mi, vulputate adipiscing cursus eu, suscipit id nulla.</p>
    <p>Pellentesque aliquet, sem eget laoreet ultrices, ipsum metus feugiat sem, quis fermentum turpis eros eget velit. Donec ac tempus ante. Fusce ultricies massa massa. Fusce aliquam, purus eget sagittis vulputate, sapien libero hendrerit est, sed commodo augue nisi non neque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempor, lorem et placerat vestibulum, metus nisi posuere nisl, in accumsan elit odio quis mi. Cras neque metus, consequat et blandit et, luctus a nunc. Etiam gravida vehicula tellus, in imperdiet ligula euismod eget.</p>
  `,
  categories: ["Accessories", "Electronics"],
  rating: 4,
  reviewCount: 1,
  images: [
    {
      id: "img_main_1",
      url: "https://picsum.photos/id/10/800/800",
      thumbUrl: "https://picsum.photos/id/10/150/150", 
      alt: "Lattafa Angham View 1"
    },
    {
      id: "img_main_2",
      url: "https://picsum.photos/id/20/800/800",
      thumbUrl: "https://picsum.photos/id/20/150/150",
      alt: "Lattafa Angham View 2"
    },
    {
      id: "img_main_3",
      url: "https://picsum.photos/id/30/800/800",
      thumbUrl: "https://picsum.photos/id/30/150/150",
      alt: "Lattafa Angham View 3"
    },
    {
      id: "img_main_4",
      url: "https://picsum.photos/id/40/800/800",
      thumbUrl: "https://picsum.photos/id/40/150/150",
      alt: "Lattafa Angham View 4"
    },
    {
      id: "img_main_5",
      url: "https://picsum.photos/id/50/800/800",
      thumbUrl: "https://picsum.photos/id/50/150/150",
      alt: "Lattafa Angham View 5"
    }
  ],
  reviews: [
    {
      id: "rev_1",
      author: "admin",
      date: "November 22, 2018",
      rating: 4,
      content: "Good Product"
    }
  ],
  relatedProducts: [
    {
      id: "rel_1",
      name: "White Shave Brush",
      image: "https://picsum.photos/id/65/300/300",
      price: 130.00,
      discount: "-10%",
      isNew: true,
      rating: 5
    },
    {
      id: "rel_2",
      name: "White Shave Brug",
      image: "https://picsum.photos/id/75/300/300",
      price: 70.00,
      oldPrice: 100.00,
      discount: "-10%",
      isNew: true,
      rating: 5
    },
    {
      id: "rel_3",
      name: "White Shave Brush",
      image: "https://picsum.photos/id/66/300/300",
      price: 130.00,
      discount: "-10%",
      isNew: true,
      rating: 5
    },
    {
      id: "rel_4",
      name: "White Shave Brug",
      image: "https://picsum.photos/id/76/300/300",
      price: 70.00,
      oldPrice: 100.00,
      discount: "-10%",
      isNew: true,
      rating: 5
    }
  ]
};

const ProductPage = () => {
  const product = PRODUCT_PAYLOAD;
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  
  // Image Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  // EVENT HANDLERS
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
    console.log(`Added ${quantity} items of ${product.id} to cart.`);
    alert(`Added ${quantity} item(s) to cart!`);
  };

  // Related Products Slider Settings (Same as ProductSection.tsx)
  const sliderSettings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: product.relatedProducts.length > 4,
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
    <div id="main-wrapper">      
        {/* Single Product Section Start - Using QuickViewModal CSS Structure */}
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
                                                src={product.images[activeImageIndex].url}
                                                alt={product.images[activeImageIndex].alt}
                                                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-50 scale-105' : 'opacity-100 scale-100'}`}
                                            />
                                            
                                            {/* Navigation zones */}
                                            {product.images.length > 1 && (
                                                <>
                                                    <div 
                                                        className="absolute left-0 top-0 w-1/4 h-full hover:bg-black hover:bg-opacity-5 transition-all duration-200 cursor-pointer" 
                                                        onClick={handlePrevImage}
                                                        title="Previous image"
                                                    />
                                                    <div 
                                                        className="absolute right-0 top-0 w-1/4 h-full hover:bg-black hover:bg-opacity-5 transition-all duration-200 cursor-pointer" 
                                                        onClick={handleNextImage}
                                                        title="Next image"
                                                    />
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            {product.images.length > 1 && (
                                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
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
                                            key={img.id}
                                            className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                                activeImageIndex === index 
                                                    ? 'border-yellow-500 bg-yellow-100 shadow-lg ring-2 ring-yellow-300' 
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                            }`}
                                            onClick={() => handleImageChange(index)}
                                        >
                                            <img 
                                                src={img.thumbUrl || img.url} 
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
                                        <i key={i} className={`fa ${i < Math.round(product.rating) ? 'fa-star' : 'fa-star-o'}`}></i>
                                    ))}
                                </div>
                                <a className="review-link" href="#">({product.reviewCount} customer review)</a>
                            </div>
                            
                            <div className="single-product-price">
                                <span className="price new-price">{product.currency} {product.price.toFixed(2)}</span>
                                {product.oldPrice && (
                                    <span className="regular-price">{product.currency} {product.oldPrice.toFixed(2)}</span>
                                )}
                            </div>
                            
                            <div className="product-description">
                                <p>{product.shortDescription}</p>
                            </div>
                            
                            <div className="single-product-quantity">
                                <form className="add-quantity" action="#" onSubmit={handleAddToCart}>
                                    <div className="product-quantity">
                                        <input 
                                            value={quantity} 
                                            type="number" 
                                            min="1" 
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                                        />
                                    </div>
                                    <div className="add-to-cart">
                                        <button type="submit" className="btn">Add to cart</button>
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
                                    {product.categories.map((cat, index) => (
                                        <React.Fragment key={cat}>
                                            <a href="#"> {cat}</a>
                                            {index < product.categories.length - 1 && ','}
                                        </React.Fragment>
                                    ))}
                                </span>
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
                                        Reviews ({product.reviewCount})
                                    </a>
                                </li>
                            </ul>
                            {/* Review And Description Tab Menu End */}
                            
                            {/* Review And Description Tab Content Start */}
                            <div className="tab-content product-review-content-tab" id="myTabContent-4">
                                <div className={`tab-pane fade ${activeTab === 'description' ? 'active show' : ''}`} id="description">
                                    <div className="single-product-description" dangerouslySetInnerHTML={{__html: product.fullDescription}} />
                                </div>
                                <div className={`tab-pane fade ${activeTab === 'reviews' ? 'active show' : ''}`} id="reviews">
                                    <div className="review-page-comment">
                                        <h2>{product.reviews.length} review for {product.name}</h2>
                                        <ul>
                                            {product.reviews.map((review) => (
                                                <li key={review.id}>
                                                    <div className="product-comment">
                                                        <img src="https://via.placeholder.com/60" alt="author" />
                                                        <div className="product-comment-content">
                                                            <div className="product-reviews">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i key={i} className={`fa ${i < review.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                                                                ))}
                                                            </div>
                                                            <p className="meta">
                                                                <strong>{review.author}</strong> - <span>{review.date}</span>
                                                            </p>
                                                            <div className="description">
                                                                <p>{review.content}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="review-form-wrapper">
                                            <div className="review-form">
                                                <span className="comment-reply-title">Add a review </span>
                                                <form action="#">
                                                    <p className="comment-notes">
                                                        <span id="email-notes">Your email address will not be published.</span>
                                                        Required fields are marked
                                                        <span className="required">*</span>
                                                    </p>
                                                    <div className="comment-form-rating">
                                                        <label>Your rating</label>
                                                        <div className="rating">
                                                            <i className="fa fa-star-o"></i>
                                                            <i className="fa fa-star-o"></i>
                                                            <i className="fa fa-star-o"></i>
                                                            <i className="fa fa-star-o"></i>
                                                            <i className="fa fa-star-o"></i>
                                                        </div>
                                                    </div>
                                                    <div className="input-element">
                                                        <div className="comment-form-comment">
                                                            <label>Comment</label>
                                                            <textarea name="message" cols={40} rows={8}></textarea>
                                                        </div>
                                                        <div className="review-comment-form-author">
                                                            <label>Name </label>
                                                            <input required type="text" />
                                                        </div>
                                                        <div className="review-comment-form-email">
                                                            <label>Email </label>
                                                            <input required type="text" />
                                                        </div>
                                                        <div className="comment-submit">
                                                            <button type="submit" className="form-button">Submit</button>
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
                                            <div className="product-slider tf-element-carousel">
                                                <Slider {...sliderSettings}>
                                                    {product.relatedProducts.map((item) => (
                                                        <div key={item.id} className="col-12" style={{ padding: '0 15px' }}>
                                                            <div className="single-product mb-30">
                                                                <div className="product-img">
                                                                    <Link href={`/products/${item.id}`}>
                                                                        <img src={item.image} alt={item.name} style={{ aspectRatio: '1 / 1', objectFit: 'cover', width: '100%' }} />
                                                                    </Link>
                                                                    {item.isNew && <span className="sticker">New</span>}
                                                                    {item.discount && <span className="descount-sticker">{item.discount}</span>}
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
                                                                    <h3><Link href={`/products/${item.id}`}>{item.name}</Link></h3>
                                                                    <div className="ratting">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <i key={i} className={`fa ${i < item.rating ? 'fa-star' : 'fa-star-o'}`}></i>
                                                                        ))}
                                                                    </div>
                                                                    <h4 className="price">
                                                                        <span className="new">{product.currency} {item.price.toFixed(2)}</span>
                                                                        {item.oldPrice && <span className="old">{product.currency} {item.oldPrice.toFixed(2)}</span>}
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </Slider>
                                            </div>
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
    </div>
  );
};

export default ProductPage;