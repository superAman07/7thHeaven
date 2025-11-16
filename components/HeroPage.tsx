import prisma from "@/lib/prisma";
import AboutUsAreaSection from "./home/AboutUsArea";
import BlogSectionArea from "./home/BlogSectionArea";
import CategoryGender from "./home/CategoryGender";
import FeatureSectionPage from "./home/FeatureSection";
import FooterPage from "./home/Footer";
import HowItWorksPage from "./home/HowItWorks";
import NavBar from "./home/NavBar";
import ProductSectionPage from "./home/ProductSection";
import ProductSection2 from "./home/ProductSection2";
import SliderSection from "./home/SliderSection";

export type PublicProduct = {
    id: string;
    name: string;
    images: string[];
    isNewArrival: boolean;
    discountPercentage: number | null;
    variants: { price: number }[];
    category: { slug: string };
};

async function getProducts(): Promise<PublicProduct[]> {
    try {
        const productsFromDb = await prisma.product.findMany({
            where: { inStock: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                images: true,
                isNewArrival: true,
                discountPercentage: true,
                variants: {
                    select: { price: true },
                    orderBy: { price: 'asc' }
                },
                category: { select: { slug: true } }
            }
        });
        return productsFromDb.map(p => ({
            ...p,
            discountPercentage: p.discountPercentage ? p.discountPercentage.toNumber() : null,
            variants: p.variants.map(v => ({
                price: v.price.toNumber()
            }))
        }));
    } catch (error) {
        console.error("Failed to fetch products for homepage:", error);
        return [];
    }
}

export default async function HeroPage() {
    const products = await getProducts();
    const newArrivals = products.filter(p => p.isNewArrival);
    const onSaleProducts = products.filter(p => p.discountPercentage && p.discountPercentage > 0);
    return <>
        <div id="main-wrapper">
            <NavBar />
            <SliderSection />
            <HowItWorksPage />
            <ProductSectionPage products={products.slice(0, 8)} />
            <CategoryGender />
            <ProductSection2 tabs={{
                products: newArrivals,
                onsale: onSaleProducts,
                feature: [...products].reverse().slice(0, 8)
            }} />
            <AboutUsAreaSection />
            <BlogSectionArea />
            <FeatureSectionPage />
            <FooterPage />
        </div>
    </>
}