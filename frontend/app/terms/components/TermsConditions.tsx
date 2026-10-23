"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { FileText, Mail } from "lucide-react";
import { ILocalizedText, useGetTermsQuery } from "@/store/termsApi";
import { useGetSettingsQuery } from "@/store/settingApi";

type Lang = keyof ILocalizedText;

/* ---------- Static, translated UI text ---------- */

const UI = {
  eyebrow: { en: "Legal Information", ar: "معلومات قانونية" },
  title: { en: "Terms & Conditions", ar: "الشروط والأحكام" },
  lastUpdated: { en: "Last updated", ar: "آخر تحديث" },
  contents: { en: "Contents", ar: "المحتويات" },
  questions: {
    en: "Questions about these terms?",
    ar: "هل لديك أسئلة حول هذه الشروط؟",
  },
  contactUs: { en: "Contact us at", ar: "تواصل معنا عبر" },
  or: { en: "or", ar: "أو" },
  sendMessage: { en: "send us a message", ar: "أرسل لنا رسالة" },
  empty: {
    en: "Terms & Conditions are not available right now.",
    ar: "الشروط والأحكام غير متاحة حالياً.",
  },
  error: {
    en: "We couldn't load the Terms & Conditions.",
    ar: "تعذر تحميل الشروط والأحكام.",
  },
  retry: { en: "Try again", ar: "إعادة المحاولة" },
} satisfies Record<string, ILocalizedText>;

const FALLBACK_MAIL = "info@parwanroastery.com";

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

/* ---------- HTML → sections ---------- */

type Section = { id: string; title: string; html: string };

const stripTags = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

/** Splits sanitized HTML at each h2 (falls back to h1, then h3). */
const parseSections = (html: string): Section[] => {
  if (!html.trim()) return [];

  const level = ["h2", "h1", "h3"].find((h) =>
    new RegExp(`<${h}[\\s>]`, "i").test(html),
  );
  if (!level) return [{ id: "section-0", title: "", html }];

  const parts = html.split(new RegExp(`(?=<${level}[\\s>])`, "i"));
  const headingRe = new RegExp(
    `^\\s*<${level}[^>]*>([\\s\\S]*?)</${level}>`,
    "i",
  );

  return parts
    .map((part) => {
      const m = part.match(headingRe);
      if (!m) return { title: "", html: part };
      return {
        // remove numbering typed in the editor ("1. Intro") so we don't double-number
        title: stripTags(m[1]).replace(/^\d+\s*[.)-]\s*/, ""),
        html: part.slice(m[0].length),
      };
    })
    .filter((s) => s.title || stripTags(s.html))
    .map((s, i) => ({ id: `section-${i}`, ...s }));
};

/* Styles applied to the rich-text HTML coming from the editor */
const PROSE =
  "whitespace-normal break-words text-start text-sm leading-7 text-[#666] " +
  "[&_*]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_pre]:overflow-x-auto " +
  "[&_p]:mt-3 [&_p:first-child]:mt-0 " +
  "[&_strong]:font-semibold [&_strong]:text-[#252525] " +
  "[&_a]:font-semibold [&_a]:text-green-800 [&_a:hover]:underline " +
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:ps-5 " +
  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:ps-5 " +
  "[&_li]:leading-6 [&_li]:marker:text-[#438c35] " +
  "[&_h3]:mt-5 [&_h3]:font-serif [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[#252525] " +
  "[&_h4]:mt-4 [&_h4]:font-serif [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-[#252525] " +
  "[&_blockquote]:mt-4 [&_blockquote]:rounded-xl [&_blockquote]:bg-[#f8faf5] [&_blockquote]:p-4 [&_blockquote]:text-xs " +
  "[&_table]:mt-4 [&_table]:w-full [&_td]:border [&_td]:border-[#edf0ea] [&_td]:p-2 [&_th]:border [&_th]:border-[#edf0ea] [&_th]:p-2";

/* ---------- Component ---------- */

