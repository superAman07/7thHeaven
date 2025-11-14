'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, User, Settings, LogOut, ChevronDown, Menu } from '../icons';

interface HeaderProps {
  setSideNavOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSideNavOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setSideNavOpen(true)}
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center cursor-pointer space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <UserCircle className="w-8 h-8 text-gray-600" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700">Aman</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 z-10 transition-all duration-200 ease-out transform ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <button onClick={closeDropdown} className="w-full text-left flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <User className="w-4 h-4 mr-2" />
              Profile
            </button>
            <button onClick={closeDropdown} className="w-full text-left flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button onClick={closeDropdown} className="w-full text-left flex cursor-pointer items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
