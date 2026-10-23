"use client";

import React, { useSyncExternalStore } from "react";
import { Bean } from "lucide-react";
import Image from "next/image";
import { useGetAboutUsQuery, type ILocalizedText } from "@/store/aboutUsApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/* ------------------------------ Data shapes -------------------------------- */

/**
 * The fields of the About Us document used by this section.
 * Note: `whoWeAresubTitle` and `whoWeAreHightlightTitle` match the database
 * spelling exactly (field names are case-sensitive).
 */
interface IAboutUs {
  whoWeAreTitle: ILocalizedText; // small label next to the bean icon
  whoWeAresubTitle: ILocalizedText; // heading (dark part)
  whoWeAreHightlightTitle: ILocalizedText; // heading (green part)
  whoWeAreDesc: ILocalizedText; // paragraph
  img2: string;
  isDeleted: boolean;
}

/* ------------------------------ Static config ----------------------------- */

const FALLBACK_IMAGE = "/img/about/3.jpg";

const ERROR_TEXT: ILocalizedText = {
  en: "Something went wrong...",
  ar: "حدث خطأ ما...",
};

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

/** The API may return one document or a list of them; use the first. */
const pickDocument = (data: unknown): IAboutUs | undefined => {
  const item = Array.isArray(data) ? data[0] : data;
  return (item ?? undefined) as IAboutUs | undefined;
};

/* --------------------------------- Styles --------------------------------- */

const SECTION = "w-full bg-[#f8fbf5] px-4 py-10 md:px-6";
const GRID =
  "mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 lg:gap-12";

/* -------------------------------- Skeleton -------------------------------- */

const WhyChooseSkeleton = () => (
  <section className={SECTION} aria-busy="true">
    <div className={GRID}>
      <div className="h-80 w-full animate-pulse rounded-xl bg-slate-200" />

      <div className="w-full max-w-135 animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-9 w-4/5 rounded bg-slate-200" />
          <div className="h-9 w-3/5 rounded bg-green-100" />
        </div>
        <div className="mt-5 max-w-132.5 space-y-2">
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  </section>
);

/* -------------------------------- Component ------------------------------- */

const WhyChoose = () => {
  const { data, isLoading, isError } = useGetAboutUsQuery();

  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (isLoading) return <WhyChooseSkeleton />;

  if (isError) {
    return (
      <div dir={dir} className="py-10 text-center">
        {t(ERROR_TEXT, lang)}
      </div>
    );
  }

  const doc = pickDocument(data);
  if (!doc || doc.isDeleted) return null;

  return (
    <section dir={dir} lang={lang} className={SECTION}>
      <div className={GRID}>
        {/* Image */}
        <div className="relative w-full overflow-hidden rounded-xl">
          <Image
            src={doc.img2 || FALLBACK_IMAGE}
            alt={t(doc.whoWeAreTitle, lang)}
            width={700}
            height={520}
            className="h-80 w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex w-full items-center">
          <div className="w-full max-w-135">
            {/* Label */}
            <div className="mb-4 flex items-center gap-2">
              <Bean
                size={17}
                strokeWidth={2.5}
                className="text-[#438c35]"
                aria-hidden="true"
              />
              <span className="font-serif text-sm font-bold tracking-wide text-[#438c35]">
                {t(doc.whoWeAreTitle, lang)}
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-3xl font-extrabold leading-tight text-[#171717] sm:text-4xl md:text-5xl lg:text-[40px]">
              {t(doc.whoWeAresubTitle, lang)}
              <br />
              <span className="font-serif text-[#28772b]">
                {t(doc.whoWeAreHightlightTitle, lang)}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-132.5 text-sm leading-6 text-[#555] md:text-[15px]">
              {t(doc.whoWeAreDesc, lang)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
