/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { Suspense, useMemo, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  BadgeCheck,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { BsShop, BsWhatsapp } from "react-icons/bs";

import ThemeBtnOne from "@/app/components/ThemeBtnOne";
import InquiryModel from "@/app/components/InquiryModel";
import {
  ICategory,
  ICategoryRef,
  ILocalizedText,
  IProduct,
  useGetProductCategoriesQuery,
  useGetProductsListQuery,
} from "@/store/productsApi";
import { useGetSettingsQuery } from "@/store/settingApi";
import Filter, { FilterCategory } from "./Filter";

type Lang = keyof ILocalizedText;

const PAGE_SIZE = 10;
const FALLBACK_WHATSAPP = "971508221435";

/* ---------- Static, translated UI text ---------- */

const UI = {
  shopLabel: { en: "Shop Name:", ar: "اسم المتجر:" },
  shopName: { en: "Parwan Roastery Abu Dhabi", ar: "محمصة بروان أبوظبي" },
  address: {
    en: "Shop 4, Building Al Danah, Sector E10, Plot 64, Abu Dhabi, UAE",
    ar: "محل 4، مبنى الدانة، قطاع E10، قطعة 64، أبوظبي، الإمارات العربية المتحدة",
  },
  reviews: { en: "reviews", ar: "تقييمات" },
  minOrder: { en: "Min. order", ar: "الحد الأدنى للطلب" },
  off: { en: "off", ar: "خصم" },
  whatsapp: { en: "Chat on WhatsApp", ar: "تحدث معنا عبر واتساب" },
  results: { en: "products found", ar: "منتج" },
  empty: {
    en: "No products match your search.",
    ar: "لا توجد منتجات مطابقة لبحثك.",
  },
  clear: { en: "Clear filters", ar: "مسح التصفية" },
  error: { en: "We couldn't load the products.", ar: "تعذر تحميل المنتجات." },
  retry: { en: "Try again", ar: "إعادة المحاولة" },
  prev: { en: "Previous", ar: "السابق" },
  next: { en: "Next", ar: "التالي" },
  pagination: { en: "Pagination", ar: "التنقل بين الصفحات" },
  page: { en: "Page", ar: "صفحة" },
  currency: { en: "AED", ar: "د.إ" },
} satisfies Record<string, ILocalizedText>;

const UNITS: Record<string, ILocalizedText> = {
  kg: { en: "kg", ar: "كجم" },
  gm: { en: "gm", ar: "جم" },
  g: { en: "g", ar: "جم" },
  pack: { en: "pack", ar: "عبوة" },
  piece: { en: "piece", ar: "قطعة" },
};

/* ---------- Language detection (reads <html lang/dir>) ---------- */

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang", "dir"],
  });
  return () => observer.disconnect();
};

const getLang = (): Lang => {
  const { lang, dir } = document.documentElement;
  return lang.toLowerCase().startsWith("ar") || dir === "rtl" ? "ar" : "en";
};

const useCurrentLang = (): Lang =>
  useSyncExternalStore(subscribe, getLang, () => "en" as Lang);

/** Text for `lang`, falling back to English, then empty string. */
const t = (text: ILocalizedText | undefined, lang: Lang): string =>
  text?.[lang] || text?.en || "";

/* ---------- Helpers ---------- */

const formatPrice = (n: number) => Number(n.toFixed(2)).toString();

const money = (n: number, lang: Lang) =>
  lang === "ar"
    ? `${formatPrice(n)} ${UI.currency.ar}`
    : `${UI.currency.en} ${formatPrice(n)}`;

const unitLabel = (unit: string | undefined, lang: Lang) => {
  if (!unit) return "";
  const u = UNITS[unit.toLowerCase()];
  return u ? t(u, lang) : unit;
};

/** A category name can be a plain string or a localized { en, ar } object. */
const nameOf = (n: string | ILocalizedText | undefined, lang: Lang): string =>
  !n ? "" : typeof n === "string" ? n : t(n, lang);

const productCategoryLabel = (c: ICategoryRef | undefined, lang: Lang) =>
  !c || typeof c === "string" ? "" : nameOf(c.categoryName ?? c.name, lang);

/** Product's category id, whether `category` is a string id or a populated object. */
const categoryIdOf = (c: ICategoryRef | undefined): string =>
  !c ? "" : typeof c === "string" ? c : ((c as { _id?: string })._id ?? "");

