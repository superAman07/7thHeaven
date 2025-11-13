
import { useState, useEffect } from 'react';

// This hook mimics the behavior of next/navigation's usePathname for a hash-based SPA.
export const usePathname = (): string => {
  const getPath = () => window.location.hash.slice(1) || '/';
  
  const [pathname, setPathname] = useState(getPath());

  useEffect(() => {
    const handleHashChange = () => {
      setPathname(getPath());
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Set initial state correctly
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return pathname;
};
