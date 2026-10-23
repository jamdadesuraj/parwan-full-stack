"use client";

import React, { useSyncExternalStore } from "react";
import {
  Award,
  BadgeCheck,
  Bean,
  Leaf,
  ShieldCheck,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useGetAboutUsQuery, type ILocalizedText } from "@/store/aboutUsApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/* ------------------------------ Data shapes -------------------------------- */

/** One item in the document's `highlights` array. */
interface IHighlight {
  icon?: string; // lucide icon name, e.g. "Tag" (see ICON_MAP)
  title: ILocalizedText;
  desc?: ILocalizedText;
}

/** The fields of the About Us document used by this section. */
interface IAboutUs {
  title: ILocalizedText; // small label next to the bean icon
  subTitle: ILocalizedText; // heading (dark part)
  highlightsTitle: ILocalizedText; // heading (green part)
  shortDesc: ILocalizedText; // paragraph
  img1: string;
  highlights: IHighlight[];
  isDeleted: boolean;
}

/* ------------------------------ Static config ----------------------------- */

const FALLBACK_IMAGE = "/img/about/3.jpg";

const ICON_MAP: Record<string, React.ElementType> = {
  shieldcheck: ShieldCheck,
  tag: Tag,
  bean: Bean,
  badgecheck: BadgeCheck,
  truck: Truck,
  award: Award,
  leaf: Leaf,
  star: Star,
};

const getIcon = (name: string | undefined): React.ElementType =>
  ICON_MAP[(name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")] ?? ShieldCheck;

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

const SECTION = "w-full bg-[#f8faf1] px-4 py-8 md:px-6";
const WRAPPER =
  "mx-auto flex max-w-7xl flex-col overflow-hidden rounded-2xl bg-[#f8faf1] md:min-h-100 md:flex-row";
const TEXT_SIDE =
  "relative z-10 flex w-full items-center py-8 md:w-[48%] md:py-10 lg:w-[46%]";
const IMAGE_SIDE = "relative min-h-75 w-full md:min-h-0 md:w-[54%]";

/* -------------------------------- Skeleton -------------------------------- */

const AboutUsSkeleton = () => (
  <section className={SECTION} aria-busy="true">
    <div className={WRAPPER}>
      <div className={TEXT_SIDE}>
        <div className="w-full max-w-xl animate-pulse">
          <div className="mb-4 h-4 w-52 rounded bg-slate-200" />
          <div className="space-y-3">
            <div className="h-10 w-full rounded bg-slate-200" />
            <div className="h-10 w-3/4 rounded bg-green-100" />
          </div>
          <div className="mt-5 max-w-132.5 space-y-2">
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-full rounded bg-slate-200" />
            <div className="h-3 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="mt-8 flex flex-col gap-5 md:flex-row md:gap-8">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-1 items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-lg bg-slate-200" />
                <div className="w-full space-y-2">
                  <div className="h-3 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`${IMAGE_SIDE} animate-pulse bg-slate-200`} />
    </div>
  </section>
);

/* -------------------------------- Component ------------------------------- */

const AboutUs = () => {
  const { data, isLoading, isError } = useGetAboutUsQuery();

  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (isLoading) return <AboutUsSkeleton />;

  if (isError) {
    return (
      <div dir={dir} className="py-10 text-center">
        {t(ERROR_TEXT, lang)}
      </div>
    );
  }

  const doc = pickDocument(data);
  if (!doc || doc.isDeleted) return null;

  const highlights = doc.highlights ?? [];

  return (
    <section dir={dir} lang={lang} className={SECTION}>
      <div className={WRAPPER}>
        {/* Text side */}
        <div className={TEXT_SIDE}>
          <div className="max-w-xl">
            {/* Label */}
            <div className="mb-4 flex items-center gap-2">
              <Bean size={17} strokeWidth={2.5} className="text-[#438c35]" />
              <span className="font-serif text-sm font-bold tracking-wide text-[#438c35]">
                {t(doc.title, lang)}
              </span>
            </div>

            {/* Heading */}
            <h2 className="font-serif text-4xl font-extrabold text-[#171717] md:text-5xl lg:text-[48px]">
              {t(doc.subTitle, lang)}
              <br />
              <span className="font-serif text-[#28772b]">
                {t(doc.highlightsTitle, lang)}
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-132.5 text-sm leading-6 text-[#555] md:text-[15px]">
              {t(doc.shortDesc, lang)}
            </p>

            {/* Highlights */}
            <div className="mt-8 flex w-full flex-col gap-5 md:flex-row md:flex-nowrap md:items-stretch md:gap-0">
              {highlights.map((item, index) => {
                const Icon = getIcon(item.icon);

                return (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <div className="hidden h-auto w-px shrink-0 bg-[#d9dfd2] md:mx-4 md:block" />
                    )}

                    <div className="flex flex-1 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e7f2dc]">
                        <Icon
                          size={21}
                          strokeWidth={1.8}
                          className="text-[#438c35]"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#252525]">
                          {t(item.title, lang)}
                        </h3>
                        <p className="mt-1 max-w-26.25 text-[11px] leading-4 text-[#666]">
                          {t(item.desc, lang)}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Image side */}
        <div className={IMAGE_SIDE}>
          <Image
            src={doc.img1 || FALLBACK_IMAGE}
            alt={t(doc.title, lang)}
            fill
            sizes="(max-width: 768px) 100vw, 54vw"
            className="object-cover"
          />

          {/* Fade toward the text side (flips in RTL) */}
          <div className="absolute inset-y-0 inset-s-0 hidden w-40 bg-linear-to-r rtl:bg-linear-to-l from-[#f8faf1] via-[#f8faf1]/80 to-transparent md:block" />

          {/* Overall subtle fade */}
          <div className="absolute inset-0 bg-linear-to-r rtl:bg-linear-to-l from-[#f8faf1]/30 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default AboutUs;