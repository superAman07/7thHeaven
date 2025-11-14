'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import SideNav from '@/components/admin/SideNav';
import Header from '@/components/admin/Header';
import { LoginModal } from '@/components/admin/LoginModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get('/api/v1/admin/me');
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    setSideNavOpen(false);
  }, [pathname]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden">
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}