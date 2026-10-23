"use client";

import React, { useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { ChevronDown } from "lucide-react";
import type { ILocalizedText, IProduct, IRow } from "@/store/productsApi";
import { Lang, t, useCurrentLang } from "./i18n";


type TabId = "description" | "specifications" | "packaging" | "faqs";

const TAB_LABELS: Record<TabId, ILocalizedText> = {
  description: { en: "Description", ar: "الوصف" },
  specifications: { en: "Specifications", ar: "المواصفات" },
  packaging: { en: "Packaging & Delivery", ar: "التعبئة والتوصيل" },
  faqs: { en: "FAQs", ar: "الأسئلة الشائعة" },
};

const INFO_LABEL: ILocalizedText = {
  en: "Product information",
  ar: "معلومات المنتج",
};

/* Styles applied to the rich-text HTML coming from the editor */
const PROSE =
  "max-w-3xl whitespace-normal break-words text-start text-sm leading-7 text-slate-600 " +
  "[&_*]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_pre]:overflow-x-auto " +
  "[&_p]:mt-4 [&_p:first-child]:mt-0 " +
  "[&_strong]:font-semibold [&_strong]:text-slate-900 " +
  "[&_a]:font-semibold [&_a]:text-green-800 [&_a:hover]:underline " +
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:ps-5 " +
  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:ps-5 " +
  "[&_li]:marker:text-green-700 " +
  "[&_h1]:mt-6 [&_h1]:font-serif [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-900 " +
  "[&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 " +
  "[&_h3]:mt-5 [&_h3]:font-serif [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 " +
  "[&_table]:mt-4 [&_table]:w-full [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:p-2";

const InfoTable = ({ rows, lang }: { rows: IRow[]; lang: Lang }) => (
  <dl className="overflow-hidden rounded-xl border border-slate-200">
    {rows.map((row, i) => (
      <div
        key={i}
        className={`grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-[220px_1fr] sm:gap-4 ${
          i % 2 === 0 ? "bg-[#faf8f3]" : "bg-white"
        }`}
      >
        <dt className="text-start font-semibold text-slate-900">
          {t(row.label, lang)}
        </dt>
        <dd className="text-start text-slate-600">{t(row.value, lang)}</dd>
      </div>
    ))}
  </dl>
);

const ProductTabs = ({ product }: { product: IProduct }) => {
  const lang = useCurrentLang();
  const [selected, setSelected] = useState<TabId>("description");

  // Description: rich-text HTML, falling back to the short description
  const descriptionHtml = useMemo(() => {
    const raw = (t(product.desc, lang) || "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\u00a0/g, " ");
    return DOMPurify.sanitize(raw, {
      USE_PROFILES: { html: true },
      FORBID_ATTR: ["style", "class", "width", "height"],
    });
  }, [product.desc, lang]);

  const shortDesc = t(product.shortDesc, lang);
  const hasDescription = !!descriptionHtml.replace(/<[^>]*>/g, "").trim() || !!shortDesc;

  const specs = (product.specifications ?? []).filter(
    (r) => t(r.label, lang) || t(r.value, lang),
  );
  const packaging = (product.packagingAndDelivery ?? []).filter(
    (r) => t(r.label, lang) || t(r.value, lang),
  );
  const faqs = (product.faqs ?? []).filter((f) => t(f.question, lang));

  // Only show tabs that have content
  const tabs = (
    [
      hasDescription && "description",
      specs.length > 0 && "specifications",
      packaging.length > 0 && "packaging",
      faqs.length > 0 && "faqs",
    ] as (TabId | false)[]
  ).filter(Boolean) as TabId[];

  if (tabs.length === 0) return null;

  const tab = tabs.includes(selected) ? selected : tabs[0];

  return (
    <div className="rounded-2xl border border-[#e3e8df] bg-white shadow-sm">
      <div
        role="tablist"
        aria-label={t(INFO_LABEL, lang)}
        className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-3 scrollbar-none [&::-webkit-scrollbar]:hidden sm:px-5"
      >
        {tabs.map((id) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(id)}
              className={`relative shrink-0 whitespace-nowrap px-4 py-3 font-serif text-sm font-bold transition ${
                active
                  ? "text-green-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t(TAB_LABELS[id], lang)}
              <span
                className={`absolute inset-x-3 -bottom-px h-0.5 rounded-full transition ${
                  active ? "bg-green-800" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="p-5 sm:p-7">
        {tab === "description" &&
          (descriptionHtml.replace(/<[^>]*>/g, "").trim() ? (
            <div
              className={PROSE}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          ) : (
            <p className="max-w-3xl text-start text-sm leading-7 text-slate-600">
              {shortDesc}
            </p>
          ))}

        {tab === "specifications" && <InfoTable rows={specs} lang={lang} />}

        {tab === "packaging" && <InfoTable rows={packaging} lang={lang} />}

        {tab === "faqs" && (
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-slate-200 bg-[#faf8f3] px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-start font-serif text-sm font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {t(f.question, lang)}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 whitespace-pre-line text-start text-sm leading-6 text-slate-600">
                  {t(f.answer, lang)}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;