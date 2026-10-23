"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import ThemeBtnOne from "@/app/components/ThemeBtnOne";
import {
  useGetHomeBannerQuery,
  type IHomeBanner,
  type ILocalizedText,
} from "@/store/homeBannerApi";

/* -------------------------------------------------------------------------- */
/*                               Config & content                             */
/* -------------------------------------------------------------------------- */

type Lang = keyof ILocalizedText; // "en" | "ar"

const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD = 50;

const CTA = {
  primary: {
    label: { en: "Explore Our Products", ar: "تصفح منتجاتنا" },
    url: "/products-list",
  },
  secondary: {
    label: { en: "Contact Us for Orders", ar: "تواصل معنا للطلبات" },
    url: "/contactus",
  },
} as const;

const UI_TEXT = {
  carouselLabel: { en: "Homepage highlights", ar: "أبرز ما في الصفحة الرئيسية" },
  error: { en: "Something went wrong...", ar: "حدث خطأ ما..." },
  prev: { en: "Previous slide", ar: "الشريحة السابقة" },
  next: { en: "Next slide", ar: "الشريحة التالية" },
  goTo: { en: "Go to slide", ar: "الانتقال إلى الشريحة" },
} satisfies Record<string, ILocalizedText>;


const subscribeToHtmlLang = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang", "dir"],
  });
  return () => observer.disconnect();
};

const getHtmlLang = (): Lang => {
  const { lang, dir } = document.documentElement;
  return lang.toLowerCase().startsWith("ar") || dir === "rtl" ? "ar" : "en";
};

const useCurrentLang = (): Lang =>
  useSyncExternalStore(subscribeToHtmlLang, getHtmlLang, () => "en");

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/** Returns the text for `lang`, falling back to English, then empty string. */
const t = (text: ILocalizedText | undefined, lang: Lang) =>
  text?.[lang] || text?.en || "";

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

/** Staggered entrance animation for slide content. */
const reveal = (isActive: boolean, delay: string) =>
  `transition-all duration-700 ease-out ${
    isActive
      ? `translate-y-0 opacity-100 ${delay}`
      : "translate-y-6 opacity-0 delay-0"
  }`;

const SECTION_HEIGHT = "min-h-170 sm:min-h-160 lg:h-175 lg:min-h-0";
const CONTAINER = "mx-auto w-full max-w-8xl px-5 sm:px-10 lg:px-12 xl:px-16";
const ROUND_BTN =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-amber-400 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300";

/* -------------------------------------------------------------------------- */
/*                               Small components                             */
/* -------------------------------------------------------------------------- */

const HeroSkeleton = () => (
  <section
    className="relative w-full overflow-hidden bg-slate-950"
    aria-busy="true"
    aria-live="polite"
  >
    <div className={`relative ${SECTION_HEIGHT}`}>
      <div className="absolute inset-0 animate-pulse bg-linear-to-br from-slate-900 via-slate-800 to-slate-900" />

      <div
        className={`${CONTAINER} relative z-10 flex h-full items-center pb-28 pt-12`}
      >
        <div className="w-full max-w-2xl animate-pulse space-y-6">
          {/* heading */}
          <div className="space-y-3">
            <div className="h-10 w-4/5 rounded-lg bg-white/15 sm:h-12" />
            <div className="h-10 w-3/5 rounded-lg bg-amber-300/25 sm:h-12" />
          </div>

          {/* description */}
          <div className="max-w-xl space-y-3">
            <div className="h-4 w-full rounded bg-white/10" />
            <div className="h-4 w-11/12 rounded bg-white/10" />
            <div className="h-4 w-2/3 rounded bg-white/10" />
          </div>

          {/* buttons */}
          <div className="flex flex-wrap gap-3 pt-2 sm:gap-4">
            <div className="h-12 w-44 rounded-full bg-amber-300/30 sm:h-14" />
            <div className="h-12 w-48 rounded-full bg-white/15 sm:h-14" />
          </div>
        </div>
      </div>

      {/* controls placeholder */}
      <div className="absolute inset-x-0 bottom-0">
        <div className={`${CONTAINER} flex animate-pulse items-center gap-4 pb-6`}>
          <div className="h-4 w-14 rounded bg-white/15" />
          <div className="h-1 flex-1 rounded-full bg-white/20 sm:max-w-sm" />
        </div>
      </div>
    </div>
  </section>
);

