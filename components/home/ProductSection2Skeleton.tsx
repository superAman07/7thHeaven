import React from 'react';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export const ProductSection2Skeleton = () => {
  return (
    <div className="product-section section pt-70 pt-lg-45 pt-md-40 pt-sm-30 pt-xs-15">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="shop-banner-title text-center">
              <h2> OUR New Arrival</h2>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="product-tab-menu mb-40 mb-xs-20">
              <ul className="nav">
                <li><a href="#" className="active">New Products</a></li>
                <li><a href="#">OnSale</a></li>
                <li><a href="#">Feature Products</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row"> 
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
};