'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  referralCode: string;
  variant?: 'icon' | 'floating';
}

export default function ShareButton({
  referralCode,
  variant = 'icon',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const referralUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/login?ref=${referralCode}` : '';

  const [isCopied, setIsCopied] = useState(false);

  const shareMessage = `🌟 Join me at 7th Heaven Club and unlock exclusive luxury fragrances! Use my referral link: ${referralUrl}`;

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: 'fa-whatsapp',
      color: 'bg-[#25D366] hover:bg-[#1da851]',
      url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    },
    {
      name: 'Telegram',
      icon: 'fa-telegram',
      color: 'bg-[#0088cc] hover:bg-[#006699]',
      url: `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(
        '🌟 Join 7th Heaven Club!'
      )}`,
    },
    {
      name: 'Facebook',
      icon: 'fa-facebook',
      color: 'bg-[#1877F2] hover:bg-[#0d65d9]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: 'Twitter',
      icon: 'fa-twitter',
      color: 'bg-black hover:bg-gray-800',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
    },
  ];

  const copyToClipboard = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl);
    setIsCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button - CONSISTENT 42px HEIGHT */}
      <button
        onClick={() => setIsOpen(true)}
        className={
          variant === 'icon'
            ? 'bg-linear-to-r from-[#ddb040] to-[#e8c55a] hover:from-[#c59d35] hover:to-[#ddb040] text-black w-[42px] h-[42px] rounded-lg shadow-lg flex items-center justify-center text-sm transition-all transform hover:scale-105'
            : 'bg-linear-to-r from-[#ddb040] to-[#e8c55a] text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-xl animate-pulse hover:animate-none hover:scale-110 transition-transform'
        }
        title="Share & Earn"
      >
        <i className="fa fa-share-alt" />
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          {/* MODAL CONTENT */}
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Premium Gradient */}
            <div className="bg-linear-to-br from-[#1a1a1a] to-black p-6 text-center relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#ddb040] opacity-20 blur-3xl rounded-full pointer-events-none" />

              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors z-10"
              >
                <i className="fa fa-times text-lg" />
              </button>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-linear-to-tr from-[#ddb040] to-[#fce38a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(221,176,64,0.4)]">
                  <i className="fa fa-gift text-3xl text-black/80" />
                </div>

                <h3 className="text-white text-xl font-serif font-bold mb-2 tracking-wide">
                  Share & Earn Rewards
                </h3>
                <p className="text-[#ddb040] text-xs font-bold uppercase tracking-widest">
                  Invite 5 friends & Unlock Benefits
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Premium Input Field */}
              <div
                className="group bg-white rounded-xl p-1.5 mb-6 flex items-center gap-2 border-2 border-gray-100 focus-within:border-[#ddb040] transition-colors shadow-sm cursor-pointer"
                onClick={copyToClipboard}
              >
                <div className="pl-3 pr-2 text-gray-400">
                  <i className="fa fa-link" />
                </div>

                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-gray-700 font-medium outline-none truncate cursor-pointer"
                />

                <button
                  onClick={copyToClipboard}
                  className={`h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                    isCopied
                      ? 'bg-green-500 text-white shadow-[0_4px_10px_rgba(34,197,94,0.3)]'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#333] shadow-[0_4px_10px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  {isCopied ? (
                    <span className="flex items-center gap-1">
                      <i className="fa fa-check" /> Copied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">Copy</span>
                  )}
                </button>
              </div>

              {/* Share Platform Buttons */}
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-4">
                  Share via Social Media
                </p>

                <div className="flex justify-center gap-3 sm:gap-5">
                  {shareLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.name}
                      className={`${link.color} text-white w-12 h-12 rounded-full! flex! items-center! justify-center! text-2xl transition-all transform hover:scale-110 hover:-translate-y-1 shadow-lg`}
                      onClick={() => setIsOpen(false)}
                    >
                      <i className={`fa ${link.icon}`} />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
