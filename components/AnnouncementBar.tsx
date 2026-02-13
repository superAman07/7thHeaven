'use client';

import Link from 'next/link';

interface AnnouncementBarProps {
    text: string | null;
    link: string | null;
    isVisible: boolean;
}

export default function AnnouncementBar({ text, link, isVisible }: AnnouncementBarProps) {
    if (!isVisible || !text) return null;

    const Content = () => (
        <div className="bg-black text-white px-4 py-2 text-center text-sm font-medium tracking-wide">
            <p>{text}</p>
        </div>
    );

    if (link) {
        return (
            <Link href={link} className="block hover:opacity-90 transition-opacity">
                <Content />
            </Link>
        );
    }

    return <Content />;
}