const TermsConditions = () => {
  const lang = useCurrentLang();
  const { data, isLoading, isError, refetch } = useGetTermsQuery();
  const { data: settingsList } = useGetSettingsQuery();
  const [activeId, setActiveId] = useState<string>("section-0");

  const terms = useMemo(() => (data ?? []).find((x) => !x.isDeleted), [data]);
  const mail = settingsList?.mail || FALLBACK_MAIL;

  const sections = useMemo(() => {
    // Rich-text editors save spaces as &nbsp;, which the browser never wraps
    const raw = t(terms?.content, lang)
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ");
    const clean = DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true },
      // drop editor inline styles/classes so our own styling controls the layout
      FORBID_ATTR: ["style", "class", "width", "height"],
    });
    return parseSections(clean);
  }, [terms, lang]);

  const titled = sections.filter((s) => s.title);

  // Highlight the current section in the sidebar while scrolling
  useEffect(() => {
    if (titled.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px" },
    );
    titled.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [titled]);

  const eyebrow = t(terms?.subTitle, lang) || t(UI.eyebrow, lang);
  const [eyebrowFirst, ...eyebrowRest] = eyebrow.split(" ");

  const updatedDate = terms?.updatedAt
    ? new Date(terms.updatedAt)
    : terms?.createdAt
      ? new Date(terms.createdAt)
      : null;
  const updated =
    updatedDate && !Number.isNaN(updatedDate.getTime())
      ? updatedDate.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  let counter = 0;

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#faf8f3] px-4 py-12 sm:px-6 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-serif text-xs font-bold uppercase tracking-[0.2em]">
            <span className="text-green-600">{eyebrowFirst}</span>
            {eyebrowRest.length > 0 && (
              <span className="text-green-900"> {eyebrowRest.join(" ")}</span>
            )}
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900 md:text-5xl">
            {t(terms?.title, lang) || t(UI.title, lang)}
          </h1>

          {t(terms?.shortDesc, lang) && (
            <p className="mt-4 text-sm leading-6 text-[#666] sm:text-base">
              {t(terms?.shortDesc, lang)}
            </p>
          )}

          {updated && (
            <p className="mt-3 text-xs text-[#999]">
              {t(UI.lastUpdated, lang)}: {updated}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="mt-10 grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"
            aria-busy="true"
          >
            <div className="hidden h-64 animate-pulse rounded-2xl border border-[#e3e8df] bg-white lg:block" />
            <div className="h-96 animate-pulse rounded-2xl border border-[#e3e8df] bg-white" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#e3e8df] bg-white p-6 text-center">
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
        {!isLoading && !isError && sections.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-[#e3e8df] bg-white p-6 text-center text-sm text-slate-600">
            {t(UI.empty, lang)}
          </div>
        )}

        {/* Main */}
        {sections.length > 0 && (
          <div
            className={`mt-10 grid items-start gap-6 ${
              titled.length > 1 ? "lg:grid-cols-[240px_minmax(0,1fr)]" : ""
            }`}
          >
            {/* Sidebar */}
            {titled.length > 1 && (
              <aside className="rounded-2xl border border-[#e3e8df] bg-white p-4 shadow-sm lg:sticky lg:top-24">
                <p className="px-3 pb-3 text-xs font-bold uppercase tracking-wider text-[#999]">
                  {t(UI.contents, lang)}
                </p>

                <nav aria-label={t(UI.contents, lang)} className="space-y-1">
                  {titled.map((s, i) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      aria-current={activeId === s.id ? "true" : undefined}
                      className={`block rounded-lg px-3 py-2.5 text-xs font-medium transition hover:bg-[#e7f2dc] hover:text-[#438c35] ${
                        activeId === s.id
                          ? "bg-[#e7f2dc] text-[#438c35]"
                          : "text-[#666]"
                      }`}
                    >
                      {i + 1}. {s.title}
                    </a>
                  ))}
                </nav>
              </aside>
            )}

            {/* Terms */}
            <article className="min-w-0 overflow-hidden rounded-2xl border border-[#e3e8df] bg-white p-6 shadow-sm sm:p-8 lg:p-10">
              {sections.map((s, i) => {
                const number = s.title ? ++counter : 0;

                return (
                  <React.Fragment key={s.id}>
                    {i > 0 && <div className="my-8 h-px bg-[#edf0ea]" />}

                    <section id={s.id} className="scroll-mt-24">
                      {s.title ? (
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f2dc]">
                            <FileText
                              size={19}
                              className="text-[#438c35]"
                              aria-hidden="true"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h2 className="font-serif text-lg font-bold text-[#252525]">
                              {number}. {s.title}
                            </h2>
                            <div
                              className={`mt-3 ${PROSE}`}
                              dangerouslySetInnerHTML={{ __html: s.html }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={PROSE}
                          dangerouslySetInnerHTML={{ __html: s.html }}
                        />
                      )}
                    </section>
                  </React.Fragment>
                );
              })}

              {/* Footer notice */}
              <div className="mt-10 flex items-start gap-4 rounded-xl border border-[#dcebd5] bg-[#f4faef] p-5">
                <Mail
                  size={20}
                  className="mt-0.5 shrink-0 text-[#438c35]"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#438c35]">
                    {t(UI.questions, lang)}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#666]">
                    {t(UI.contactUs, lang)}{" "}
                    <a
                      href={`mailto:${mail}`}
                      className="font-semibold text-green-800 hover:underline"
                    >
                      {mail}
                    </a>{" "}
                    {t(UI.or, lang)}{" "}
                    <Link
                      href="/contact"
                      className="font-semibold text-green-800 hover:underline"
                    >
                      {t(UI.sendMessage, lang)}
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </section>
  );
};

export default TermsConditions;
