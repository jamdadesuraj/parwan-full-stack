"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLanguage, type Lang } from "./LanguageContext";

const OPTIONS: { value: Lang; label: string; aria: string }[] = [
  { value: "en", label: "EN", aria: "English" },
  { value: "ar", label: "عربي", aria: "العربية" },
];

const LanguageToggle = ({ className = "" }: { className?: string }) => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      dir="ltr" /* keep EN | عربي order fixed in both directions */
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-xs ${className}`}
    >
      <Globe className="ml-2 mr-1 h-4 w-4 text-slate-500" aria-hidden="true" />
      {OPTIONS.map((o) => {
        const active = lang === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setLang(o.value)}
            aria-pressed={active}
            aria-label={o.aria}
            className={`h-8 min-w-[44px] rounded-full px-3 text-xs font-bold transition ${
              active
                ? "bg-green-700 text-white"
                : "text-slate-600 hover:text-green-700"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageToggle;
