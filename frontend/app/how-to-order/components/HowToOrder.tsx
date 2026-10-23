"use client";

import React, { useSyncExternalStore } from "react";
import {
  Award,
  FileText,
  MessageSquareText,
  Package,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import InquiryModel from "@/app/components/InquiryModel";
import { useGetHowToOrderQuery, type ILocalizedText } from "@/store/howToOrderApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/* ------------------------------ Static config ----------------------------- */

const MAX_COLUMNS = 4;
const SKELETON_STEPS = 4;

/** Icon names stored in the database -> lucide components. */
const ICON_MAP: Record<string, React.ElementType> = {
  search: Search,
  messagesquaretext: MessageSquareText,
  filetext: FileText,
  truck: Truck,
  package: Package,
  shieldcheck: ShieldCheck,
  award: Award,
};

// Used when a step's icon name isn't in ICON_MAP (picked by step position)
const DEFAULT_ICONS: React.ElementType[] = [
  Search,
  MessageSquareText,
  FileText,
  Truck,
];

const getIcon = (name: string | undefined, index: number): React.ElementType =>
  ICON_MAP[(name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")] ??
  DEFAULT_ICONS[index % DEFAULT_ICONS.length];

// Full class names so Tailwind can detect them
const LG_COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

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

/** Splits "Simple Process" into a green first word + dark remainder. */
const splitEyebrow = (text: string): [string, string] => {
  const [first = "", ...rest] = text.split(" ");
  return [rest.length ? `${first} ` : first, rest.join(" ")];
};

/* --------------------------------- Styles --------------------------------- */

const SECTION = "w-full bg-[#faf8f3] px-4 py-12 sm:px-6 lg:px-12";
const GRID_BASE =
  "relative grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:gap-x-6";

/* -------------------------------- Skeleton -------------------------------- */

const HowToOrderSkeleton = () => (
  <section className={SECTION} aria-busy="true">
    <div className="mx-auto max-w-6xl animate-pulse">
      <div className="mb-12 flex flex-col items-center gap-3">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="h-4 w-72 max-w-full rounded bg-slate-200" />
      </div>

      <div className={`${GRID_BASE} ${LG_COLUMNS[MAX_COLUMNS]}`}>
        {Array.from({ length: SKELETON_STEPS }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-slate-200" />
            <div className="mt-5 w-full space-y-3 rounded-2xl border border-gray-100 bg-white px-5 py-6">
              <div className="mx-auto h-5 w-2/3 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="mx-auto h-3 w-4/5 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* -------------------------------- Component ------------------------------- */

const HowToOrder = () => {
  const { data, isLoading, isError } = useGetHowToOrderQuery();

  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (isLoading) return <HowToOrderSkeleton />;

  if (isError) {
    return (
      <div dir={dir} className="py-10 text-center">
        {t(ERROR_TEXT, lang)}
      </div>
    );
  }

  // The counter is a single document; use the first one that isn't deleted
  const doc = data?.find((item) => !item.isDeleted);
  if (!doc) return null;

  const steps = doc.steps ?? [];
  const columns = Math.min(Math.max(steps.length, 1), MAX_COLUMNS);
  const showDesktopLine = steps.length > 1 && steps.length <= MAX_COLUMNS;
  const [eyebrowLight, eyebrowDark] = splitEyebrow(t(doc.title, lang));

  return (
    <section dir={dir} lang={lang} className={SECTION}>
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-12 text-center">
          <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
            <span className="text-green-600">{eyebrowLight}</span>
            <span className="text-green-900">{eyebrowDark}</span>
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 md:text-5xl">
            {t(doc.subTitle, lang)}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500 md:text-base">
            {t(doc.shortDesc, lang)}
          </p>
        </div>

        {/* Steps */}
        <div className={`${GRID_BASE} ${LG_COLUMNS[columns]}`}>
          {/* Horizontal line (desktop): spans from the first to the last node */}
          {showDesktopLine && (
            <div
              className="pointer-events-none absolute top-8 hidden border-t-2 border-dashed border-green-300 lg:block"
              style={{ insetInline: `${50 / columns}%` }}
              aria-hidden="true"
            />
          )}
          {/* Vertical line (mobile) */}
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 top-8 -translate-x-1/2 border-l-2 border-dashed border-green-300 sm:hidden"
            aria-hidden="true"
          />

          {steps.map((step, index) => {
            const Icon = getIcon(step.icon, index);

            return (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Node */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-green-700 bg-white ring-8 ring-[#faf8f3] transition-colors duration-300 group-hover:bg-green-700">
                  <Icon
                    className="h-7 w-7 text-green-700 transition-colors duration-300 group-hover:text-white"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  <span className="absolute -inset-e-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-700 font-serif text-[11px] font-bold text-white shadow-sm ring-2 ring-[#faf8f3] transition-colors duration-300 group-hover:bg-white group-hover:text-green-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Card (flex-1 so all cards match height) */}
                <div className="relative z-10 mt-5 w-full flex-1 rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-green-200 group-hover:shadow-lg group-hover:shadow-green-900/5">
                  <h3 className="font-serif text-lg font-semibold text-gray-900">
                    {t(step.title, lang)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {t(step.desc, lang)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <InquiryModel />
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;