const SlideBackground = ({
  src,
  alt,
  priority,
}: {
  src?: string;
  alt: string;
  priority: boolean;
}) => {
  if (!src) {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-slate-800" />
    );
  }

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="100vw"
      quality={90}
      className="object-cover object-center"
    />
  );
};

type SlideProps = {
  slide: IHomeBanner;
  index: number;
  total: number;
  isActive: boolean;
  lang: Lang;
};

const HeroSlide = ({ slide, index, total, isActive, lang }: SlideProps) => (
  <div
    role="group"
    aria-roledescription="slide"
    aria-label={`${index + 1} / ${total}`}
    aria-hidden={!isActive}
    {...(!isActive ? { inert: true } : {})}
    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
      isActive ? "opacity-100" : "pointer-events-none opacity-0"
    }`}
  >
    {/* Background (re-keyed on activation so the zoom restarts) */}
    <div
      key={isActive ? `bg-active-${slide._id}` : `bg-${slide._id}`}
      className="hero-zoom absolute inset-0"
      style={
        isActive
          ? { animation: `hero-zoom ${AUTOPLAY_MS + 2500}ms ease-out forwards` }
          : undefined
      }
    >
      <SlideBackground
        src={slide.bgVideo}
        alt={t(slide.title, lang)}
        priority={index === 0}
      />
    </div>

    {/* Overlays */}
    <div className="pointer-events-none absolute inset-0 bg-slate-950/55 lg:bg-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-linear-to-r rtl:bg-linear-to-l from-slate-950/85 via-slate-950/55 to-slate-950/10 max-lg:hidden" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-slate-950/80 to-transparent" />
    <div className="pointer-events-none absolute -inset-s-24 top-1/3 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" />

    {/* Content */}
    <div
      className={`${CONTAINER} relative z-10 flex h-full items-center pb-28 pt-12`}
    >
      <div className="w-full max-w-2xl">
        <h1
          className={`font-serif text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl ${reveal(
            isActive,
            "delay-200",
          )}`}
        >
          {t(slide.title, lang)}{" "}
          <span className="bg-linear-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            {t(slide.subTitle, lang)}
          </span>
        </h1>

        <p
          className={`mt-6 max-w-xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8 ${reveal(
            isActive,
            "delay-300",
          )}`}
        >
          {t(slide.shortDesc, lang)}
        </p>

        <div
          className={`mt-8 flex flex-wrap items-center gap-3 sm:gap-4 ${reveal(
            isActive,
            "delay-500",
          )}`}
        >
          <ThemeBtnOne
            text={t(CTA.primary.label, lang)}
            url={CTA.primary.url}
            className="rounded-full bg-amber-400 px-5 py-3 font-serif font-semibold text-nowrap text-slate-900 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:bg-amber-300 sm:px-7 sm:py-4"
          />
          <ThemeBtnOne
            text={t(CTA.secondary.label, lang)}
            url={CTA.secondary.url}
            className="rounded-full border border-white/40 bg-white/10 px-5 py-3 font-serif text-nowrap text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 sm:px-7 sm:py-4"
          />
        </div>
      </div>
    </div>
  </div>
);

type ControlsProps = {
  slides: IHomeBanner[];
  active: number;
  autoplay: boolean;
  paused: boolean;
  isRtl: boolean;
  lang: Lang;
  onGoTo: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
};

const HeroControls = ({
  slides,
  active,
  autoplay,
  paused,
  isRtl,
  lang,
  onGoTo,
  onPrev,
  onNext,
}: ControlsProps) => {
  const PrevIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      <div className={`${CONTAINER} flex items-center gap-4 pb-6`}>
        {/* Counter */}
        <p
          dir="ltr"
          aria-live="polite"
          className="w-14 shrink-0 font-serif text-sm font-semibold tabular-nums text-white"
        >
          {String(active + 1).padStart(2, "0")}
          <span className="text-white/50">
            {" "}
            / {String(slides.length).padStart(2, "0")}
          </span>
        </p>

        {/* Progress bars */}
        <div className="flex flex-1 items-center gap-2 sm:max-w-sm">
          {slides.map((slide, index) => {
            const isActive = index === active;
            const isDone = index < active;

            return (
              <button
                key={slide._id}
                type="button"
                onClick={() => onGoTo(index)}
                aria-label={`${UI_TEXT.goTo[lang]} ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                className="group relative h-6 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-colors group-hover:bg-white/40">
                  <span
                    key={isActive ? `active-${active}` : slide._id}
                    className={`block h-full rounded-full bg-amber-300 ${
                      isRtl ? "origin-right" : "origin-left"
                    }`}
                    style={
                      isActive && autoplay
                        ? {
                            animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                        : { transform: `scaleX(${isActive || isDone ? 1 : 0})` }
                    }
                    onAnimationEnd={isActive && autoplay ? onNext : undefined}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Arrows */}
        <div className="ms-auto hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={onPrev}
            aria-label={UI_TEXT.prev[lang]}
            className={ROUND_BTN}
          >
            <PrevIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label={UI_TEXT.next[lang]}
            className={ROUND_BTN}
          >
            <NextIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Main banner                               */
