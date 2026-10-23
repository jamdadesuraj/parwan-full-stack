import { Metadata } from "next";
import React from "react";
import ContactUs from "./components/ContactUs";

export const metadata: Metadata = {
  title: "Contact Parwan Roster L.L.C. S.P.C. | UAE",
  description:
    "Contact Parwan Roster L.L.C. S.P.C. for product inquiries, pricing, availability and ordering information for nuts, seeds, spices and other food products.",
};

const ContactUsPage = () => {
  return (
    <>
      <ContactUs />
    </>
  );
};

export default ContactUsPage;
