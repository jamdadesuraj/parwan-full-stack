import { Metadata } from "next";
import React from "react";
import Faq from "./components/Faq";

export const metadata: Metadata = {
  title: "Freqently Asked Questions",
  description: "faq",
};

const FaqPage = () => {
  return (
    <>
      <Faq />
    </>
  );
};

export default FaqPage;
