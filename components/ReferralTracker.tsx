'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref) {
      document.cookie = `referralCode=${ref}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
  }, [ref]);

  return null;
}