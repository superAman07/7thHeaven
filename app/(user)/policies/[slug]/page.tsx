import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import axios from 'axios';

// Map slugs to readable titles
const POLICY_TITLES: Record<string, string> = {
    'legal_terms': 'Terms & Conditions',
    'legal_privacy': 'Privacy Policy',
    'legal_refund': 'Refund Policy',
    'legal_shipping': 'Shipping Policy'
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = await params.slug;
    const title = POLICY_TITLES[slug] || 'Policy';
    return {
        title: `${title} | Celsius`,
    };
}

async function getPolicyContent(slug: string) {
    try {
        // We use the absolute URL for server-side fetching or call the DB directly if preferred.
        // But since you have an API, let's use it (requires full URL in server components)
        // OR better: Import the logic directly to avoid HTTP roundtrip on server
        
        // OPTION A: Direct DB Call (Faster & Cleaner for Server Components)
        const { getSiteContent } = await import('@/lib/site-content');
        const content = await getSiteContent(slug, {});
        return content?.text || '';
    } catch (error) {
        return null;
    }
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; // Await params (Next.js 15+ requirement)
    const title = POLICY_TITLES[slug];

    if (!title) {
        return notFound();
    }

    const content = await getPolicyContent(slug);

    return (
        <div className="min-h-[60vh] py-16 px-4 md:px-8 bg-white">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                     <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1a1511] mb-4">
                        {title}
                    </h1>
                    <div className="w-24 h-1 bg-[#B6902E] mx-auto"></div>
                </div>

                {/* Content */}
                <div 
                    className="prose prose-lg max-w-none text-gray-600 font-sans
                        prose-headings:font-serif prose-headings:text-[#1a1511] 
                        prose-a:text-[#B6902E] hover:prose-a:text-[#9a7820]
                        prose-strong:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: content || '<p>No content available.</p>' }}
                />
            </div>
        </div>
    );
}