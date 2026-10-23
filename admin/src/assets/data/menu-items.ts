
import { MenuItemType } from "@/types/menu";

export const MENU_ITEMS: MenuItemType[] = [
  // GENERAL
  {
    key: "general",
    label: "GENERAL",
    isTitle: true,
  },
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "solar:widget-5-bold-duotone",
    url: "/dashboard",
  },

  // ENQUIRIES
  {
    key: "enquires",
    label: "ENQUIRIES",
    isTitle: true,
  },
  {
    key: "contact-enquires",
    label: "Contact Enquiries",
    icon: "solar:letter-bold-duotone",
    url: "/contact-enquires",
  },
  {
    key: "store-enquires",
    label: "Product Enquiries",
    icon: "solar:chat-round-dots-bold-duotone",
    url: "/product-enquires",
  },

  // PRODUCTS
  {
    key: "products",
    label: "PRODUCTS",
    isTitle: true,
  },
  {
    key: "categories",
    label: "Categories",
    icon: "solar:widget-3-bold-duotone",
    url: "/categories",
  },
  {
    key: "products-list",
    label: "Products List",
    icon: "solar:box-bold-duotone",
    url: "/products",
  },

  // WEB PAGES
  {
    key: "web-pages",
    label: "WEB PAGES",
    isTitle: true,
  },
  {
    key: "homeBanner",
    label: "Home Banner",
    icon: "solar:gallery-bold-duotone",
    url: "/home-banner",
  },
  {
    key: "counter",
    label: "Counter",
    icon: "solar:chart-2-bold-duotone",
    url: "/counter",
  },
  {
    key: "why-choose-us",
    label: "Why Choose Us",
    icon: "solar:medal-star-bold-duotone",
    url: "/why-choose-us",
  },
  {
    key: "how-to-order",
    label: "How To Order",
    icon: "solar:cart-large-2-bold-duotone",
    url: "/how-to-order",
  },
  {
    key: "aboutUs",
    label: "About Us",
    icon: "solar:info-circle-bold-duotone",
    url: "/about-us",
  },
  {
    key: "faq",
    label: "FAQ",
    icon: "solar:question-circle-bold-duotone",
    url: "/faq",
  },
  {
    key: "privacy-policy",
    label: "Privacy Policy",
    icon: "solar:shield-check-bold-duotone",
    url: "/privacy-policy",
  },
  {
    key: "terms-and-conditions",
    label: "Terms and Conditions",
    icon: "solar:document-text-bold-duotone",
    url: "/terms-and-conditions",
  },

  // GENERAL SETTINGS
  {
    key: "general-settings",
    label: "GENERAL SETTINGS",
    isTitle: true,
  },
  {
    key: "settings",
    label: "General Settings",
    icon: "solar:settings-bold-duotone",
    url: "/settings",
  },
  {
    key: "user-settings",
    label: "User Settings",
    icon: "solar:user-circle-bold-duotone",
    url: "/user-settings",
  },
];
