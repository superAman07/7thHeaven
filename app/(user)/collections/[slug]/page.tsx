import Link from "next/link";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // In the future, we will fetch the category details and its products using `params.slug`.
  // const category = await getCategoryBySlug(params.slug);
  // const products = await getProductsByCategory(params.slug);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-2">
          <Link href="/collections" className="text-gray-500 hover:text-gray-700">Collections</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 capitalize">{params.slug.replace(/-/g, ' ')}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
          {params.slug.replace(/-/g, ' ')}
        </h1>
      </div>

      {/* Placeholder for Products in this Category */}
      <div>
        <p className="text-gray-500">
          A grid of products for the category "{params.slug}" will be implemented here.
        </p>
      </div>
    </div>
  );
}