"use client";

import React, { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

import LanguageToggle from "./LanguageToggle";
import { useLanguage, type TKey } from "./LanguageContext";

const NAV_ITEMS: { key: TKey; href: string }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.about", href: "/aboutus" },
  { key: "nav.products", href: "/products-list" },
  { key: "nav.howToOrder", href: "/how-to-order" },
  { key: "nav.contact", href: "/contactus" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { t, lang } = useLanguage();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Arabic reads better without wide letter-spacing
  const tracking = lang === "ar" ? "tracking-normal" : "tracking-wider";

  return (
    <header className="relative z-50 w-full border-b border-rose-100 bg-white shadow-xs">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:h-18 lg:px-8">
        {/* Logo */}
        <Logo />

        {/* Desktop nav */}
        <div ref={navRef} className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative cursor-pointer rounded-md px-3 py-2 font-serif text-[15px] font-semibold ${tracking} transition-all duration-200 ${
                isActive(item.href)
                  ? "text-green-700 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-green-700"
                  : "text-slate-800 hover:text-green-700"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <LanguageToggle />
        </div>

        {/* Mobile: language + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen(true)}
            aria-label={t("nav.openMenu")}
            className="rounded-md p-2 text-slate-800 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-60 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Panel: end-0 opens from the right in English, the left in Arabic */}
          <div className="absolute inset-e-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label={t("nav.closeMenu")}
                className="rounded-full bg-rose-500 p-2 text-white hover:bg-rose-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-3">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block cursor-pointer rounded-lg px-3 py-3.5 font-serif text-[14px] font-semibold ${tracking} ${
                    isActive(item.href)
                      ? "bg-green-50 text-green-700"
                      : "text-slate-800"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
