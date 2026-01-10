'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
import SideNav from '@/components/admin/SideNav';
import Header from '@/components/admin/Header';
import { Crown, Loader2 } from 'lucide-react';
 
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
      <div 
        className="flex h-screen items-center justify-center relative overflow-hidden" 
        style={{ 
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F3EF 100%)'
        }}
      >
        {/* Floating Background Decorations */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#E6B422] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        </div>

        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-[#E6B422] to-[#F4D03F] flex items-center justify-center shadow-2xl shadow-[#E6B422]/30 animate-pulse">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-[#E6B422]/30 animate-ping"></div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Loader2 className="w-6 h-6 text-[#E6B422] animate-spin" />
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Loading Admin Panel</h2>
          </div>
          <p className="text-gray-500 font-medium">Authenticating your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-hidden relative" 
      style={{ 
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F3EF 100%)'
      }}
    >
      {/* Floating Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5 z-0">
        <div className="absolute top-20 right-20 w-64 h-64 bg-[#E6B422] rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Backdrop */}
      <div 
        onClick={() => setSideNavOpen(false)}
        className={`fixed inset-0 bg-black/60 z-20 md:hidden transition-opacity duration-300 ease-in-out ${sideNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      ></div>

      <SideNav isOpen={sideNavOpen} setIsOpen={setSideNavOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header setSideNavOpen={setSideNavOpen} user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}