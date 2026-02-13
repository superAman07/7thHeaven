'use client';

import Link from 'next/link';

interface AnnouncementBarProps {
    text: string | null;
    link: string | null;
    isVisible: boolean;
}

export default function AnnouncementBar({ text, link, isVisible }: AnnouncementBarProps) {
    if (!isVisible || !text) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[2001] h-[40px] w-full bg-gradient-to-r from-[#D4AF37] to-[#B77A06] text-white shadow-md overflow-hidden flex items-center group">
             {/* Use standard style tag to prevent black screen/render errors */}
             <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    display: inline-block;
                    white-space: nowrap;
                    will-change: transform;
                    animation: marquee 30s linear infinite;
                    padding-left: 100%;
                }
                .parent:hover .animate-marquee {
                    animation-play-state: paused;
                }
            `}</style>

            {link ? (
                <Link href={link} className="flex items-center w-full h-full no-underline text-white parent">
                    <div className="animate-marquee text-sm font-bold tracking-widest uppercase drop-shadow-sm px-4">
                        {text}
                    </div>
                </Link>
            ) : (
                <div className="flex items-center w-full h-full parent">
                    <div className="animate-marquee text-sm font-bold tracking-widest uppercase drop-shadow-sm px-4">
                        {text}
                    </div>
                </div>
            )}
        </div>
    );
}