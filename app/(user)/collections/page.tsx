import Link from "next/link";

export default async function CollectionsPage() {
  // In the future, we will fetch all categories and a paginated list of products here.
  // const categories = await getCategories();
  // const products = await getAllProducts({ page: 1 });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Collections</h1>
        <p className="mt-2 text-lg text-gray-600">
          Browse our products by category or view all available items.
        </p>
      </div>

      {/* Placeholder for Category Links */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* This will be mapped from real data */}
          <Link href="/collections/perfumes-for-men" className="p-4 bg-gray-100 rounded-lg text-center font-medium hover:bg-gray-200 transition">
            Perfumes for Men
          </Link>
          <Link href="/collections/perfumes-for-women" className="p-4 bg-gray-100 rounded-lg text-center font-medium hover:bg-gray-200 transition">
            Perfumes for Women
          </Link>
          <Link href="/collections/unisex" className="p-4 bg-gray-100 rounded-lg text-center font-medium hover:bg-gray-200 transition">
            Unisex
          </Link>
        </div>
      </div>

      {/* Placeholder for All Products List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">All Products</h2>
        <p className="text-gray-500">Product grid and pagination will be implemented here.</p>
      </div>
    </div>
  );
}