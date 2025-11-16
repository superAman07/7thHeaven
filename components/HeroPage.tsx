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
import { ProductSection2Skeleton } from "./home/ProductSection2Skeleton";
import TabbedProductsSection from "./home/TabbedProductsSection";

export type PublicProduct = {
    id: string;
    name: string;
    images: string[];
    isNewArrival: boolean;
    discountPercentage: number | null;
    variants: { price: number }[];
    category: { slug: string };
};

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
    return <>
        <div id="main-wrapper">
            <NavBar />
            <SliderSection />
            <HowItWorksPage />
            <Suspense fallback={<ProductSectionSkeleton />}>
                <BestSellersSection />
            </Suspense>         
            <CategoryGender />
            <Suspense fallback={<ProductSection2Skeleton />}>
                <TabbedProductsSection />
            </Suspense>
            <AboutUsAreaSection />
            <BlogSectionArea />
            <FeatureSectionPage />
            <FooterPage />
        </div>
    </>
}