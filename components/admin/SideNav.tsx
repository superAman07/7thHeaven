'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Share2, Bell, MessageSquare, Settings } from 'lucide-react';

const getNavItems = (newOrdersCount: number) => [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart, badgeCount: newOrdersCount },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/network', label: 'Network Settings', icon: Share2 },
  { href: '/admin/support-tickets', label: 'Support Tickets', icon: MessageSquare },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/storefront', label: 'Store Front Page', icon: LayoutDashboard },
  { href: '/admin/site-settings', label: 'Site Settings', icon: Settings },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon, badgeCount }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/admin/dashboard' && pathname === '/admin/dashboard');
  return (
    <Link
      href={href}
      className={`relative flex! flex-row! items-center! px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
        isActive
          ? 'bg-linear-to-r from-[#D4AF37] to-[#F4D03F] text-white'
          : 'text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
      }`}
    >
      <Icon className={`w-4 h-4 mr-2.5 shrink-0 ${isActive ? '' : 'group-hover:scale-105'}`} />
      <span className="truncate">{label}</span>
      {badgeCount && badgeCount > 0 && (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  );
};

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, setIsOpen }) => {

  const [newOrdersCount, setNewOrdersCount] = useState(0);
  useEffect(() => {
    const fetchOrderCounts = async () => {
      try {
        const res = await fetch('/api/v1/admin/orders?limit=1');
        const data = await res.json();
        if (data.meta?.newOrdersCount) {
          setNewOrdersCount(data.meta.newOrdersCount);
        }
      } catch (err) {
        console.error('Failed to fetch order counts');
      }
    };
    
    fetchOrderCounts();
    // Refresh every 60 seconds
    const interval = setInterval(fetchOrderCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav 
        className={`fixed inset-y-0 left-0 z-30 md:z-0! flex flex-col w-60 p-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-white/90 backdrop-blur-xl border-r border-gray-100 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        {/* Header Section with Logo */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <img 
              src="/assets/images/logo.png" 
              alt="Celsius" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Admin</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex! flex-col! flex-1! overflow-y-auto! custom-scrollbar! gap-0.5!">
          {getNavItems(newOrdersCount).map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Footer Section */}
        <div className="pt-3 mt-3 border-t border-gray-100">
          <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-[9px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">System Status</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="text-[10px] text-gray-600 font-medium">Operational</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SideNav;