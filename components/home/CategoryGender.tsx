import React from "react";

const defaultCategories = [
  {
    id: "c1",
    title: "UNISEX",
    image: "assets/images/product/unisex.webp",
    link: "/collections/perfumes?gender=Unisex",
    height: "400px",
  },
  {
    id: "c2",
    title: "WOMEN",
    image: "assets/images/product/women.webp",
    link: "/collections/perfumes?gender=Female",
    height: "400px",
  },
  {
    id: "c3",
    title: "MEN",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    link: "/collections/perfumes?gender=Male",
    height: "400px",
  },
];

export default function CategoryGender({ categories = defaultCategories }) {
  return (
    <>
      <div className="categorie-product-section section pt-60">
        <div className="container pl-0 pr-0">
        <div className="text-center mb-10">
            <h2 
                className="uppercase tracking-wide text-gray-800" 
                style={{ 
                    fontSize: 'clamp(28px, 5vw, 44px)',
                    fontWeight: 700,
                    fontFamily: '"Cormorant Garamond", serif'
                }}
            >
                Find Your Scent By Gender
            </h2>
            <div className="w-24 h-1 bg-[#ddb040] mx-auto mt-4"></div>
        </div>
          <div className="row g-0">
            {categories.map((cat) => (
              <div key={cat.id} className="col-lg-4 col-md-4">
                <div className="single-categorie">
                  <div className="categorie-image">
                    <a href={cat.link}>
                      <img
                        src={cat.image}
                        alt={cat.title}
                        style={{ height: cat.height }}
                      />
                    </a>
                  </div>

                  <div className="categorie-content">
                    <h1 style={{ color: "#ffffff" }}>{cat.title}</h1>
                    <a className="btn" href={cat.link}>
                      Shop now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
