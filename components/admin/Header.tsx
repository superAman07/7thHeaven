'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react';

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

interface HeaderProps {
  setSideNavOpen: (open: boolean) => void;
  user: AdminUser | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ setSideNavOpen, user, onLogout }) => {
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

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    // Added 'relative z-40' to fix stacking context issues (modal opening behind things)
    <header className="relative z-40 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100/50">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Menu Button - Fixed sizing and touch target */}
        <button
          onClick={() => setSideNavOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Right Section: User Dropdown */}
        <div className="ml-auto relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all group"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className="relative">
              <UserCircle className="w-10 h-10 text-gray-400 group-hover:text-[#E6B422] transition-colors" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#E6B422] transition-colors">{user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Administrator</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown Menu - Fixed positioning to ensure it floats on top */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Info Header */}
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || 'admin@7thheaven.com'}</p>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <button 
                  onClick={() => setDropdownOpen(false)} 
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-[#E6B422]/5 hover:text-[#E6B422] transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>

                <button 
                  onClick={() => setDropdownOpen(false)} 
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-[#E6B422]/5 hover:text-[#E6B422] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>

              <div className="p-2 border-t border-gray-100">
                <button 
                  onClick={handleLogoutClick} 
                  className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;