"use client";

import { useSyncExternalStore } from "react";
import type { ILocalizedText } from "@/store/productsApi";

export type Lang = keyof ILocalizedText;

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

export const useCurrentLang = (): Lang =>
  useSyncExternalStore(subscribe, getLang, () => "en" as Lang);

/** Text for `lang`, falling back to English, then empty string. */
export const t = (text: ILocalizedText | undefined, lang: Lang): string =>
  text?.[lang] || text?.en || "";

/* ---------- Money / units ---------- */

const CURRENCY: ILocalizedText = { en: "AED", ar: "د.إ" };

const formatPrice = (n: number) => Number(n.toFixed(2)).toString();

export const money = (n: number, lang: Lang) =>
  lang === "ar"
    ? `${formatPrice(n)} ${CURRENCY.ar}`
    : `${CURRENCY.en} ${formatPrice(n)}`;

const UNITS: Record<string, ILocalizedText> = {
  kg: { en: "kg", ar: "كجم" },
  gm: { en: "gm", ar: "جم" },
  g: { en: "g", ar: "جم" },
  pack: { en: "pack", ar: "عبوة" },
  piece: { en: "piece", ar: "قطعة" },
};

export const unitLabel = (unit: string | undefined, lang: Lang) => {
  if (!unit) return "";
  const u = UNITS[unit.toLowerCase()];
  return u ? t(u, lang) : unit;
};

/* ---------- WhatsApp ---------- */

/** Accepts a full URL or a plain phone number; adds a prefilled message for numbers. */
export const waLink = (value: string, text?: string) =>
  /^https?:\/\//i.test(value)
    ? value
    : `https://wa.me/${value.replace(/\D/g, "")}${
        text ? `?text=${encodeURIComponent(text)}` : ""
      }`;