'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, Sitemap, X } from '../icons';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/mlm', label: 'MLM Settings', icon: Sitemap },
];

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, icon: Icon }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-gray-800 text-white'
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </Link>
  );
};

interface SideNavProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, setIsOpen }) => {
  return (
    <nav 
      className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-neutral-950 text-white p-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between mb-8 px-4">
        <Link href="/admin" className="text-2xl font-bold text-white">
          7th Heaven
        </Link>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
};

export default SideNav;
