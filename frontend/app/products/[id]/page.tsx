import { Metadata } from "next";
import ProductDetails from "./components/ProductDetails";

export const metadata: Metadata = {
  title: "Products & Price List | Parwan Roster UAE",
  description:
    "Browse nuts, dried fruits, spices, seeds, lentils, candies and specialty chocolate from Parwan Roster L.L.C. S.P.C. View listed prices and contact us for availability and orders.",
};

const ProductDetailsPage = () => {
  return (
    <>
      <ProductDetails />
    </>
  );
};

export default ProductDetailsPage;
