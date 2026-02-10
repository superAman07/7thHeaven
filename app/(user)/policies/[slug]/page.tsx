import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Map slugs to readable titles
const POLICY_TITLES: Record<string, string> = {
  legal_terms: 'Terms & Conditions',
  legal_privacy: 'Privacy Policy',
  legal_refund: 'Refund Policy',
  legal_shipping: 'Shipping Policy',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = POLICY_TITLES[slug] || 'Policy';
  return {
    title: `${title} | Celsius`,
  };
}

async function getPolicyContent(slug: string): Promise<string | null> {
  try {
    const { getSiteContent } = await import('@/lib/site-content');
    const data = await getSiteContent<any>(slug, {});
    return data?.content?.text || '';
  } catch {
    return null;
  }
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = POLICY_TITLES[slug];

  // DEBUGGING: If title is missing, show what slug we got instead of 404
  if (!title) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Debug: Policy Not Found</h1>
        <p className="mb-2">
          We received Slug:{' '}
          <strong className="bg-yellow-200 px-2 py-1 rounded">"{slug}"</strong>
        </p>
        <p className="mb-4">Expected one of: {Object.keys(POLICY_TITLES).join(', ')}</p>
        <Link href="/" className="text-blue-600 underline">
          Go Home
        </Link>
      </div>
    );
  }

  const content = await getPolicyContent(slug);

  return (
    <div id="main-wrapper">
      {/* Page Banner */}
      <div
        className="page-banner-section section min-h-[35vh] lg:min-h-[45vh] flex items-end pb-[20px]"
        style={{ background: 'linear-gradient(180deg, #0d0b09 0%, #1a1511 100%)' }}
      >
        <div className="container-fluid px-4 md:px-5">
          <div className="row">
            <div className="col-12 p-0">
              <div className="page-banner w-100 d-flex flex-column md:flex-row justify-between items-center md:items-end">
                {/* Breadcrumbs */}
                <div className="order-2 order-md-1 mt-2 md:mt-0">
                  <ul
                    className="page-breadcrumb flex justify-center md:justify-start mb-0 text-sm"
                    style={{ fontSize: '14px' }}
                  >
                    <li>
                      <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                        Home
                      </Link>
                    </li>
                    <li className="text-white/80 ml-3">{title}</li>
                  </ul>
                </div>

                {/* Title */}
                <div className="order-1 order-md-2 text-center md:text-end">
                  <h1
                    className="text-white mb-0"
                    style={{
                      fontSize: 'clamp(22px, 3vw, 36px)',
                      lineHeight: 1.1,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {title}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="section py-16 px-4 md:px-8 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-lg max-w-none text-gray-600 font-sans"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html:
                  content ||
                  '<p class="text-center italic text-gray-400">Policy content not yet updated.</p>',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
