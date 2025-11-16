import prisma from "@/lib/prisma";
import AboutUsAreaSection from "./home/AboutUsArea";
import BlogSectionArea from "./home/BlogSectionArea";
import CategoryGender from "./home/CategoryGender";
import FeatureSectionPage from "./home/FeatureSection";
import FooterPage from "./home/Footer";
import HowItWorksPage from "./home/HowItWorks";
import NavBar from "./home/NavBar";
import ProductSection2 from "./home/ProductSection2";
import SliderSection from "./home/SliderSection";
import { Suspense } from "react";
import { ProductCardSkeleton } from './home/ProductCardSkeleton';
import BestSellersSection from "./home/BestSellersSection";

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

const ProductSectionSkeleton = () => (
    <div className="shop-section section pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-45 pb-70 pb-lg-50 pb-md-40 pb-sm-60 pb-xs-50">
        <div className="container">
            <div className="row">
                <div className="col-lg-12 order-lg-2 order-1">
                    <div className="row">
                        <div className="col-12">
                            <div className="shop-banner-title text-center">
                                <h2>SELECT & TRY FROM <br /> OUR BEST SELLERS</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default async function HeroPage() {
    const products = await getProducts();
    const newArrivals = products.filter(p => p.isNewArrival);
    const onSaleProducts = products.filter(p => p.discountPercentage && p.discountPercentage > 0);
    return <>
        <div id="main-wrapper">
            <NavBar />
            <SliderSection />
            <HowItWorksPage />
            <Suspense fallback={<ProductSectionSkeleton />}>
                <BestSellersSection />
            </Suspense>         
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