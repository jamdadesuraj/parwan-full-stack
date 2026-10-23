"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import {
  useCreateContactMutation,
  type ContactPayload,
} from "@/store/contactApi";
import { useGetSettingsQuery, type ILocalizedText } from "@/store/settingApi";

type Lang = keyof ILocalizedText;
type FormErrors = Partial<Record<keyof ContactPayload, string>>;
type SubmitStatus = "idle" | "success" | "error";

/* ------------------------------ Static content ----------------------------- */

const TEXT = {
  heading: {
    en: "Contact Parwan Roastery Abu Dhabi",
    ar: "تواصل مع محمصة بروان أبوظبي",
  },
  intro: {
    en: "Have a question, need help, or want to know more about our platform? Send us a message and our team will get back to you.",
    ar: "هل لديك سؤال أو تحتاج إلى مساعدة أو ترغب في معرفة المزيد عن منصتنا؟ أرسل لنا رسالة وسيرد عليك فريقنا.",
  },
  infoTitle: { en: "Contact Information", ar: "معلومات التواصل" },
  infoDesc: {
    en: "We’re here to help buyers connect better. Reach out to us through any of the channels below.",
    ar: "نحن هنا لمساعدة المشترين على التواصل بشكل أفضل. تواصل معنا عبر أي من القنوات أدناه.",
  },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  phone: { en: "Phone", ar: "الهاتف" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  online: { en: "Online", ar: "متصل" },
  address: { en: "Address", ar: "العنوان" },
  hours: { en: "Working Hours", ar: "ساعات العمل" },
  mapTitle: { en: "Our location on the map", ar: "موقعنا على الخريطة" },
  quickTitle: {
    en: "Need quick assistance?",
    ar: "هل تحتاج إلى مساعدة سريعة؟",
  },
  quickDesc: {
    en: "Our support team is available to help you with your questions.",
    ar: "فريق الدعم لدينا متاح لمساعدتك في أسئلتك.",
  },
  chatWhatsapp: { en: "Chat on WhatsApp", ar: "تحدث عبر واتساب" },
  whatsappMessage: {
    en: "Hello Parwan Roastery, I would like to enquire about your products.",
    ar: "مرحبًا محمصة بروان، أرغب في الاستفسار عن منتجاتكم.",
  },
  formTitle: { en: "How Can We Help You?", ar: "كيف يمكننا مساعدتك؟" },
  formDesc: {
    en: "Thank you for your interest in Parwan Roastery Abu Dhabi. Contact us with questions about our products, listed prices, availability and ordering arrangements. Complete the inquiry form below and our team can follow up using your preferred contact method.",
    ar: "شكرًا لاهتمامك بمحمصة بروان أبوظبي. تواصل معنا لأي أسئلة حول منتجاتنا وأسعارها وتوافرها وترتيبات الطلب. أكمل نموذج الاستفسار أدناه وسيتابع معك فريقنا بالطريقة التي تفضلها.",
  },
  submit: { en: "Submit Enquiry", ar: "إرسال الاستفسار" },
  submitting: { en: "Sending...", ar: "جارٍ الإرسال..." },
  success: {
    en: "Thank you! Your Enquiry has been sent. We will get back to you soon.",
    ar: "شكرًا لك! تم إرسال استفسارك وسنتواصل معك قريبًا.",
  },
  failure: {
    en: "Something went wrong. Please try again.",
    ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
  required: { en: "This field is required.", ar: "هذا الحقل مطلوب." },
  invalidEmail: {
    en: "Please enter a valid email address.",
    ar: "يرجى إدخال بريد إلكتروني صحيح.",
  },
  invalidPhone: {
    en: "Please enter a valid phone number.",
    ar: "يرجى إدخال رقم هاتف صحيح.",
  },
} satisfies Record<string, ILocalizedText>;

const FIELDS = {
  fullName: {
    label: { en: "Full Name", ar: "الاسم الكامل" },
    placeholder: { en: "Enter your name", ar: "أدخل اسمك" },
  },
  emailAddress: {
    label: { en: "Email Address", ar: "البريد الإلكتروني" },
    placeholder: { en: "Enter your email", ar: "أدخل بريدك الإلكتروني" },
  },
  phone: {
    label: { en: "Phone / WhatsApp No.", ar: "رقم الهاتف / واتساب" },
    placeholder: { en: "Enter your phone number", ar: "أدخل رقم هاتفك" },
  },
  companyName: {
    label: { en: "Company Name (optional)", ar: "اسم الشركة (اختياري)" },
    placeholder: { en: "Enter your company name", ar: "أدخل اسم شركتك" },
  },
  productOfInterest: {
    label: { en: "Product Of Interest", ar: "المنتج المطلوب" },
    placeholder: { en: "Enter product name", ar: "أدخل اسم المنتج" },
  },
  requiredQty: {
    label: { en: "Required Qty", ar: "الكمية المطلوبة" },
    placeholder: { en: "Enter qty", ar: "أدخل الكمية" },
  },
  message: {
    label: { en: "Message", ar: "الرسالة" },
    placeholder: { en: "Write your message here...", ar: "اكتب رسالتك هنا..." },
  },
} satisfies Record<
  keyof ContactPayload,
  { label: ILocalizedText; placeholder: ILocalizedText }
>;

const INITIAL_VALUES: ContactPayload = {
  fullName: "",
  emailAddress: "",
  phone: "",
  companyName: "",
  productOfInterest: "",
  requiredQty: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{6,}$/;
const MAPS_EMBED_PATTERN = /^https:\/\/www\.google\.com\/maps\/embed/i;

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
  useSyncExternalStore(subscribe, getLang, () => "en" as Lang);

/** Text for `lang`, falling back to English, then empty string. */
const t = (text: ILocalizedText | undefined, lang: Lang): string =>
  text?.[lang] || text?.en || "";

/* --------------------------------- Helpers -------------------------------- */

const isUrl = (v: string) => /^https?:\/\//i.test(v);
const telHref = (v: string) => `tel:${v.replace(/[^\d+]/g, "")}`;

/** Accepts a full URL or just a number; returns a wa.me link or undefined. */
const getWhatsAppUrl = (
  raw: string | undefined,
  message: string,
): string | undefined => {
  if (!raw) return undefined;
  if (isUrl(raw)) return raw;
  const digits = raw.replace(/\D/g, "");
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : undefined;
};

const validate = (values: ContactPayload, lang: Lang): FormErrors => {
  const errors: FormErrors = {};
  const required: (keyof ContactPayload)[] = [
    "fullName",
    "emailAddress",
    "phone",
    "message",
  ];

  required.forEach((key) => {
    if (!values[key].trim()) errors[key] = t(TEXT.required, lang);
  });

  if (!errors.emailAddress && !EMAIL_PATTERN.test(values.emailAddress.trim())) {
    errors.emailAddress = t(TEXT.invalidEmail, lang);
  }
  if (!errors.phone && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = t(TEXT.invalidPhone, lang);
  }

  return errors;
};

/* --------------------------------- Styles --------------------------------- */

const INPUT_CLASS =
  "w-full rounded-lg border bg-[#fafcf9] px-4 text-sm text-[#252525] outline-none transition placeholder:text-[#aaa] focus:ring-2";
const inputClass = (hasError: boolean, extra = "h-11") =>
  `${INPUT_CLASS} ${extra} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-[#dfe5da] focus:border-[#438c35] focus:ring-[#438c35]/10"
  }`;

const ICON_BOX =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white";
const LINK_CLASS =
  "mt-1 block font-serif text-sm font-semibold hover:text-green-600";

/* ------------------------------ Small components --------------------------- */

type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

const ContactRow = ({ icon, label, children }: ContactRowProps) => (
  <div className="flex items-start gap-4">
    <div className={ICON_BOX}>{icon}</div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-black">{label}</p>
      {children}
    </div>
  </div>
);

const ContactInfoSkeleton = () => (
  <div className="mt-8 animate-pulse space-y-6" aria-busy="true">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-white/70" />
        <div className="w-full space-y-2 pt-1">
          <div className="h-3 w-16 rounded bg-white/70" />
          <div className="h-4 w-3/4 rounded bg-white/70" />
        </div>
      </div>
    ))}
  </div>
);

