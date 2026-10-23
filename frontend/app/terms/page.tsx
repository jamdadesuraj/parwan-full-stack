import { Metadata } from "next";
import TermsConditions from "./components/TermsConditions";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "terms and conditions",
};

const TermsConditionsPage = () => {
  return (
    <>
      <TermsConditions />
    </>
  );
};

export default TermsConditionsPage;
