import React from 'react';

export const NoProductsPlaceholder = ({ message = "New products are coming soon!" }: { message?: string }) => {
  return (
    <div className="col-12 text-center py-10">
      <img src="/default.png" alt="No products found" className="mx-auto mb-4" style={{ width: '120px', opacity: 0.5 }} />
      <h3 className="text-xl font-semibold text-gray-700">{message}</h3>
      <p className="text-gray-500">Please check back later.</p>
    </div>
  );
};