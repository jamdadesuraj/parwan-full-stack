"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useSyncExternalStore } from "react";
import { BsInstagram, BsTwitter, BsYoutube } from "react-icons/bs";
import { FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";

import { ILocalizedText, useGetSettingsQuery } from "@/store/settingApi";
import Logo from "./Logo";

type Lang = keyof ILocalizedText;

/* ---------- Static, translated UI labels (not managed in settings) ---------- */

const QUICK_LINKS: { label: ILocalizedText; href: string }[] = [
  { label: { en: "About Us", ar: "من نحن" }, href: "/aboutus" },
  { label: { en: "How to Order", ar: "كيفية الطلب" }, href: "/how-to-order" },
  {
    label: { en: "Products List", ar: "قائمة المنتجات" },
    href: "/products-list",
  },
  { label: { en: "Contact Us", ar: "اتصل بنا" }, href: "/contactus" },
];

const LEGAL_LINKS: { label: ILocalizedText; href: string }[] = [
  { label: { en: "FAQ's", ar: "الأسئلة الشائعة" }, href: "/faq" },
  { label: { en: "Terms of Service", ar: "شروط الخدمة" }, href: "/terms" },
  { label: { en: "Privacy Policy", ar: "سياسة الخصوصية" }, href: "/privacy" },
];

const HEADINGS = {
  quick: { en: "Quick Links", ar: "روابط سريعة" },
  legal: { en: "Legal Links", ar: "روابط قانونية" },
  contact: { en: "Get In Touch", ar: "تواصل معنا" },
};

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

/* ---------- Helpers ---------- */

/** Text for `lang`, falling back to English, then empty string. */
const t = (text: ILocalizedText | undefined, lang: Lang): string =>
  text?.[lang] || text?.en || "";

/** Accepts either a full URL or a plain phone number for WhatsApp. */
const waLink = (v: string) =>
  /^https?:\/\//i.test(v) ? v : `https://wa.me/${v.replace(/\D/g, "")}`;

/** Strips spaces so tel: links are valid. */
const telHref = (v: string) => `tel:${v.replace(/\s/g, "")}`;

/* ---------- Component ---------- */

const headingCls =
  "font-serif text-sm font-semibold uppercase tracking-widest text-black";
const linkCls =
  "text-sm font-semibold text-black transition-colors hover:text-green-400";
const rowCls = "flex items-start gap-3 text-sm font-semibold text-black";
const iconCls = "mt-0.5 h-4 w-4 shrink-0 text-green-400";

const Footer = () => {
  const lang = useCurrentLang();
  const { data: settings } = useGetSettingsQuery();

  const description = t(settings?.footerDesc, lang);
  const address = t(settings?.address, lang);
  const workingHrs = t(settings?.workingHrs, lang);
  const copyrights = t(settings?.footerCopyrights, lang);

  const phones = [settings?.mobileNo, settings?.alternateMobileNo].filter(
    Boolean,
  ) as string[];
  const mails = [settings?.mail, settings?.alternateEmail].filter(
    Boolean,
  ) as string[];

  // Only socials that are configured in settings are shown
  const socials = [
    { label: "Facebook", href: settings?.facebook, icon: FaFacebook },
    { label: "Instagram", href: settings?.instagram, icon: BsInstagram },
    { label: "Twitter", href: settings?.twitter, icon: BsTwitter },
    { label: "YouTube", href: settings?.youtube, icon: BsYoutube },
    { label: "LinkedIn", href: settings?.linkedin, icon: FaLinkedin },
    {
      label: "WhatsApp",
      href: settings?.whatsApp ? waLink(settings.whatsApp) : "",
      icon: FaWhatsapp,
    },
  ].filter((s): s is { label: string; href: string; icon: typeof FaFacebook } =>
    Boolean(s.href),
  );

  const hasContact =
    address || phones.length > 0 || mails.length > 0 || workingHrs;

  return (
    <footer
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="w-full bg-green-200 text-green-100"
    >
      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt="Logo"
                  width={160}
                  height={60}
                  className="h-14 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <Logo />
              )}
            </div>

            {description && (
              <p className="mt-4 max-w-xs text-start text-sm leading-6 text-black">
                {description}
              </p>
            )}

            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {socials.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white ring-1 ring-white/10 transition-colors hover:bg-green-500 hover:text-green-950"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h4 className={headingCls}>{t(HEADINGS.quick, lang)}</h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkCls}>
                    {t(link.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className={headingCls}>{t(HEADINGS.legal, lang)}</h4>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkCls}>
                    {t(link.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          {hasContact && (
            <div>
              <h4 className={headingCls}>{t(HEADINGS.contact, lang)}</h4>
              <ul className="mt-4 space-y-3.5">
                {address && (
                  <li className={rowCls}>
                    <MapPin className={iconCls} />
                    <span>{address}</span>
                  </li>
                )}

                {/* Phones: always LTR, even inside RTL */}
                {phones.length > 0 && (
                  <li className={rowCls}>
                    <Phone className={iconCls} />
                    <div className="flex flex-col gap-1">
                      {phones.map((p) => (
                        <Link
                          key={p}
                          href={telHref(p)}
                          dir="ltr"
                          className="hover:text-green-400"
                        >
                          {p}
                        </Link>
                      ))}
                    </div>
                  </li>
                )}

                {mails.length > 0 && (
                  <li className={rowCls}>
                    <Mail className={iconCls} />
                    <div className="flex flex-col gap-1 break-all">
                      {mails.map((m) => (
                        <Link
                          key={m}
                          href={`mailto:${m}`}
                          className="hover:text-green-400"
                        >
                          {m}
                        </Link>
                      ))}
                    </div>
                  </li>
                )}

                {workingHrs && (
                  <li className={rowCls}>
                    <Clock className={iconCls} />
                    <span>{workingHrs}</span>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      {copyrights && (
        <div className="border-t border-gray-400">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-6 text-center">
            <p className="text-xs font-semibold text-black">
              © {new Date().getFullYear()} {copyrights}
            </p>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