/* -------------------------------------------------------------------------- */

type HeroBannerProps = {
  /** Optional. If omitted, the language comes from useCurrentLang(). */
  lang?: Lang;
};

const HeroBanner = ({ lang: langProp }: HeroBannerProps) => {
  // Fetch only active banners (server-side filter)
  const {
    data: slides = [],
    isLoading,
    isError,
  } = useGetHomeBannerQuery({ status: "active" });

  // Same language as the rest of the site (header toggle)
  const siteLang = useCurrentLang();
  const lang = langProp ?? siteLang;
  const isRtl = lang === "ar";

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;
  const hasMultiple = total > 1;
  const autoplay = hasMultiple && !reduceMotion;

  /* ------------------------------ Motion prefs ----------------------------- */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ------------------------------- Navigation ------------------------------ */
  // Reset if the slide list shrinks below the active index
  useEffect(() => {
    if (active >= total && total > 0) setActive(0);
  }, [active, total]);

  const goTo = useCallback(
    (index: number) => {
      if (total) setActive(((index % total) + total) % total);
    },
    [total],
  );
  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);

  /* -------------------------------- Handlers ------------------------------- */
  // In RTL, "right" visually means previous
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") (isRtl ? prev : next)();
    if (e.key === "ArrowLeft") (isRtl ? next : prev)();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;

    const swipedLeft = delta < 0;
    (swipedLeft !== isRtl ? next : prev)();
  };

  /* --------------------------------- Render -------------------------------- */
  if (isLoading) return <HeroSkeleton />;

  if (isError) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="py-10 text-center">
        {UI_TEXT.error[lang]}
      </div>
    );
  }

  if (!total) return null;

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
      aria-roledescription="carousel"
      aria-label={UI_TEXT.carouselLabel[lang]}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative w-full overflow-hidden bg-slate-950 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber-300"
    >
      <style>{`
        @keyframes hero-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes hero-zoom {
          from { transform: scale(1.12); }
          to   { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-zoom { animation: none !important; }
        }
      `}</style>

      <div className={`relative ${SECTION_HEIGHT}`}>
        {slides.map((slide, index) => (
          <HeroSlide
            key={slide._id}
            slide={slide}
            index={index}
            total={total}
            isActive={index === active}
            lang={lang}
          />
        ))}

        {hasMultiple && (
          <HeroControls
            slides={slides}
            active={active}
            autoplay={autoplay}
            paused={paused}
            isRtl={isRtl}
            lang={lang}
            onGoTo={goTo}
            onPrev={prev}
            onNext={next}
          />
        )}
      </div>
    </section>
  );
};

export default HeroBanner;