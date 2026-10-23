"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const general_settings_routes_1 = require("../modules/general-settings/general-settings.routes");
const homeBanner_route_1 = require("../modules/homeBanner/homeBanner.route");
const about_route_1 = require("../modules/aboutUs/about.route");
const counter_route_1 = require("../modules/counter/counter.route");
const faq_route_1 = require("../modules/faq/faq.route");
const privacypolicy_route_1 = require("../modules/privacypolicy/privacypolicy.route");
const terms_route_1 = require("../modules/terms/terms.route");
const contacts_route_1 = require("../modules/contacts/contacts.route");
const product_router_1 = require("../modules/products/product.router");
const seoPages_route_1 = require("../modules/seo-pages/seoPages.route");
const categories_route_1 = require("../modules/categories/categories.route");
const whyUs_route_1 = require("../modules/whyUs/whyUs.route");
const howToOrders_route_1 = require("../modules/howToOrder/howToOrders.route");
const enquiryForm_route_1 = require("../modules/enquiryForm/enquiryForm.route");
const adminRoute_1 = require("../modules/admin/adminRoute");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: adminRoute_1.adminAuthRouter,
    },
    {
        path: "/admin-auth",
        route: adminRoute_1.adminAuthRouter,
    },
    {
        path: "/home-banner",
        route: homeBanner_route_1.homeBannerRouter,
    },
    {
        path: "/counter",
        route: counter_route_1.counterRouter,
    },
    {
        path: "/categories",
        route: categories_route_1.categoriesRouter,
    },
    {
        path: "/products",
        route: product_router_1.productsRouter,
    },
    {
        path: "/why-choose-us",
        route: whyUs_route_1.whyChooseUsRouter,
    },
    {
        path: "/about-us",
        route: about_route_1.aboutUsRouter,
    },
    {
        path: "/enquiries-contacts",
        route: contacts_route_1.contactRouter,
    },
    {
        path: "/enquiries",
        route: enquiryForm_route_1.enquiryRouter,
    },
    {
        path: "/faq",
        route: faq_route_1.faqRouter,
    },
    {
        path: "/privacy-policy",
        route: privacypolicy_route_1.privacyPolicyRouter,
    },
    {
        path: "/terms-and-conditions",
        route: terms_route_1.termsRouter,
    },
    {
        path: "/how-to-order",
        route: howToOrders_route_1.howToOrderRouter,
    },
    {
        path: "/seo-pages",
        route: seoPages_route_1.seoPagesRouter,
    },
    {
        path: "/settings",
        route: general_settings_routes_1.generalSettingsRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
