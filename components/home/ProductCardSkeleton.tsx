import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="col-lg-3 col-md-6 col-sm-6">
      <div className="single-product mb-30">
        <div className="product-img bg-gray-200 animate-pulse" style={{ height: '270px', width: '100%' }}>
        </div>
        <div className="product-content mt-4"> 
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};