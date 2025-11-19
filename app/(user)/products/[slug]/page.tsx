import { PublicProduct } from "@/components/HeroPage";
import ProductDetailsClientPage from "@/components/products/ProductDetailsClient";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const serializeProduct = (product: any): PublicProduct => {
  return {
    ...product,
    variants: product.variants.map((variant: any) => ({
      ...variant,
      price: variant.price.toNumber(),
    })),
    discountPercentage: product.discountPercentage ? product.discountPercentage.toNumber() : null,
    ratingsAvg: product.ratingsAvg ? product.ratingsAvg.toNumber() : 0,
  };
};

async function getProductData(slug: string) {
  console.log('Searching for product with slug:', slug); // Debug log
  
  const productData = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: { orderBy: { price: 'asc' } },
      reviews: { 
        include: { user: { select: { fullName: true } } },
        orderBy: { createdAt: 'desc' }
      },
    },
  });

  if (!productData) {
    console.log('No product found for slug:', slug); // Debug log
    notFound();
  }

  const relatedProductsData = await prisma.product.findMany({
    where: {
      categoryId: productData.categoryId,
      id: {
        not: productData.id,
      },
    },
    take: 8,
    include: {
      variants: { orderBy: { price: 'asc' } },
      category: true,
      reviews: { select: { id: true } }
    }
  });

  const product = serializeProduct(productData);
  const relatedProducts = relatedProductsData.map(serializeProduct);

  return { product, relatedProducts };
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

// Fixed: Await the params Promise
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params; // This is the critical fix
  console.log('Received slug from URL:', slug); // Debug log
  
  const { product, relatedProducts } = await getProductData(slug);
  
  return <ProductDetailsClientPage product={product} relatedProducts={relatedProducts} />;
}