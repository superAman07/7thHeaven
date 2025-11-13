import React from 'react';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-gray-600">This is a placeholder page for the {title.toLowerCase()} section.</p>
  </div>
);

export default function ProductsPage() {
  return <PlaceholderPage title="Products" />;
}
