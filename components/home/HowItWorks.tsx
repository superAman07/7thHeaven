export default function HowItWorksPage() {
    return (
        <div className="section bg-linear-to-br from-gray-50 to-gray-100 py-16 md:py-20 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 md:mb-16">
                    <h2 
                        className="uppercase tracking-wide text-gray-800" 
                        style={{ 
                            fontSize: 'clamp(28px, 5vw, 44px)',
                            fontWeight: 700,
                            fontFamily: '"Cormorant Garamond", serif'
                        }}
                    >
                        Here's How It Works
                    </h2>
                    <div className="w-24 h-1 bg-[#ddb040] mx-auto mt-4"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    <div className="space-y-8">
                        <div className="flex items-start gap-4 group">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#ddb040] group-hover:scale-110">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" 
                                    alt="Pick Scent" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    1. PICK YOUR SIGNATURE SCENT
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Explore hundreds of designer and niche perfumes and discover the fragrance that perfectly matches your mood and personality.
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 ml-8"></div>

                        <div className="flex items-start gap-4 group">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#ddb040] group-hover:scale-110">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/833/833524.png" 
                                    alt="Choose Bottle" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    2. CHOOSE YOUR BOTTLE & SIZE
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Pick from sleek travel sprays, sample sizes, or premium bottles—customized to suit your fragrance journey.
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 ml-8"></div>

                        <div className="flex items-start gap-4 group">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#ddb040] group-hover:scale-110">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/992/992651.png" 
                                    alt="Try Switch Refill" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    3. TRY, SWITCH OR REFILL
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Not the perfect match? Try a new scent, upgrade to a full-size bottle, or simply refill your favourites anytime.
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 ml-8"></div>

                        <div className="flex items-start gap-4 group">
                            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#ddb040] group-hover:scale-110">
                                <img 
                                    src="https://cdn-icons-png.flaticon.com/512/1827/1827504.png" 
                                    alt="Build Collection" 
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                                    4. BUILD YOUR FRAGRANCE COLLECTION
                                </h4>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    Create your personal perfume lineup—mix fresh finds with timeless classics and expand your scent wardrobe effortlessly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-t-4 border-[#ddb040] mt-8 lg:mt-0">
                        <div className="absolute -top-6 left-8 text-[#ddb040] text-6xl sm:text-7xl md:text-8xl font-serif leading-none">
                            "
                        </div>
                        <blockquote className="relative z-10 mt-6 sm:mt-8">
                            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-snug sm:leading-tight italic">
                                You wouldn't buy a car without a test drive—so why choose a perfume without experiencing it first?
                            </p>
                        </blockquote>
                        <div className="text-right text-[#ddb040] text-6xl sm:text-7xl md:text-8xl font-serif leading-none mt-4">
                            "
                        </div>

                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#ddb040] opacity-10 rounded-tl-full"></div>
                    </div>
                </div>

                <div className="text-center mt-12 md:mt-16">
                    <a 
                        href="/collections/perfumes" 
                        className="inline-block bg-[#ddb040] text-white font-semibold text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 shadow-lg hover:bg-[#25252b] transition-all duration-300 hover:scale-105"
                    >
                        Start Your Journey
                    </a>
                </div>
            </div>
        </div>
    );
}


// export default function HowItWorksPage() {
//     return <>
//         <div className="cta-section section bg-image pt-90 pt-lg-70 pt-md-60 pt-sm-50 pt-xs-40 pb-100 pb-lg-80 pb-md-70 pb-sm-60 pb-xs-40" data-bg="assets/images/bg/cta-bg.jpg">
//             <div className="container py-5">
//                 <div className="row">
//                     <div className="col-12">
//                         <div className="shop-banner-title text-center">
//                             <h2>Here's How It Works </h2>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="row">
//                     <div className="col-12 col-md-6">
//                         <div className="step-block d-flex">
//                             <img src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png" alt="" className="me-3" />
//                             <div>
//                                 <h4 className="fw-bold">1. PICK YOUR SIGNATURE SCENT</h4>
//                                 <p className="mb-0">Explore hundreds of designer and niche perfumes and discover the fragrance that perfectly matches your mood and personality.</p>
//                             </div>
//                         </div>
//                         <div className="divider-line"></div>

//                         <div className="step-block d-flex">
//                             <img src="https://cdn-icons-png.flaticon.com/512/833/833524.png" alt="" className="me-3" />
//                             <div>
//                                 <h4 className="fw-bold">2. CHOOSE YOUR BOTTLE & SIZE</h4>
//                                 <p className="mb-0">Pick from sleek travel sprays, sample sizes, or premium bottles—customized to suit your fragrance journey.</p>
//                             </div>
//                         </div>
//                         <div className="divider-line"></div>

//                         <div className="step-block d-flex">
//                             <img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" alt="" className="me-3" />
//                             <div>
//                                 <h4 className="fw-bold">3. TRY, SWITCH OR REFILL</h4>
//                                 <p className="mb-0">Not the perfect match? Try a new scent, upgrade to a full-size bottle, or simply refill your favourites anytime.</p>
//                             </div>
//                         </div>
//                         <div className="divider-line"></div>

//                         <div className="step-block d-flex">
//                             <img src="https://cdn-icons-png.flaticon.com/512/1827/1827504.png" alt="" className="me-3" />
//                             <div>
//                                 <h4 className="fw-bold">4. BUILD YOUR FRAGRANCE COLLECTION</h4>
//                                 <p className="mb-0">Create your personal perfume lineup—mix fresh finds with timeless classics and expand your scent wardrobe effortlessly.</p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="col-12 col-md-6 ps-md-5 mt-5 mt-md-0">
//                         <div className="quote-mark">“</div>
//                         <h1 className="quote-text">You wouldn’t buy a car without a test drive—so why choose a perfume without experiencing it first?</h1>
//                         <div className="quote-mark text-end">”</div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </>
// }