const waLink = (value: string, text?: string) =>
  /^https?:\/\//i.test(value)
    ? value
    : `https://wa.me/${value.replace(/\D/g, "")}${
        text ? `?text=${encodeURIComponent(text)}` : ""
      }`;

const getDiscount = (p: IProduct) => {
  if (p.discountPercent && p.discountPercent > 0)
    return Math.round(p.discountPercent);
  if (p.delPrice && p.delPrice > p.price) {
    return Math.round(((p.delPrice - p.price) / p.delPrice) * 100);
  }
  return 0;
};

/** 1 … 4 5 6 … 20 */
const pageList = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums = Array.from(
    new Set([1, total, current - 1, current, current + 1]),
  )
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
};

/* ---------- Component ---------- */

const ProductListInner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = useCurrentLang();
  const isRtl = lang === "ar";

  // The URL is the single source of truth for the filters
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "";
  const category = searchParams.get("category") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetProductsListQuery({
      search: q,
      category,
      sort,
      page,
      limit: PAGE_SIZE,
    });

  const { data: categoryList } = useGetProductCategoriesQuery();
  const { data: settingsList } = useGetSettingsQuery();
  // @ts-ignore
  const settings = settingsList?.[0];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rawProducts = data?.items ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const hasFilters = !!(q || sort || category);

  // Safety net: if the API ignores `category`, still show only that category
  const products = useMemo(
    () =>
      category
        ? rawProducts.filter((p) => categoryIdOf(p.category) === category)
        : rawProducts,
    [rawProducts, category],
  );

  // If the frontend had to filter, the server total is wrong, so use our count
  const totalCount =
    category && products.length !== rawProducts.length
      ? products.length
      : (meta?.total ?? products.length);

  const categories: FilterCategory[] = useMemo(
    () =>
      (categoryList ?? [])
        .filter((c: ICategory) => !c.isDeleted)
        .map((c: ICategory) => ({
          id: c._id,
          label: nameOf(c.categoryName, lang),
        }))
        .filter((c) => c.label),
    [categoryList, lang],
  );

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p > 1) params.set("page", String(p));
    else params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const address = t(settings?.address, lang) || t(UI.address, lang);
  const whatsappBase = settings?.whatsApp || FALLBACK_WHATSAPP;

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f8faf5] px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <Filter lang={lang} categories={categories} />

        {/* Result count */}
        {meta && !isError && (
          <p className="mt-4 text-xs text-[#666]" aria-live="polite">
            {totalCount} {t(UI.results, lang)}
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="mt-6 space-y-5" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-60 animate-pulse border border-[#e3e8df] bg-white"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#e3e8df] bg-white p-6 text-center">
            <p className="text-sm text-slate-600">{t(UI.error, lang)}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 h-9 rounded-full border border-green-700 px-4 text-xs font-semibold text-green-800 transition hover:bg-green-800 hover:text-white"
            >
              {t(UI.retry, lang)}
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#e3e8df] bg-white p-6 text-center text-sm text-slate-600">
            {t(UI.empty, lang)}
            {hasFilters && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => router.push(pathname)}
                  className="h-9 rounded-full border border-green-700 px-4 text-xs font-semibold text-green-800 transition hover:bg-green-800 hover:text-white"
                >
                  {t(UI.clear, lang)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product list */}
        {products.length > 0 && (
          <div
            className={`mt-4 space-y-5 transition-opacity ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {products.map((product) => {
              const name = t(product.productName, lang);
              const unit = unitLabel(product.unit, lang);
              const categoryName = productCategoryLabel(product.category, lang);
              const discount = getDiscount(product);
              const image = product.images?.[0];
              const href = `/products/${product.slug || product._id}`;
              const filledStars = Math.round(product.rating || 0);
              const hasOldPrice =
                !!product.delPrice && product.delPrice > product.price;

              const waMessage =
                lang === "ar"
                  ? `مرحباً محمصة بروان، أنا مهتم بمنتج: ${name}`
                  : `Hello Parwan Roastery, I'm interested in: ${name}`;

              return (
                <div
                  key={product._id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(href)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") router.push(href);
                  }}
                  className="group block cursor-pointer overflow-hidden border border-[#e3e8df] bg-white transition duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative h-60 w-full shrink-0 overflow-hidden bg-[#f3ece0] sm:h-auto sm:min-h-75 sm:w-56 lg:w-64">
                      {image && (
                        <Image
                          src={image}
                          alt={name}
                          fill
                          sizes="(max-width: 640px) 100vw, 256px"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      {/* Top */}
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          {categoryName ? (
                            <span className="rounded-full bg-[#e7f2dc] px-3 py-1 text-[10px] font-bold text-[#438c35]">
                              {categoryName}
                            </span>
                          ) : (
                            <span />
                          )}

                          {product.minOrderQty ? (
                            <span className="text-sm font-semibold text-black">
                              {t(UI.minOrder, lang)}: {product.minOrderQty}{" "}
                              {unit}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 min-w-0">
                          <h2 className="text-start font-serif text-lg font-bold text-[#252525] transition group-hover:text-[#438c35] sm:text-xl">
                            {name}
                          </h2>

                          {/* Rating */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  fill={
                                    star <= filledStars ? "#F5B83D" : "none"
                                  }
                                  className={
                                    star <= filledStars
                                      ? "text-[#F5B83D]"
                                      : "text-[#D5D5D5]"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-[#444]">
                              {product.rating}
                            </span>
                            <span className="text-xs text-[#999]">
                              ({product.review} {t(UI.reviews, lang)})
                            </span>
                          </div>

                          {/* Short description */}
                          {t(product.shortDesc, lang) && (
                            <p className="mt-2 line-clamp-2 text-start text-xs leading-5 text-[#666]">
                              {t(product.shortDesc, lang)}
                            </p>
                          )}

                          {/* Location */}
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-black">
                            <MapPin
                              size={14}
                              className="shrink-0 text-[#438c35]"
                            />
                            {address}
                          </div>

                          {/* Shop */}
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-black">
                            <BsShop
                              size={14}
                              className="shrink-0 text-[#438c35]"
                            />
                            <span>{t(UI.shopLabel, lang)}</span>
                            <span className="flex items-center gap-1 font-semibold text-[#444]">
                              {t(UI.shopName, lang)}
                              <span className="text-[#aaa]">|</span>
                              <BadgeCheck
                                size={15}
                                strokeWidth={2}
                                className="shrink-0 text-[#438c35]"
                              />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 flex flex-col gap-4 border-t border-[#edf0ea] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Price */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-baseline gap-2">
                            {hasOldPrice && (
                              <span className="text-sm font-medium text-[#a3a3a3] line-through">
                                {money(product.delPrice!, lang)}
                              </span>
                            )}
                            <span className="text-2xl font-extrabold tracking-tight text-[#438c35]">
                              {money(product.price, lang)}
                            </span>
                            {unit && (
                              <span className="text-xs font-medium text-[#888]">
                                /{unit}
                              </span>
                            )}
                          </div>

                          {discount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#e8d9b8] bg-[#fff9ed] px-2.5 py-1 text-[10px] font-bold text-[#b87918]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#d8952b]" />
                              {discount}% {t(UI.off, lang)}
                            </span>
                          )}
                        </div>

                        {/* Buttons */}
                        <div
                          className="flex flex-col gap-2 sm:flex-row"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <InquiryModel
                            productName={name}
                            unit={product.unit}
                          />

                          <ThemeBtnOne
                            text={t(UI.whatsapp, lang)}
                            url={waLink(whatsappBase, waMessage)}
                            icon={<BsWhatsapp size={16} />}
                            className="mt-3 w-full cursor-pointer rounded-full border border-green-700 bg-white px-4 py-3 font-serif text-xs text-black"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            aria-label={t(UI.pagination, lang)}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="flex h-9 items-center gap-1 rounded-full border border-[#dfe5da] bg-white px-3 text-xs font-semibold text-[#444] transition hover:border-[#438c35] hover:text-[#438c35] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} className="rtl:rotate-180" />
              {t(UI.prev, lang)}
            </button>

            {pageList(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-[#999]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-label={`${t(UI.page, lang)} ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() => goToPage(p)}
                  className={`h-9 min-w-9 rounded-full border px-3 text-xs font-bold transition ${
                    p === page
                      ? "border-[#438c35] bg-[#438c35] text-white"
                      : "border-[#dfe5da] bg-white text-[#555] hover:border-[#438c35] hover:text-[#438c35]"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="flex h-9 items-center gap-1 rounded-full border border-[#dfe5da] bg-white px-3 text-xs font-semibold text-[#444] transition hover:border-[#438c35] hover:text-[#438c35] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t(UI.next, lang)}
              <ChevronRight size={14} className="rtl:rotate-180" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};

// useSearchParams needs a Suspense boundary in the App Router
const ProductList = () => (
  <Suspense fallback={null}>
    <ProductListInner />
  </Suspense>
);

export default ProductList;
