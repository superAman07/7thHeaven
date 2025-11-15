import AboutUsAreaSection from "./home/AboutUsArea";
import BlogSectionArea from "./home/BlogSectionArea";
import CategoryGender from "./home/CategoryGender";
import FeatureSectionPage from "./home/FeatureSection";
import HowItWorksPage from "./home/HowItWorks";
import NavBar from "./home/NavBar";
import ProductSectionPage from "./home/ProductSection";
import ProductSection2 from "./home/ProductSection2";
import SliderSection from "./home/SliderSection";

export default function HeroPage() {
    return <>
        <div id="main-wrapper">
            <NavBar />
            <SliderSection/>
            <HowItWorksPage/>
            <ProductSectionPage />
            <CategoryGender/>
            <ProductSection2/>
            <AboutUsAreaSection/>
            <BlogSectionArea/>
            <FeatureSectionPage/>
        </div>
    </>
}