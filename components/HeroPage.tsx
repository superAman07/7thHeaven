import HowItWorksPage from "./home/HowItWorks";
import NavBar from "./home/NavBar";
import ProductSectionPage from "./home/ProductSection";
import SliderSection from "./home/SliderSection";

export default function HeroPage() {
    return <>
        <div id="main-wrapper">
            <NavBar />
            <SliderSection/>
            <HowItWorksPage/>
            <ProductSectionPage />
        </div>
    </>
}