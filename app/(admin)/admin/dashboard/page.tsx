'use client';
import Header from '@/components/admin/Header';
import SideNav from '@/components/admin/SideNav';
import { usePathname } from '@/hooks/usePathname';
import React, { useState, useEffect } from 'react';

// Placeholder Pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-gray-600">This is a placeholder page for the {title.toLowerCase()} section.</p>
  </div>
);

const DashboardPage = () => <PlaceholderPage title="Dashboard" />;
const ProductsPage = () => <PlaceholderPage title="Products" />;
const CategoriesPage = () => <PlaceholderPage title="Categories" />;
const OrdersPage = () => <PlaceholderPage title="Orders" />;
const CustomersPage = () => <PlaceholderPage title="Customers" />;
const MlmSettingsPage = () => <PlaceholderPage title="MLM Settings" />;

const App: React.FC = () => {
  const pathname = usePathname();
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSideNavOpen(false);
  }, [pathname]);

  const renderContent = () => {
    // Default to /admin if hash is empty or just '#'
    if (pathname === '/' || pathname === '') {
      window.location.hash = '#/admin';
      return <DashboardPage />;
    }

    switch (pathname) {
      case '/admin':
        return <DashboardPage />;
      case '/admin/products':
        return <ProductsPage />;
      case '/admin/categories':
        return <CategoriesPage />;
      case '/admin/orders':
        return <OrdersPage />;
      case '/admin/customers':
        return <CustomersPage />;
      case '/admin/mlm':
        return <MlmSettingsPage />;
      default:
        return <PlaceholderPage title="404 - Page Not Found" />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
      {/* Backdrop for mobile */}
      <div 
        onClick={() => setSideNavOpen(false)}
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity duration-300 ease-in-out ${sideNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      ></div>

      <SideNav isOpen={sideNavOpen} setIsOpen={setSideNavOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSideNavOpen={setSideNavOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;