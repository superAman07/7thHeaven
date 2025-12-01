import { Metadata } from 'next';
import CollectionsContent from '@/components/home/CollectionsContent';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return {
    title: `Shop ${title} | 7th Heaven`,
    description: `Explore our exclusive collection of ${title}. Find your perfect scent at 7th Heaven.`,
  };
}

export default async function CategorySlugPage({ params }: Props) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<div className="text-center py-20">Loading collections...</div>}>
      <CollectionsContent categorySlug={slug} />
    </Suspense>
  );
}