import Link from "next/link";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // In the future, we will fetch the product details using `params.slug`.
  // const product = await getProductBySlug(params.slug);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        {/* Breadcrumbs */}
        <nav className="text-sm mb-2">
          <Link href="/collections" className="text-gray-500 hover:text-gray-700">Collections</Link>
          <span className="mx-2 text-gray-400">/</span>
          {/* This category link will be dynamic */}
          <Link href="/collections/perfumes" className="text-gray-500 hover:text-gray-700">Perfumes</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 capitalize">{params.slug.replace(/-/g, ' ')}</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
          Product: {params.slug.replace(/-/g, ' ')}
        </h1>
      </div>

      {/* Placeholder for Product Details */}
      <div>
        <p className="text-gray-500">
          The full product details, image gallery, variant selection, and add-to-cart functionality will be implemented here.
        </p>
      </div>
    </div>
  );
}