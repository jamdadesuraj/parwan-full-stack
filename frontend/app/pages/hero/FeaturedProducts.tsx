"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import InquiryModel from "@/app/components/InquiryModel";
import { useRouter } from "next/navigation";
import { ILocalizedText, IProduct, useGetProductsQuery } from "@/store/productsApi";

type Lang = keyof ILocalizedText;

const MAX_FEATURED = 10;

/* ---------- Static, translated UI text ---------- */

const UI = {
  title: {
    en: "Discover Our Featured Products",
    ar: "اكتشف منتجاتنا المميزة",
  },
  viewAll: { en: "View All Products", ar: "عرض جميع المنتجات" },
  off: { en: "OFF", ar: "خصم" },
  sliderLabel: { en: "Product slider pages", ar: "صفحات شريط المنتجات" },
  goTo: { en: "Go to slide", ar: "انتقل إلى الشريحة" },
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

// Avoid long decimals like 4.670000000000002
const formatPrice = (n: number) => Number(n.toFixed(2)).toString();

const money = (n: number, lang: Lang) =>
  lang === "ar"
    ? `${formatPrice(n)} ${t(UI.currency, lang)}`
    : `${t(UI.currency, lang)} ${formatPrice(n)}`;

const unitLabel = (unit: string, lang: Lang) =>
  UNITS[unit?.toLowerCase()] ? t(UNITS[unit.toLowerCase()], lang) : unit;

const getDiscount = (p: IProduct) => {
  if (p.discountPercent && p.discountPercent > 0) return Math.round(p.discountPercent);
  if (p.delPrice && p.delPrice > p.price) {
    return Math.round(((p.delPrice - p.price) / p.delPrice) * 100);
  }
  return 0;
};

/* ---------- Component ---------- */

const FeaturedProducts = () => {
  const router = useRouter();
  const lang = useCurrentLang();
  const isRtl = lang === "ar";

  const { data, isLoading, isError } = useGetProductsQuery();
  const products = (data ?? [])
    .filter((p) => !p.isDeleted)
    .slice(0, MAX_FEATURED);

  const trackRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [active, setActive] = useState(0);

  // Work out how many dots are needed and which one is active
  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const totalPages = Math.max(
      1,
      Math.ceil(el.scrollWidth / el.clientWidth - 0.05),
    );
    setPages(totalPages);

    if (maxScroll <= 0 || totalPages === 1) {
      setActive(0);
      return;
    }
    // scrollLeft is negative in RTL, so use its absolute value
    const progress = Math.abs(el.scrollLeft) / maxScroll;
    setActive(Math.round(progress * (totalPages - 1)));
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, products.length, isRtl]);

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const left = index * el.clientWidth;
    el.scrollTo({ left: isRtl ? -left : left, behavior: "smooth" });
  };

  // Home-page section: show nothing if the request failed or there is no data
  if (!isLoading && (isError || products.length === 0)) return null;

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full bg-[#faf8f3] px-4 py-10 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-8xl">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold text-slate-900 md:text-3xl">
            {t(UI.title, lang)}
          </h2>

          <Link
            href="/products-list"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-serif text-xs font-bold text-slate-900 shadow-sm transition hover:border-green-700 hover:text-green-800"
          >
            {t(UI.viewAll, lang)}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex gap-4 overflow-hidden" aria-busy="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-3/4 shrink-0 basis-[calc((100%-1rem)/2)] animate-pulse rounded-xl bg-white sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)] xl:basis-[calc((100%-4rem)/5)]"
              />
            ))}
          </div>
        )}

        {/* Slider track */}
        {products.length > 0 && (
          <div
            ref={trackRef}
            onScroll={update}
            className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => {
              const name = t(product.productName, lang);
              const discount = getDiscount(product);
              const unit = unitLabel(product.unit, lang);
              const image = product.images?.[0];
              const href = `/products/${product._id} `;
              const filledStars = Math.round(product.rating || 0);

              return (
                <article
                  key={product._id}
                  onClick={() => router.push(href)}
                  className="group flex shrink-0 cursor-pointer basis-[calc((100%-1rem)/2)] snap-start flex-col rounded-xl bg-white p-2.5 shadow-[0_4px_16px_rgba(20,60,40,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(20,60,40,0.12)] sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)] xl:basis-[calc((100%-4rem)/5)]"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f3ece0]">
                    {image && (
                      <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    )}

                    {/* Discount badge */}
                    {discount > 0 && (
                      <span className="absolute inset-s-2 top-2 rounded bg-green-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {discount}% {t(UI.off, lang)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col pt-3">
                    <h3 className="truncate text-start font-serif text-sm font-bold text-slate-900">
                      {name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < filledStars
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="font-semibold text-slate-800">
                        {product.rating}
                      </span>
                      <span className="text-slate-400">({product.review})</span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-serif">
                      <span className="text-lg font-bold text-slate-900">
                        {money(product.price, lang)}
                        <span className="ms-0.5 text-xs font-semibold text-slate-500">
                          /{unit}
                        </span>
                      </span>
                      {product.delPrice && product.delPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {money(product.delPrice, lang)}/{unit}
                        </span>
                      )}
                    </div>

                    {/* inquiry: stop the card's click-to-navigate from firing */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <InquiryModel />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Dots only (hidden when everything fits on one page) */}
        {pages > 1 && (
          <div
            className="mt-4 flex items-center justify-center gap-2"
            role="tablist"
            aria-label={t(UI.sliderLabel, lang)}
          >
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`${t(UI.goTo, lang)} ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === i
                    ? "w-6 bg-green-800"
                    : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;