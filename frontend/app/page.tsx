import React from "react";
import HeroBanner from "./pages/hero/HeroBanner";
import Counter from "./pages/hero/Counter";
import Category from "./pages/hero/Category";
import WhyChooseUs from "./pages/hero/WhyChooseUs";
import FeaturedProducts from "./pages/hero/FeaturedProducts";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parwan Roster UAE | Nuts, Seeds, Spices & More",
  description:
    "Discover a selection of nuts, seeds, spices, dried fruits, lentils, candies and specialty chocolate from Parwan Roster L.L.C. S.P.C. Contact us for product details and orders.",
};

const Homepage = () => {
  return (
    <>
      <HeroBanner />
      <Counter />
      <Category />
      <FeaturedProducts />
      <WhyChooseUs />
    </>
  );
};

export default Homepage;
