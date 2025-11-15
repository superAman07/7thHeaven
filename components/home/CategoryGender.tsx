import React from "react";

const defaultCategories = [
  {
    id: "c1",
    title: "UNISEX",
    image: "assets/images/product/unisex.webp",
    link: "#",
    height: "400px",
  },
  {
    id: "c2",
    title: "WOMEN",
    image: "assets/images/product/women.webp",
    link: "#",
    height: "400px",
  },
  {
    id: "c3",
    title: "MEN",
    image: "assets/images/product/Sovaze_graphic_v3.webp",
    link: "#",
    height: "400px",
  },
];

export default function CategoryGender({ categories = defaultCategories }) {
  return (
    <>
      <div className="categorie-product-section section">
        <div className="container pl-0 pr-0">
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