type FieldProps = {
  name: keyof ContactPayload;
  lang: Lang;
  value: string;
  error?: string;
  type?: string;
  multiline?: boolean;
  onChange: (name: keyof ContactPayload, value: string) => void;
};

const Field = ({
  name,
  lang,
  value,
  error,
  type = "text",
  multiline = false,
  onChange,
}: FieldProps) => {
  const { label, placeholder } = FIELDS[name];
  const errorId = `${name}-error`;
  const common = {
    id: name,
    name,
    value,
    placeholder: t(placeholder, lang),
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-semibold text-[#333]"
      >
        {t(label, lang)}
      </label>

      {multiline ? (
        <textarea
          {...common}
          rows={5}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${inputClass(Boolean(error), "py-3")} resize-none`}
        />
      ) : (
        <input
          {...common}
          type={type}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass(Boolean(error))}
        />
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

/* -------------------------------- Component ------------------------------- */

const ContactUs = () => {
  const lang = useCurrentLang();
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Settings is a singleton: one object or null
  const { data: settings, isLoading: settingsLoading } = useGetSettingsQuery();

  const [createContact, { isLoading: isSubmitting }] =
    useCreateContactMutation();

  const [values, setValues] = useState<ContactPayload>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleChange = (name: keyof ContactPayload, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate(values, lang);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      await createContact({
        fullName: values.fullName.trim(),
        emailAddress: values.emailAddress.trim(),
        phone: values.phone.trim(),
        companyName: values.companyName.trim(),
        productOfInterest: values.productOfInterest.trim(),
        requiredQty: values.requiredQty.trim(),
        message: values.message.trim(),
      }).unwrap();

      setValues(INITIAL_VALUES);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  /* ---- Dynamic data from settings ---- */
  const phones = [settings?.mobileNo, settings?.alternateMobileNo].filter(
    Boolean,
  ) as string[];
  const mails = [settings?.mail, settings?.alternateEmail].filter(
    Boolean,
  ) as string[];
  const address = t(settings?.address, lang);
  const workingHrs = t(settings?.workingHrs, lang);
  const mapSrc =
    settings?.addressIframe && MAPS_EMBED_PATTERN.test(settings.addressIframe)
      ? settings.addressIframe
      : "";

  const whatsappRaw = settings?.whatsApp || settings?.mobileNo;
  const whatsappUrl = getWhatsAppUrl(
    whatsappRaw,
    t(TEXT.whatsappMessage, lang),
  );
  // If whatsApp holds a URL, show the mobile number as the label instead
  const whatsappLabel =
    settings?.whatsApp && !isUrl(settings.whatsApp)
      ? settings.whatsApp
      : settings?.mobileNo || "";

  return (
    <section
      dir={dir}
      lang={lang}
      className="min-h-screen bg-[#f8faf5] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-5 font-serif text-3xl font-bold text-gray-900 md:text-5xl">
            {t(TEXT.heading, lang)}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#666] sm:text-base">
            {t(TEXT.intro, lang)}
          </p>
        </div>

        {/* Content */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Contact Information */}
          <div className="rounded-2xl bg-green-200 p-6 text-black sm:p-8">
            <h2 className="font-serif text-xl font-bold">
              {t(TEXT.infoTitle, lang)}
            </h2>
            <p className="mt-3 text-sm leading-6 text-black">
              {t(TEXT.infoDesc, lang)}
            </p>

            {settingsLoading ? (
              <ContactInfoSkeleton />
            ) : (
              <div className="mt-8 space-y-6">
                {mails.length > 0 && (
                  <ContactRow
                    icon={<Mail size={20} />}
                    label={t(TEXT.email, lang)}
                  >
                    {mails.map((m) => (
                      <a key={m} href={`mailto:${m}`} className={LINK_CLASS}>
                        <bdi>{m}</bdi>
                      </a>
                    ))}
                  </ContactRow>
                )}

                {phones.length > 0 && (
                  <ContactRow
                    icon={<Phone size={20} />}
                    label={t(TEXT.phone, lang)}
                  >
                    {phones.map((p) => (
                      <a key={p} href={telHref(p)} className={LINK_CLASS}>
                        <bdi>{p}</bdi>
                      </a>
                    ))}
                  </ContactRow>
                )}

                {whatsappUrl && (
                  <div className="flex items-start gap-4">
                    {/* Blinking WhatsApp icon */}
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-xl bg-[#25D366] opacity-50"
                        aria-hidden="true"
                      />
                      <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#25D366] text-white">
                        <BsWhatsapp size={20} />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-xs font-medium text-black">
                        {t(TEXT.whatsapp, lang)}
                        <span className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                          {t(TEXT.online, lang)}
                        </span>
                      </p>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        <bdi>{whatsappLabel || t(TEXT.chatWhatsapp, lang)}</bdi>
                      </a>
                    </div>
                  </div>
                )}

                {address && (
                  <ContactRow
                    icon={<MapPin size={20} />}
                    label={t(TEXT.address, lang)}
                  >
                    <p className="mt-1 font-serif text-sm font-semibold">
                      {address}
                    </p>
                  </ContactRow>
                )}

                {workingHrs && (
                  <ContactRow
                    icon={<Clock size={20} />}
                    label={t(TEXT.hours, lang)}
                  >
                    <p className="mt-1 font-serif text-sm font-semibold">
                      {workingHrs}
                    </p>
                  </ContactRow>
                )}

                {mapSrc && (
                  <iframe
                    src={mapSrc}
                    title={t(TEXT.mapTitle, lang)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-56 w-full rounded-xl border-0"
                  />
                )}
              </div>
            )}

            {/* Bottom card */}
            {whatsappUrl && (
              <div className="mt-10 rounded-xl bg-white p-4">
                <p className="text-sm font-semibold">
                  {t(TEXT.quickTitle, lang)}
                </p>
                <p className="mt-1 text-xs leading-5 text-black">
                  {t(TEXT.quickDesc, lang)}
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-xs font-semibold text-white transition hover:bg-green-600"
                >
                  <BsWhatsapp size={14} aria-hidden="true" />
                  {t(TEXT.chatWhatsapp, lang)}
                </a>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-[#e3e8df] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-xl font-bold capitalize text-[#252525]">
              {t(TEXT.formTitle, lang)}
            </h2>
            <p className="mt-2 text-sm text-[#777]">{t(TEXT.formDesc, lang)}</p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="fullName"
                  lang={lang}
                  value={values.fullName}
                  error={errors.fullName}
                  onChange={handleChange}
                />
                <Field
                  name="emailAddress"
                  type="email"
                  lang={lang}
                  value={values.emailAddress}
                  error={errors.emailAddress}
                  onChange={handleChange}
                />
              </div>

              <Field
                name="phone"
                type="tel"
                lang={lang}
                value={values.phone}
                error={errors.phone}
                onChange={handleChange}
              />
              <Field
                name="companyName"
                lang={lang}
                value={values.companyName}
                error={errors.companyName}
                onChange={handleChange}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="productOfInterest"
                  lang={lang}
                  value={values.productOfInterest}
                  error={errors.productOfInterest}
                  onChange={handleChange}
                />
                <Field
                  name="requiredQty"
                  lang={lang}
                  value={values.requiredQty}
                  error={errors.requiredQty}
                  onChange={handleChange}
                />
              </div>

              <Field
                name="message"
                multiline
                lang={lang}
                value={values.message}
                error={errors.message}
                onChange={handleChange}
              />

              {/* Submit status */}
              <div aria-live="polite">
                {status === "success" && (
                  <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                    {t(TEXT.success, lang)}
                  </p>
                )}
                {status === "error" && (
                  <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {t(TEXT.failure, lang)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-lg bg-green-700 px-4 py-3 font-serif text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? t(TEXT.submitting, lang) : t(TEXT.submit, lang)}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
