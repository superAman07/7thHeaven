'use client'

import React, { useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

type Post = {
  id: string;
  title: string;
  image: string;
  day?: string;
  month?: string;
  excerpt?: string;
  link?: string;
};

type Props = {
  posts?: Post[];
};

const defaultPosts: Post[] = [
  {
    id: "b1",
    title: "LUXURY AROMA FOR MODERN SOUL",
    image: "assets/images/product/bwebp.webp",
    day: "20",
    month: "Jul",
    excerpt:
      "A warm blend of rose, cinnamon, and spices creates a luxurious, long-lasting fragrance that adds elegance and elevates your personality instantly.",
    link: "#",
  },
  {
    id: "b2",
    title: "LUXURY AROMA FOR MODERN SOUL",
    image: "assets/images/product/b.png",
    day: "09",
    month: "March",
    excerpt:
      "A warm blend of rose, cinnamon, and spices creates a luxurious, long-lasting fragrance that adds elegance and elevates your personality instantly.",
    link: "#",
  },
  {
    id: "b3",
    title: "LUXURY AROMA FOR MODERN SOUL",
    image: "assets/images/banner/h1-banner-1..jpg",
    day: "15",
    month: "May",
    excerpt:
      "A warm blend of rose, cinnamon, and spices creates a luxurious, long-lasting fragrance that adds elegance and elevates your personality instantly.",
    link: "#",
  },
  {
    id: "b4",
    title: "LUXURY AROMA FOR MODERN SOUL",
    image: "assets/images/product/o.webp",
    day: "13",
    month: "Oct",
    excerpt:
      "A warm blend of rose, cinnamon, and spices creates a luxurious, long-lasting fragrance that adds elegance and elevates your personality instantly.",
    link: "#",
  },
];

export default function BlogSectionArea({ posts = defaultPosts }: Props) {
  // react-slick settings — ARROWS are disabled to remove left/right buttons and the console warning
  const settings = useMemo(
    () => ({
      slidesToShow: 3,
      slidesToScroll: 1,
      infinite: true,
      arrows: false, // <--- removed arrows & icons as requested
      dots: false,
      responsive: [
        { breakpoint: 1199, settings: { slidesToShow: 3 } },
        { breakpoint: 992, settings: { slidesToShow: 2 } },
        { breakpoint: 768, settings: { slidesToShow: 2, arrows: false, autoplay: true } },
        { breakpoint: 575, settings: { slidesToShow: 1, arrows: false, autoplay: true } },
      ],
      speed: 800,
      adaptiveHeight: false,
      accessibility: true,
    }),
    []
  );

  const renderPost = (post: Post) => (
    <div key={post.id} className="blog col">
      <div className="blog-inner">
        <div className="media">
          <a href={post.link ?? "#"} className="image">
            <img
              src={post.image}
              alt={post.title}
              style={{ width: "100%", height: 250, objectFit: "cover", display: "block" }}
            />
          </a>
        </div>

        <div className="content">
          <h3 className="title">
            <a href={post.link ?? "#"}>{post.title}</a>
          </h3>

          <ul className="meta">
            <li>
              <i className="fa fa-calendar" />
              <span className="date-time">
                <span className="date">{post.day ?? ""}</span>
                <span className="separator">-</span>
                <span className="month">{post.month ?? ""}</span>
              </span>
            </li>
          </ul>

          <p>{post.excerpt}</p>
          <a className="readmore" href={post.link ?? "#"}>
            Read more
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="blog-section section bg-gray pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-75 pb-lg-55 pb-md-45 pb-sm-35 pb-xs-30">
      <div className="container">
        <div className="row">
          {/* Section Title */}
          <div className="col">
            <div className="section-title mb-40 mb-xs-20 text-center">
              <h2>From the blog</h2>
            </div>
          </div>
        </div>

        {/* Slider wrapper keeps original className so styles target correctly */}
        <div className="blog-slider tf-element-carousel" data-slick-options>
          <Slider {...settings}>
            {posts.map(renderPost)}
          </Slider>
        </div>
      </div>
    </div>
  );
}
