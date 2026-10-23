"use client";

import React, { useId, useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import InquiryModel from "@/app/components/InquiryModel";
import ThemeBtnOne from "@/app/components/ThemeBtnOne";
import { ILocalizedText, useGetFaqsQuery } from "@/store/faqApi";
import { useGetSettingsQuery } from "@/store/settingApi";

type Lang = keyof ILocalizedText;

/* ---------- Static, translated UI text ---------- */

const UI = {
  eyebrowA: { en: "Got ", ar: "هل لديك " },
  eyebrowB: { en: "Questions?", ar: "أسئلة؟" },
  title: { en: "Frequently Asked Questions", ar: "الأسئلة الشائعة" },
  subtitle: {
    en: "Everything you need to know about ordering, pricing, delivery and quality from Parwan Roastery.",
    ar: "كل ما تحتاج لمعرفته حول الطلب والأسعار والتوصيل والجودة من محمصة بروان.",
  },
  needHelp: { en: "Need help?", ar: "تحتاج مساعدة؟" },
  stillTitle: { en: "Still have questions?", ar: "ما زال لديك أسئلة؟" },
  stillDesc: {
    en: "Our team replies within 24 hours with pricing, samples and availability.",
    ar: "يرد فريقنا خلال 24 ساعة مع الأسعار والعينات والتوفر.",
  },
  whatsapp: { en: "Chat on WhatsApp", ar: "تحدث معنا عبر واتساب" },
  empty: {
    en: "No FAQs available right now.",
    ar: "لا توجد أسئلة شائعة حالياً.",
  },
  error: {
    en: "We couldn't load the FAQs.",
    ar: "تعذر تحميل الأسئلة الشائعة.",
  },
  retry: { en: "Try again", ar: "إعادة المحاولة" },
} satisfies Record<string, ILocalizedText>;

const FALLBACK_WHATSAPP = "971508221435";

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

/** Accepts either a full URL or a plain phone number. */
const waLink = (v: string) =>
  /^https?:\/\//i.test(v) ? v : `https://wa.me/${v.replace(/\D/g, "")}`;

/* ---------- Component ---------- */

const Faq = () => {
  const baseId = useId();
  const lang = useCurrentLang();

  const { data, isLoading, isError, refetch } = useGetFaqsQuery();
  const { data: settingsList } = useGetSettingsQuery();

  // undefined = nothing chosen yet (first item opens by default), null = all closed
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);

  const items = useMemo(
    () => (data ?? []).filter((f) => f.status !== "inactive"),
    [data],
  );

  const effectiveOpenId =
    openId === undefined ? (items[0]?._id ?? null) : openId;

  const whatsappUrl = settingsList?.whatsApp
    ? waLink(settingsList.whatsApp)
    : `https://wa.me/${FALLBACK_WHATSAPP}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: t(f.question, lang),
      acceptedAnswer: { "@type": "Answer", text: t(f.answer, lang) },
    })),
  };

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="w-full bg-[#faf8f3] px-4 py-12 sm:px-6 lg:px-12 lg:py-16"
    >
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
            <span className="text-green-600">{t(UI.eyebrowA, lang)}</span>
            <span className="text-green-900">{t(UI.eyebrowB, lang)}</span>
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-slate-900 md:text-4xl">
            {t(UI.title, lang)}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 md:text-base">
            {t(UI.subtitle, lang)}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Left: accordion */}
          <div className="min-w-0">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="space-y-3" aria-busy="true">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl border border-[#e3e8df] bg-white"
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {isError && !isLoading && (
              <div className="rounded-2xl border border-[#e3e8df] bg-white p-6 text-center">
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
            {!isLoading && !isError && items.length === 0 && (
              <div className="rounded-2xl border border-[#e3e8df] bg-white p-6 text-center text-sm text-slate-600">
                {t(UI.empty, lang)}
              </div>
            )}

            {/* Accordion */}
            {items.length > 0 && (
              <div className="space-y-3">
                {items.map((item) => {
                  const open = effectiveOpenId === item._id;
                  const panelId = `${baseId}-${item._id}-panel`;
                  const btnId = `${baseId}-${item._id}-btn`;

                  return (
                    <div
                      key={item._id}
                      className={`rounded-2xl border bg-white transition-all duration-300 ${
                        open
                          ? "border-green-200 shadow-[0_6px_20px_rgba(20,60,40,0.08)]"
                          : "border-[#e3e8df] shadow-sm hover:border-green-200"
                      }`}
                    >
                      <h3>
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={open}
                          aria-controls={panelId}
                          onClick={() => setOpenId(open ? null : item._id)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start sm:px-6 sm:py-5"
                        >
                          <span className="font-serif text-[15px] font-bold leading-snug text-slate-900 sm:text-base">
                            {t(item.question, lang)}
                          </span>
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                              open
                                ? "bg-green-800 text-white"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${
                                open ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          </span>
                        </button>
                      </h3>

                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="whitespace-pre-line px-5 pb-5 text-start text-sm leading-7 text-slate-600 sm:px-6">
                            {t(item.answer, lang)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: help card */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-[#e3e8df] bg-white shadow-[0_6px_24px_rgba(20,60,40,0.08)]">
              <div className="bg-linear-to-br from-green-900 to-green-800 px-6 py-6 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-200">
                  {t(UI.needHelp, lang)}
                </p>
                <h3 className="mt-1.5 font-serif text-xl font-bold leading-tight">
                  {t(UI.stillTitle, lang)}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-green-100/80">
                  {t(UI.stillDesc, lang)}
                </p>
              </div>

              <div className="space-y-3 p-6">
                <InquiryModel />

                <ThemeBtnOne
                  text={t(UI.whatsapp, lang)}
                  url={whatsappUrl}
                  icon={<BsWhatsapp size={16} />}
                  className="mt-3 h-11 w-full cursor-pointer text-nowrap rounded-full border border-green-700 bg-white px-4 font-serif text-sm font-semibold text-black"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Faq;
