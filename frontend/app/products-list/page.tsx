import { Suspense } from "react";
import { Metadata } from "next";
import ProductList from "./components/ProductList";

export const metadata: Metadata = {
  title: "Products & Price List | Parwan Roster UAE",
  description:
    "Browse nuts, dried fruits, spices, seeds, lentils, candies and specialty chocolate from Parwan Roster L.L.C. S.P.C. View listed prices and contact us for availability and orders.",
};

const ProductListPage = () => {
  return (
    <Suspense fallback={null}>
      <ProductList />
    </Suspense>
  );
};

export default ProductListPage;
