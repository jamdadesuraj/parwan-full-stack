import { Metadata } from "next";
import React from "react";
import Categories from "./components/Categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Categories",
};

const CategoriesPage = () => {
  return (
    <>
      <Categories />
    </>
  );
};

export default CategoriesPage;
