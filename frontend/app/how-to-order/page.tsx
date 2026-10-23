import { Metadata } from "next";
import React from "react";
import HowToOrder from "./components/HowToOrder";

export const metadata: Metadata = {
  title: "How It Works",
  description: "how it works",
};

const HowItWorksPage = () => {
  return (
    <>
      <HowToOrder />
    </>
  );
};

export default HowItWorksPage;
