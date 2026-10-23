"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useGetcategoryQuery, type ILocalizedText } from "@/store/categoriesApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/** Shape of one category document in the database. */
interface ICategory {
  _id: string;
  categoryName: ILocalizedText;
  categoryDesc: ILocalizedText;
  categoryImg: string;
  status: "active" | "inactive";
  isDeleted: boolean;
}

/* ------------------------------ Static content ----------------------------- */

const TEXT = {
  eyebrowLight: { en: "Shop ", ar: "تسوق " },
  eyebrowDark: { en: "by Category", ar: "حسب الفئة" },
  heading: { en: "Explore Our Product Categories", ar: "استكشف فئات منتجاتنا" },
  description: {
    en: "From almonds and cashews to aromatic spices, nutritious seeds, dried fruits and specialty sweets, explore a varied product selection in one convenient place.",
    ar: "من اللوز والكاجو إلى التوابل العطرية والبذور المغذية والفواكه المجففة والحلويات الخاصة، استكشف تشكيلة متنوعة من المنتجات في مكان واحد.",
  },
  viewAll: { en: "View All Categories", ar: "عرض كل الفئات" },
  shopNow: { en: "Shop now", ar: "تسوق الآن" },
  error: { en: "Something went wrong...", ar: "حدث خطأ ما..." },
} satisfies Record<string, ILocalizedText>;

const SKELETON_COUNT = 7;

/* --------------------------- Site language helper -------------------------- */
// Follows <html lang> / dir and updates live. If your header stores the language
// elsewhere (next-intl, i18next, context, Redux), return that value here instead.

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
  useSyncExternalStore(subscribe, getLang, () => "en");

/** Returns the text for `lang`, falling back to English, then empty string. */
const t = (text: ILocalizedText | undefined, lang: Lang): string =>
  text?.[lang] || text?.en || "";

/* --------------------------------- Styles --------------------------------- */

const GRID =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7";
const CARD_SIZE = "relative aspect-3/4 overflow-hidden rounded-2xl";
const ARROW_CLASS =
  "transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1";

// Cream gradient starts in the corner where the text sits (flips in RTL)
const creamGradient = (isRtl: boolean): string =>
  `linear-gradient(${isRtl ? 225 : 135}deg, #f6efe3 0%, rgba(246,239,227,0.85) 25%, rgba(246,239,227,0.4) 45%, rgba(246,239,227,0) 65%)`;

/* ------------------------------ Decorative leaf ----------------------------- */

const LeafDecor = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 200"
    className={`pointer-events-none absolute text-green-700/15 ${className}`}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M100 8C150 40 175 95 100 192C25 95 50 40 100 8Z" />
    <path
      d="M100 192V50"
      stroke="white"
      strokeOpacity="0.6"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const CategorySkeleton = () => (
  <div className={GRID} aria-busy="true">
    {Array.from({ length: SKELETON_COUNT }, (_, i) => (
      <div
        key={i}
        className={`${CARD_SIZE} animate-pulse bg-linear-to-br from-slate-200 to-slate-300`}
      >
        <div className="space-y-2 p-4">
          <div className="h-3 w-3/4 rounded bg-white/70" />
          <div className="h-3 w-full rounded bg-white/50" />
          <div className="h-3 w-1/2 rounded bg-white/50" />
        </div>
      </div>
    ))}
  </div>
);

/* -------------------------------- Component ------------------------------- */

const Category = () => {
  const { data, isLoading, isError } = useGetcategoryQuery();

  const lang = useCurrentLang();
  const isRtl = lang === "ar";

  // Only show live categories
  const categories = useMemo(
    () =>
      ((data ?? []) as ICategory[]).filter(
        (c) => c.status === "active" && !c.isDeleted,
      ),
    [data],
  );

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
      className="relative w-full overflow-hidden px-4 py-12 sm:px-6 lg:px-12"
    >
      {/* Background leaves */}
      <LeafDecor className="-inset-s-10 top-4 h-44 w-44 -rotate-25 md:h-56 md:w-56" />
      <LeafDecor className="-inset-s-14 top-32 h-36 w-36 rotate-60 md:h-48 md:w-48" />
      <LeafDecor className="-inset-e-10 top-2 h-44 w-44 rotate-30 md:h-60 md:w-60" />

      <div className="relative mx-auto max-w-8xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
              <span className="text-green-600">{TEXT.eyebrowLight[lang]}</span>
              <span className="text-green-900">{TEXT.eyebrowDark[lang]}</span>
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
              {TEXT.heading[lang]}
            </h2>
            <p className="mt-2 text-sm text-slate-900">
              {TEXT.description[lang]}
            </p>
          </div>

          <Link
            href="/categories"
            className="group flex items-center gap-2 font-serif text-sm font-semibold text-green-900"
          >
            {TEXT.viewAll[lang]}
            <ArrowRight className={`h-4 w-4 ${ARROW_CLASS}`} />
          </Link>
        </div>

        {isLoading && <CategorySkeleton />}

        {isError && (
          <p className="py-8 text-center text-slate-700">{TEXT.error[lang]}</p>
        )}

        {!isLoading && !isError && (
          <div className={GRID}>
            {categories.map((category) => {
              const name = t(category.categoryName, lang);

              return (
                <Link
                  key={category._id}
                  // The document has no slug field, so the id is used in the URL
                  href={`/products-list?category=${category._id}`}
                  className={`group ${CARD_SIZE} block bg-[#3a3835] shadow-[0_6px_20px_rgba(60,40,10,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(60,40,10,0.16)]`}
                >
                  {/* Full-bleed image */}
                  <Image
                    src={category.categoryImg}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 14vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Cream gradient behind the text */}
                  <div
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{ background: creamGradient(isRtl) }}
                  />

                  {/* Text overlay */}
                  <div className="absolute inset-x-0 top-0 p-4">
                    <h3 className="truncate font-serif text-[13px] font-extrabold uppercase tracking-wide text-slate-900">
                      {name}
                    </h3>
                    <p className="mt-2 text-xs leading-snug text-slate-600">
                      {t(category.categoryDesc, lang)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 font-serif text-[11px] font-bold uppercase tracking-wide text-green-800">
                      {TEXT.shopNow[lang]}
                      <ArrowRight className={`h-3 w-3 ${ARROW_CLASS}`} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Category;