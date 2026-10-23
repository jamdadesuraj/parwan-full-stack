"use client";

import React, { useSyncExternalStore } from "react";
import { CheckCircle2, Eye, HandHeart, Target } from "lucide-react";
import { useGetAboutUsQuery, type ILocalizedText } from "@/store/aboutUsApi";

type Lang = keyof ILocalizedText; // "en" | "ar"

/* ------------------------------ Data shapes -------------------------------- */

/** The fields of the About Us document used by this section. */
interface IAboutUs {
  missionTitle: ILocalizedText; // small eyebrow line (first word green)
  missionSubTitle: ILocalizedText; // main heading
  mission: ILocalizedText;
  vision: ILocalizedText;
  values: ILocalizedText[];
  isDeleted: boolean;
}

type InfoCard = {
  id: "mission" | "vision" | "values";
  icon: React.ElementType;
  title: ILocalizedText; // static card heading
  text?: ILocalizedText;
  points?: ILocalizedText[];
};

/* ------------------------------ Static config ----------------------------- */

const CARD_TITLES = {
  mission: { en: "Our Mission", ar: "مهمتنا" },
  vision: { en: "Our Vision", ar: "رؤيتنا" },
  values: { en: "Our Values", ar: "قيمنا" },
} satisfies Record<string, ILocalizedText>;

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

/** Splits "Who We Are" into a green first word + dark remainder. */
const splitEyebrow = (text: string): [string, string] => {
  const [first = "", ...rest] = text.split(" ");
  return [rest.length ? `${first} ` : first, rest.join(" ")];
};

/* --------------------------------- Styles --------------------------------- */

const SECTION = "w-full bg-[#faf8f3] px-4 py-12 sm:px-6 lg:px-12";
const GRID = "grid grid-cols-1 gap-5 md:grid-cols-3";
const CARD =
  "flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_3px_15px_rgba(0,0,0,0.07)]";

/* -------------------------------- Skeleton -------------------------------- */

const MissionSkeleton = () => (
  <section className={SECTION} aria-busy="true">
    <div className="mx-auto max-w-7xl animate-pulse">
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="h-3 w-28 rounded bg-slate-200" />
        <div className="h-9 w-80 max-w-full rounded bg-slate-200" />
      </div>

      <div className={GRID}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={CARD}>
            <div className="h-14 w-14 shrink-0 rounded-full bg-slate-200" />
            <div className="w-full space-y-3">
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-full rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* -------------------------------- Component ------------------------------- */

const Mission = () => {
  const { data, isLoading, isError } = useGetAboutUsQuery();

  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  if (isLoading) return <MissionSkeleton />;

  if (isError) {
    return (
      <div dir={dir} className="py-10 text-center">
        {t(ERROR_TEXT, lang)}
      </div>
    );
  }

  const doc = pickDocument(data);
  if (!doc || doc.isDeleted) return null;

  const cards: InfoCard[] = [
    { id: "mission", icon: Target, title: CARD_TITLES.mission, text: doc.mission },
    { id: "vision", icon: Eye, title: CARD_TITLES.vision, text: doc.vision },
    { id: "values", icon: HandHeart, title: CARD_TITLES.values, points: doc.values ?? [] },
  ];

  const [eyebrowLight, eyebrowDark] = splitEyebrow(t(doc.missionTitle, lang));

  return (
    <section dir={dir} lang={lang} className={SECTION}>
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
            <span className="text-green-600">{eyebrowLight}</span>
            <span className="text-green-900">{eyebrowDark}</span>
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
            {t(doc.missionSubTitle, lang)}
          </h2>
        </div>

        {/* Cards */}
        <div className={GRID}>
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                className={`${CARD} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(20,60,40,0.12)]`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#eef5e7]">
                  <Icon
                    size={27}
                    strokeWidth={1.6}
                    className="text-green-700"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-serif text-base font-bold text-green-800">
                    {t(card.title, lang)}
                  </h3>

                  {card.text && (
                    <p className="mt-2 text-[13px] leading-6 text-gray-600">
                      {t(card.text, lang)}
                    </p>
                  )}

                  {card.points && (
                    <ul className="mt-3 space-y-2 text-[13px] text-gray-600">
                      {card.points.map((point, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2
                            size={14}
                            className="shrink-0 text-green-700"
                            aria-hidden="true"
                          />
                          <span>{t(point, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Mission;