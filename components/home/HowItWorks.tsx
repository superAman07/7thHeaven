export default function HowItWorksPage() {
  return (
    <div className="section bg-[#fcfaf7] py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="uppercase tracking-wide text-gray-800"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            Here's How It Works
          </h2>
          <div className="gold-separator"> </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            {/* Step 1: Branding Update */}
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#E6B422] group-hover:scale-110">
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
                  Discover our signature <strong> Celsius collection </strong>.
                  Find the long-lasting fragrance that defines your personality.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-300 ml-8"> </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#E6B422] group-hover:scale-110">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/833/833524.png"
                  alt="Choose Bottle"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  2. CHOOSE YOUR SIZE
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Pick from premium full - size bottles or travel
                  packs—customized to suit your luxury fragrance journey.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-300 ml-8"> </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#E6B422] group-hover:scale-110">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
                  alt="Earn Rewards"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  3. EARN WHILE YOU SHOP
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Join the 7th Heaven Club.Build your network and unlock
                  exclusive rewards with every purchase.
                </p>
              </div>
            </div>
            <div className="border-t border-gray-300 ml-8"> </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4 group">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-300 group-hover:bg-[#E6B422] group-hover:scale-110">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1827/1827504.png"
                  alt="Build Collection"
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  4. BUILD YOUR COLLECTION
                </h4>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Create your personal Celsius lineup—luxury scents made with
                  the world's best oils.
                </p>
              </div>
            </div>
          </div>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border-t-4 border-[#E6B422] mt-8 lg:mt-0">
            <div className="absolute -top-6 left-8 text-[#E6B422] text-6xl sm:text-7xl md:text-8xl font-serif leading-none">
              "
            </div>
            <blockquote className="relative z-10 mt-6 sm:mt-8">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-snug sm:leading-tight italic">
                You wouldn't buy a car without a test drive—so why choose a
                perfume without experiencing it first?
              </p>
            </blockquote>
            <div className="text-right text-[#E6B422] text-6xl sm:text-7xl md:text-8xl font-serif leading-none mt-4">
              "
            </div>

            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#E6B422] opacity-10 rounded-tl-full">
              {" "}
            </div>
          </div>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <a
            href="/collections/perfumes"
            className="inline-block btn-gold-sasva text-white font-semibold text-base sm:text-lg px-8 py-3 sm:px-10 sm:py-4 shadow-lg transition-all duration-300 hover:scale-105"
          >
            Start Your Journey
          </a>
        </div>
      </div>
    </div>
  );
}
