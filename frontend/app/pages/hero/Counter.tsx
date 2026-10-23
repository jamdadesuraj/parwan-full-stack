"use client";

import React, { useSyncExternalStore } from "react";
import { Award, Bean, Headset, ShieldCheck } from "lucide-react";
import {
  useGetCounterQuery,
  type CounterField,
  type ILocalizedText,
} from "@/store/counterApi";

type Lang = keyof ILocalizedText; 

/* ------------------------------ Static config ----------------------------- */

type Feature = {
  field: CounterField; 
  icon: React.ElementType;
  title: ILocalizedText; 
  fallback: ILocalizedText; 
};

const FEATURES: Feature[] = [
  {
    // @ts-ignore
    field: "protected",
    icon: ShieldCheck,
    title: { en: "Secure Payment", ar: "دفع آمن" },
    fallback: { en: "100% protected", ar: "محمي بنسبة 100%" },
  },
  {
      // @ts-ignore
    field: "Nopreservatives",
    icon: Bean,
    title: { en: "Fresh & Natural", ar: "طازج وطبيعي" },
    fallback: { en: "No preservatives", ar: "بدون مواد حافظة" },
  },
  {
      // @ts-ignore
    field: "Wereheretohelp",
    icon: Headset,
    title: { en: "24/7 Support", ar: "دعم على مدار الساعة" },
    fallback: { en: "We're here to help", ar: "نحن هنا لمساعدتك" },
  },
  {
      // @ts-ignore
    field: "Happycustomers",
    icon: Award,
    title: { en: "Trusted by 10K+", ar: "موثوق من +10 آلاف" },
    fallback: { en: "Happy customers", ar: "عملاء سعداء" },
  },
];

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

const t = (text: ILocalizedText | undefined, lang: Lang) =>
  text?.[lang] || text?.en || "";

/* --------------------------------- Styles --------------------------------- */

const SECTION = "w-full px-4 py-8 sm:px-6 lg:px-12";
const GRID =
  "mx-auto grid max-w-8xl grid-cols-2 rounded-2xl border border-white bg-white/70 p-2 shadow-[0_4px_24px_rgba(20,60,40,0.06)] sm:p-3 lg:grid-cols-4 lg:p-4";
const ITEM =
  "relative flex flex-col items-center gap-2 px-3 py-4 text-center sm:flex-row sm:gap-4 sm:px-5 sm:text-start lg:justify-center";
const DIVIDER =
  "absolute start-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-slate-200 lg:block";

/* -------------------------------- Component ------------------------------- */

const Counter = () => {
  const { data, isLoading } = useGetCounterQuery();
  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Loading skeleton (same layout as the real cards)
  if (isLoading) {
    return (
      <section className={SECTION} aria-busy="true">
        <div className={GRID}>
          {FEATURES.map(({ field }, index) => (
            <div key={field} className={`${ITEM} animate-pulse`}>
              {index > 0 && <span className={DIVIDER} aria-hidden="true" />}
              <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200 sm:h-10 sm:w-10" />
              <div className="w-full max-w-28 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200 max-sm:mx-auto" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // API returns a list; the counter is a single document.
  // On error / empty data the cards still render using the fallback text.
  const counter = data?.[0];

  return (
    <section dir={dir} lang={lang} className={SECTION}>
      <div className={GRID}>
        {FEATURES.map(({ field, icon: Icon, title, fallback }, index) => (
          <div key={field} className={ITEM}>
            {/* Divider (desktop only) */}
            {index > 0 && <span className={DIVIDER} aria-hidden="true" />}

            <Icon
              className="h-9 w-9 shrink-0 text-green-800 sm:h-10 sm:w-10"
              strokeWidth={1.25}
              aria-hidden="true"
            />

            <div className="min-w-0">
              <h3 className="font-serif text-[15px] font-bold leading-tight text-slate-900">
                {t(title, lang)}
              </h3>
              <p className="mt-1 text-xs leading-snug text-slate-500">
                {t(counter?.[field], lang) || t(fallback, lang)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Counter;