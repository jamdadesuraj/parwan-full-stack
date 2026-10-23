"use client";

import { Star, BadgeCheck, Truck, Package } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";

import InquiryModel from "@/app/components/InquiryModel";
import ThemeBtnOne from "@/app/components/ThemeBtnOne";
import type {
  ICategoryRef,
  ILocalizedText,
  IProduct,
} from "@/store/productsApi";
import { useGetSettingsQuery } from "@/store/settingApi";
import { Lang, money, t, unitLabel, useCurrentLang, waLink } from "./i18n";

const UI = {
  reviews: { en: "reviews", ar: "تقييمات" },
  off: { en: "OFF", ar: "خصم" },
  minOrder: { en: "Minimum order", ar: "الحد الأدنى للطلب" },
  bulk: { en: "Bulk pricing available.", ar: "تتوفر أسعار الجملة." },
  whatsapp: { en: "Chat on WhatsApp", ar: "تحدث معنا عبر واتساب" },
  origin: { en: "Origin", ar: "المنشأ" },
  grade: { en: "Grade", ar: "الدرجة" },
  shelfLife: { en: "Shelf Life", ar: "مدة الصلاحية" },
  type: { en: "Type", ar: "النوع" },
};

// Shown only when the product has no "features" of its own
const DEFAULT_TRUST = [
  {
    icon: BadgeCheck,
    text: {
      en: "Premium quality, carefully sourced and tested",
      ar: "جودة ممتازة، يتم اختيارها وفحصها بعناية",
    },
  },
  {
    icon: Package,
    text: {
      en: "Fresh stock, packed to order",
      ar: "مخزون طازج، يُعبأ حسب الطلب",
    },
  },
  {
    icon: Truck,
    text: {
      en: "Fast delivery across the UAE",
      ar: "توصيل سريع في جميع أنحاء الإمارات",
    },
  },
];

const FALLBACK_WHATSAPP = "971508221435";

/** Category name can be a string or a localized { en, ar } object. */
const categoryLabel = (c: ICategoryRef | undefined, lang: Lang): string => {
  if (!c || typeof c === "string") return "";
  const n = c.categoryName ?? c.name;
  if (!n) return "";
  return typeof n === "string" ? n : t(n as ILocalizedText, lang);
};

const ProductInfo = ({ product }: { product: IProduct }) => {
  const lang = useCurrentLang();
  const { data: settingsList } = useGetSettingsQuery();

  const name = t(product.productName, lang);
  const unit = unitLabel(product.unit, lang);
  const category = categoryLabel(product.category, lang);

  const hasOldPrice = !!product.delPrice && product.delPrice > product.price;
  const discount =
    product.discountPercent && product.discountPercent > 0
      ? Math.round(product.discountPercent)
      : hasOldPrice
        ? Math.round(
            ((product.delPrice! - product.price) / product.delPrice!) * 100,
          )
        : 0;

  const filledStars = Math.round(product.rating || 0);

  const highlights = [
    { label: UI.origin, value: t(product.origin, lang) },
    { label: UI.grade, value: t(product.grade, lang) },
    { label: UI.shelfLife, value: t(product.shelfLife, lang) },
    { label: UI.type, value: t(product.type, lang) },
  ].filter((h) => h.value);

  const features = (product.features ?? [])
    .map((f) => t(f, lang))
    .filter(Boolean);

  const waMessage =
    lang === "ar"
      ? `مرحباً محمصة بروان، أنا مهتم بمنتج: ${name}`
      : `Hello Parwan Roastery, I'm interested in: ${name}`;
  const whatsappUrl = waLink(
    settingsList?.whatsApp || FALLBACK_WHATSAPP,
    waMessage,
  );

  return (
    <div className="min-w-0">
      {category && (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-green-800">
          {category}
        </span>
      )}

      <h1 className="mt-3 text-start font-serif text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
        {name}
      </h1>

      <div className="mt-3 flex items-center gap-1 text-sm">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < filledStars
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
        <span className="ms-1 font-semibold text-slate-800">
          {product.rating}
        </span>
        <span className="text-slate-400">
          ({product.review} {t(UI.reviews, lang)})
        </span>
      </div>

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2 font-serif">
        <span className="text-3xl font-bold text-slate-900">
          {money(product.price, lang)}
          {unit && (
            <span className="ms-1 text-sm font-semibold text-slate-500">
              /{unit}
            </span>
          )}
        </span>
        {hasOldPrice && (
          <span className="text-sm text-slate-400 line-through">
            {money(product.delPrice!, lang)}
          </span>
        )}
        {discount > 0 && (
          <span className="rounded bg-green-600 px-2 py-0.5 text-xs text-white">
            {discount}% {t(UI.off, lang)}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {product.minOrderQty ? (
          <>
            {t(UI.minOrder, lang)}:{" "}
            <span className="font-semibold text-slate-800">
              {product.minOrderQty} {unit}
            </span>
            .{" "}
          </>
        ) : null}
        {t(UI.bulk, lang)}
      </p>

      {t(product.shortDesc, lang) && (
        <p className="mt-5 text-start text-sm leading-7 text-slate-600">
          {t(product.shortDesc, lang)}
        </p>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-3">
          {highlights.map((h) => (
            <div
              key={h.label.en}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {t(h.label, lang)}
              </dt>
              <dd className="mt-1 font-serif text-sm font-bold text-slate-900">
                {h.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Features from the API, or default trust points */}
      <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
        {features.length > 0
          ? features.map((f, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <BadgeCheck className="h-4 w-4 shrink-0 text-green-700" />
                {f}
              </li>
            ))
          : DEFAULT_TRUST.map(({ icon: Icon, text }) => (
              <li key={text.en} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-green-700" />
                {t(text, lang)}
              </li>
            ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <InquiryModel />

        <ThemeBtnOne
          text={t(UI.whatsapp, lang)}
          url={whatsappUrl}
          icon={<BsWhatsapp size={16} />}
          className="mt-3 cursor-pointer rounded-full border border-green-700 bg-white px-4 py-3 font-serif text-xs text-black"
        />
      </div>
    </div>
  );
};

export default ProductInfo;
