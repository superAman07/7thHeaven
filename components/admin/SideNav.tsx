'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Share2, X, Bell } from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/network', label: 'Network Settings', icon: Share2 },
  { href: '/admin/storefront', label: 'Store Front Page', icon: LayoutDashboard },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === '/admin/dashboard' && pathname === '/admin/dashboard');

  return (
    <Link
      href={href}
      className={`relative flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 group overflow-hidden mb-1 ${
        isActive
          ? 'bg-linear-to-r from-[#D4AF37] to-[#F4D03F] text-white'
          : 'text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
      }`}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r-lg"></div>
      )}
      
      <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="relative z-10 tracking-wide">{label}</span>
    </Link>
  );
};

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, setIsOpen }) => {
  return (
    <>
      <nav 
        className={`fixed inset-y-0 left-0 z-30 md:z-0! flex flex-col w-72 p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 bg-white/80 backdrop-blur-xl border-r border-gray-100 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar"
      >
        {/* Header Section with Logo */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-3">
            {/* LOGO IMAGE */}
            <img 
              src="/assets/images/logo.png" 
              alt="7th Heaven" 
              className="h-10 w-auto object-contain"
            />
            <div className="flex flex-col">
               <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Admin Portal</span>
            </div>
          </Link>
          {/* Removed the mobile close button (hamburger/X) as requested */}
        </div>
        {/* Navigation Links */}
        <div className="flex! flex-col! flex-1! overflow-y-auto! custom-scrollbar! space-y-0!">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {/* Footer Section */}
        <div className="pt-6 mt-6 border-t border-gray-100">
          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] text-gray-600 font-bold">Operational</span>
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