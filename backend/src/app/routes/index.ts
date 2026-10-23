import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";

import { generalSettingsRouter } from "../modules/general-settings/general-settings.routes";
import { homeBannerRouter } from "../modules/homeBanner/homeBanner.route";
import { aboutUsRouter } from "../modules/aboutUs/about.route";
import { counterRouter } from "../modules/counter/counter.route";

import { faqRouter } from "../modules/faq/faq.route";

import { privacyPolicyRouter } from "../modules/privacypolicy/privacypolicy.route";
import { termsRouter } from "../modules/terms/terms.route";

import { contactRouter } from "../modules/contacts/contacts.route";

import { productsRouter } from "../modules/products/product.router";
import { seoPagesRouter } from "../modules/seo-pages/seoPages.route";
import { categoriesRouter } from "../modules/categories/categories.route";
import { whyChooseUsRouter } from "../modules/whyUs/whyUs.route";
import { howToOrderRouter } from "../modules/howToOrder/howToOrders.route";
import { enquiryRouter } from "../modules/enquiryForm/enquiryForm.route";
import { adminAuthRouter } from "../modules/admin/adminRoute";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: adminAuthRouter,
  },
  {
    path: "/admin-auth",
    route: adminAuthRouter,
  },

  {
    path: "/home-banner",
    route: homeBannerRouter,
  },
  {
    path: "/counter",
    route: counterRouter,
  },
  {
    path: "/categories",
    route: categoriesRouter,
  },
  {
    path: "/products",
    route: productsRouter,
  },
  {
    path: "/why-choose-us",
    route: whyChooseUsRouter,
  },
  {
    path: "/about-us",
    route: aboutUsRouter,
  },

  {
    path: "/enquiries-contacts",
    route: contactRouter,
  },
  {
    path: "/enquiries",
    route: enquiryRouter,
  },

  {
    path: "/faq",
    route: faqRouter,
  },

  {
    path: "/privacy-policy",
    route: privacyPolicyRouter,
  },
  {
    path: "/terms-and-conditions",
    route: termsRouter,
  },
  {
    path: "/how-to-order",
    route: howToOrderRouter,
  },

  {
    path: "/seo-pages",
    route: seoPagesRouter,
  },
  {
    path: "/settings",
    route: generalSettingsRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
