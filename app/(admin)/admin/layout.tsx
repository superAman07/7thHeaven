'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import SideNav from '@/components/admin/SideNav';
import Header from '@/components/admin/Header';
 
interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/admin/me');
        setUser(response.data.data); 
        setIsLoading(false);
      } catch (error) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [pathname, router]);

  useEffect(() => {
    setSideNavOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/admin/logout');
      router.push('/admin/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-100">
        <p>Loading...</p>
      </div>
    );
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
        <Header setSideNavOpen={setSideNavOpen} user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}