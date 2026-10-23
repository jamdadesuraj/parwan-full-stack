import { Metadata } from "next";
import Privacy from "./components/Privacy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "privacy policy",
};

const PolicyPage = () => {
  return (
    <>
      <Privacy />
    </>
  );
};

export default PolicyPage;
