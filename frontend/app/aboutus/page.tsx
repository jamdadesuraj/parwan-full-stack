import { Metadata } from "next";
import React from "react";
import AboutUs from "./components/AboutUs";
import Mission from "./components/Mission";
import WhyChoose from "./components/WhyChoose";

export const metadata: Metadata = {
  title: "About Parwan Roster L.L.C. S.P.C. | UAE",
  description:
    "Learn about Parwan Roster L.L.C. S.P.C. and explore our range of nuts, seeds, spices, dried fruits, lentils, candies and specialty chocolate.",
};

const AboutUsPage = () => {
  return (
    <>
      <AboutUs />
      <Mission />
      <WhyChoose />
    </>
  );
};

export default AboutUsPage;
