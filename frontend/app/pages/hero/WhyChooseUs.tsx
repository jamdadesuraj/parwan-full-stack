"use client";

import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import {
  Award,
  BadgeCheck,
  Headset,
  LayoutGrid,
  Leaf,
  Package,
  ShieldCheck,
  Star,
  Tag,
  Truck,
} from "lucide-react";
import {
  useGetWhyChooseUsQuery,
  type ILocalizedText,
} from "@/store/whyChooseUsApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/* ------------------------------ Data shapes -------------------------------- */

/** One feature item inside the document's `features` array. */
interface IFeature {
  icon: string; // lucide icon name, e.g. "Truck" (see ICON_MAP)
  title: ILocalizedText;
  desc: ILocalizedText;
}

/** Shape of the Why Choose Us document in the database. */
interface IWhyChooseUs {
  _id: string;
  title: ILocalizedText; // small eyebrow line, e.g. "Why Choose Us"
  subTitle: ILocalizedText; // main heading
  desc: ILocalizedText; // paragraph
  image: string;
  features: IFeature[];
  isDeleted: boolean;
}

/* ------------------------------ Static config ----------------------------- */

const FALLBACK_IMAGE = "/img/banner/b2.png";
const SKELETON_FEATURES = 4;

/**
 * Icon names stored in the database -> lucide components.
 * Add more here when you add new icon names in the admin panel.
 */
const ICON_MAP: Record<string, React.ElementType> = {
  badgecheck: BadgeCheck,
  layoutgrid: LayoutGrid,
  tag: Tag,
  truck: Truck,
  shieldcheck: ShieldCheck,
  leaf: Leaf,
  award: Award,
  star: Star,
  headset: Headset,
  package: Package,
};

const getIcon = (name: string | undefined): React.ElementType =>
  ICON_MAP[(name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")] ?? BadgeCheck;

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
const pickDocument = (data: unknown): IWhyChooseUs | undefined => {
  const item = Array.isArray(data) ? data[0] : data;
  return (item ?? undefined) as IWhyChooseUs | undefined;
};

/** Splits "Why Choose Us" into a green first word + dark remainder. */
const splitEyebrow = (text: string): [string, string] => {
  const [first = "", ...rest] = text.split(" ");
  return [rest.length ? `${first} ` : first, rest.join(" ")];
};

/* --------------------------------- Styles --------------------------------- */

const IMAGE_WRAP =
  "relative h-48 w-full sm:h-60 lg:absolute lg:inset-0 lg:h-full";
const CONTENT = "relative px-4 py-8 sm:px-8 lg:py-14 lg:ps-[36%] lg:pe-12";
const FEATURE_GRID =
  "mt-6 grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-5";
const featureItemClass = (index: number) =>
  `flex items-center gap-3 lg:px-4 ${
    index === 0 ? "lg:ps-0" : "lg:border-s lg:border-slate-200"
  }`;

/* -------------------------------- Skeleton -------------------------------- */

const WhyChooseUsSkeleton = () => (
  <section
    className="relative w-full overflow-hidden bg-[#faf8f3]"
    aria-busy="true"
  >
    <div className={`${IMAGE_WRAP} animate-pulse bg-slate-200`} />

    <div className={CONTENT}>
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="mt-3 h-9 w-3/4 max-w-md rounded bg-slate-200" />
        <div className="mt-4 max-w-xl space-y-2">
          <div className="h-3 w-full rounded bg-slate-200" />
          <div className="h-3 w-4/5 rounded bg-slate-200" />
        </div>

        <div className={FEATURE_GRID}>
          {Array.from({ length: SKELETON_FEATURES }, (_, i) => (
            <div key={i} className={featureItemClass(i)}>
              <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200" />
              <div className="w-full max-w-32 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* -------------------------------- Component ------------------------------- */

const WhyChooseUs = () => {
  const { data, isLoading, isError } = useGetWhyChooseUsQuery();

  const lang = useCurrentLang();
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  if (isLoading) return <WhyChooseUsSkeleton />;

  if (isError) {
    return (
      <div dir={dir} className="py-10 text-center">
        {t(ERROR_TEXT, lang)}
      </div>
    );
  }

  const doc = pickDocument(data);
  if (!doc || doc.isDeleted) return null;

  const [eyebrowLight, eyebrowDark] = splitEyebrow(t(doc.title, lang));
  const heading = t(doc.subTitle, lang);

  // Cream fade keeps the text side clean (flips side in RTL)
  const sideFade = `linear-gradient(to ${isRtl ? "left" : "right"}, rgba(250,248,243,0) 0%, rgba(250,248,243,0) 22%, rgba(250,248,243,0.9) 40%, #faf8f3 50%)`;

  return (
    <section
      dir={dir}
      lang={lang}
      className="relative w-full overflow-hidden bg-[#faf8f3]"
    >
      {/* Background image: full section, anchored to the start side */}
      <div className={IMAGE_WRAP}>
        <Image
          src={doc.image || FALLBACK_IMAGE}
          alt={heading}
          fill
          priority
          sizes="100vw"
          className="object-cover object-left rtl:object-right"
        />

        {/* Cream fade: image stays clear on one side, blends out before the text */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: sideFade }}
        />
        {/* Mobile only: fade the bottom edge into the content below */}
        <div
          className="absolute inset-0 lg:hidden"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,248,243,0) 60%, #faf8f3 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className={CONTENT}>
        <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
          <span className="text-green-600">{eyebrowLight}</span>
          <span className="text-green-900">{eyebrowDark}</span>
        </p>
        <h2 className="mt-1 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
          {heading}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          {t(doc.desc, lang)}
        </p>

        <div className={FEATURE_GRID}>
          {(doc.features ?? []).map((feature, index) => {
            const Icon = getIcon(feature.icon);

            return (
              <div key={index} className={featureItemClass(index)}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100/80">
                  <Icon
                    className="h-6 w-6 text-green-800"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-serif text-sm font-bold leading-tight text-slate-900">
                    {t(feature.title, lang)}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-slate-500">
                    {t(feature.desc, lang)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
