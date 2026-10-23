"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
// @ts-ignore
import { t, useCurrentLang } from "./i18n";


type ProductImagesProps = {
  images: string[];
  name: string;
};

const UI = {
  prev: { en: "Previous image", ar: "الصورة السابقة" },
  next: { en: "Next image", ar: "الصورة التالية" },
  goTo: { en: "Go to image", ar: "انتقل إلى الصورة" },
  show: { en: "Show image", ar: "عرض الصورة" },
  image: { en: "image", ar: "صورة" },
};

const ProductImages = ({ images, name }: ProductImagesProps) => {
  const lang = useCurrentLang();
  const isRtl = lang === "ar";

  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  const count = images.length;
  const go = (i: number) => setIndex((i + count) % count);

  if (count === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-[#f3ece0] sm:aspect-4/3" />
    );
  }

  return (
    <div className="min-w-0">
      {/* Main image */}
      <div
        className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f3ece0] shadow-[0_6px_20px_rgba(60,40,10,0.10)] sm:aspect-4/3"
        onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const diff = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(diff) > 40) {
            // swipe direction is mirrored in RTL
            const forward = isRtl ? diff > 0 : diff < 0;
            go(forward ? index + 1 : index - 1);
          }
          touchStart.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${isRtl ? "" : "-"}${index * 100}%)`,
          }}
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative h-full w-full shrink-0">
              <Image
                src={src}
                alt={`${name} ${t(UI.image, lang)} ${i + 1}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            {/* "Previous" sits at the start edge, "Next" at the end edge */}
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t(UI.prev, lang)}
              className="absolute inset-s-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5 rtl:hidden" />
              <ChevronRight className="hidden h-5 w-5 rtl:block" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t(UI.next, lang)}
              className="absolute inset-e-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow backdrop-blur-sm transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5 rtl:hidden" />
              <ChevronLeft className="hidden h-5 w-5 rtl:block" />
            </button>

            {/* Dots */}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${t(UI.goTo, lang)} ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-green-800" : "w-2 bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => go(i)}
              aria-label={`${t(UI.show, lang)} ${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-[#f3ece0] transition ${
                i === index
                  ? "border-green-800"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;