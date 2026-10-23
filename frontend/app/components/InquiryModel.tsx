"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Loader2,
  Send,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
} from "lucide-react";
import ThemeBtnOne from "./ThemeBtnOne";
import {
  useCreateProductEnquiryMutation,
  type BusinessType,
  type OrderFrequency,
  type QualityGrade,
  type PackagingType,
  type EnquiryUnit,
  type ProductEnquiryPayload,
} from "@/store/productEnquiriesApi";

/* ---------- Types ---------- */

type InquiryModelProps = {
  productName?: string;
  unit?: string;
};

/* Same keys as the API payload; quantity stays a string for the input */
type FormState = Omit<
  ProductEnquiryPayload,
  "quantity" | "companyName" | "notes"
> & {
  companyName: string;
  quantity: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormState | "form", string>>;
type Option<T extends string> = { value: T; label: string };

type RequestError = {
  status?: number | string;
  originalStatus?: number;
  data?: { message?: string; error?: string } | string;
  error?: string;
  message?: string; // plain JS Error
};

/* ---------- Options ---------- */

const BUSINESS_TYPES: Option<BusinessType>[] = [
  { value: "retailer", label: "Retailer" },
  { value: "distributor", label: "Distributor" },
  { value: "hotel_restaurant", label: "Hotel / Restaurant" },
  { value: "caterer_sweet_shop", label: "Caterer / Sweet Shop" },
  { value: "exporter", label: "Exporter" },
  { value: "other", label: "Other" },
];

const GRADES: Option<QualityGrade>[] = [
  { value: "premium", label: "Premium" },
  { value: "standard", label: "Standard" },
  { value: "not_sure", label: "Not sure" },
];

const PACKAGING: Option<PackagingType>[] = [
  { value: "loose_bulk", label: "Loose / Bulk" },
  { value: "vacuum_packed", label: "Vacuum Packed" },
  { value: "retail_packs", label: "Retail Packs" },
  { value: "private_label", label: "Private Label" },
];

const FREQUENCIES: Option<OrderFrequency>[] = [
  { value: "one_time", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const UNIT_OPTIONS: EnquiryUnit[] = [
  "kg",
  "ton",
  "carton",
  "pack",
  "box",
  "bag",
  "pcs",
];

const PRODUCT_SUGGESTIONS = [
  "Almonds",
  "Cashews",
  "Pistachios",
  "Walnuts",
  "Raisins",
  "Dates",
  "Figs",
  "Apricots",
  "Cinnamon",
  "Saffron",
  "Mixed Dry Fruits",
];

/* ---------- Styles ---------- */

const controlBase =
  "block w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-green-700 focus:ring-4 focus:ring-green-700/10";
const inputCls = `${controlBase} h-11`;
const textareaCls = `${controlBase} min-h-[96px] resize-none py-3`;
const noSpinner =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";
const gridCls = "grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2";
const fullWidth = "sm:col-span-2";

/* ---------- Helpers ---------- */

const getInitialState = (productName: string, unit: string): FormState => ({
  fullName: "",
  companyName: "",
  phone: "",
  email: "",
  businessType: "retailer",
  product: productName,
  quantity: "",
  unit: (UNIT_OPTIONS as string[]).includes(unit)
    ? (unit as EnquiryUnit)
    : "kg",
  qualityGrade: "premium",
  packaging: "loose_bulk",
  city: "",
  country: "UAE",
  orderFrequency: "one_time",
  notes: "",
});

/* Readable message from an RTK Query error or a plain Error */
const getErrorMessage = (err: unknown): string => {
  const e = (err ?? {}) as RequestError;

  if (typeof e.data === "string" && e.data.trim()) return e.data.slice(0, 200);
  if (e.data && typeof e.data === "object") {
    const msg = e.data.message || e.data.error;
    if (msg) return msg;
  }
  if (e.error) return e.error;
  if (e.message) return e.message;
  if (e.status) return `Request failed (status ${e.status}). Please try again.`;
  return "Something went wrong. Please try again.";
};

/* Server replied 2xx (record saved) but the body wasn't valid JSON */
const isSuccessfulParseError = (err: unknown): boolean => {
  const { status, originalStatus } = (err ?? {}) as RequestError;
  return (
    status === "PARSING_ERROR" &&
    typeof originalStatus === "number" &&
    originalStatus >= 200 &&
    originalStatus < 300
  );
};

/* ---------- Small components ---------- */

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 flex items-center gap-3">
    <h3 className="font-serif text-sm font-bold text-slate-900">{children}</h3>
    <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
  </div>
);

const Field = ({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`min-w-0 ${className}`}>
    <label className="mb-2 block text-xs font-semibold leading-none text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-[11px] leading-none text-red-600">{error}</p>
    )}
  </div>
);

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
              selected
                ? "border-green-800 bg-green-800 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-green-700 hover:text-green-800"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Main component ---------- */

const InquiryModel = ({ productName = "", unit = "kg" }: InquiryModelProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    getInitialState(productName, unit),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  const [createEnquiry, { isLoading: loading }] =
    useCreateProductEnquiryMutation();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined, form: undefined }));
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setSent(false);
      setErrors({});
      setForm(getInitialState(productName, unit));
    }, 200);
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your name";

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15)
      e.phone = "Enter a valid phone / WhatsApp number";

    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.product.trim()) e.product = "Which product do you need?";
    if (!form.quantity || Number(form.quantity) <= 0)
      e.quantity = "Enter the quantity";
    if (!form.city.trim()) e.city = "Enter delivery city";
    if (!form.country.trim()) e.country = "Enter country";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const payload: ProductEnquiryPayload = {
      fullName: form.fullName.trim(),
      companyName: form.companyName.trim() || undefined,
      phone: form.phone.trim(),
      email: form.email.trim(),
      businessType: form.businessType,
      product: form.product.trim(),
      quantity: Number(form.quantity),
      unit: form.unit,
      orderFrequency: form.orderFrequency,
      qualityGrade: form.qualityGrade,
      packaging: form.packaging,
      city: form.city.trim(),
      country: form.country.trim(),
      notes: form.notes.trim() || undefined,
    };

    try {
      const res = await createEnquiry(payload).unwrap();

      // Only an explicit success:false counts as a failure
      if (res?.success === false) {
        console.error("Enquiry rejected by server:", res);
        setErrors({
          form: res.message || "The server could not process your enquiry.",
        });
        return;
      }

      setSent(true);
    } catch (err) {
      if (isSuccessfulParseError(err)) {
        setSent(true);
        return;
      }

      console.error("Enquiry error:", err);
      setErrors({ form: getErrorMessage(err) });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        <ThemeBtnOne
          text="Enquiry Now"
          className="mt-3 h-11 w-full rounded-full border px-4 text-sm font-serif font-semibold text-nowrap cursor-pointer border-green-700 bg-green-700 text-white"
          icon={<ShoppingBag size={16} />}
        />
      </div>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-100 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => e.target === e.currentTarget && close()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-title"
          >
            <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#faf8f3] shadow-2xl sm:max-h-[90vh] sm:rounded-3xl">
              {/* Header */}
              <div className="relative bg-linear-to-br from-green-900 to-green-800 px-5 py-6 pr-16 text-white sm:px-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-200">
                  Wholesale Enquiry
                </p>
                <h2
                  id="inquiry-title"
                  className="mt-1.5 font-serif text-xl font-bold leading-tight sm:text-2xl"
                >
                  Request a Bulk Quote
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-green-100/80">
                  Tell us what you need and we&apos;ll reply with pricing within
                  24 hours.
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 sm:right-5 sm:top-5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sent ? (
                /* Success screen */
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-9 w-9 text-green-700" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-bold text-slate-900">
                    Enquiry Sent!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                    Thank you, {form.fullName.split(" ")[0]}. Our team will
                    contact you on {form.phone} or {form.email} with a quote for{" "}
                    {form.quantity} {form.unit} of {form.product}.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-7 h-11 rounded-xl bg-green-900 px-8 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6 sm:px-7">
                    {/* Your details */}
                    <section>
                      <SectionTitle>Your details</SectionTitle>
                      <div className={gridCls}>
                        <Field
                          label="Full name"
                          required
                          error={errors.fullName}
                        >
                          <input
                            ref={firstRef}
                            className={inputCls}
                            placeholder="e.g. Ahmed Khan"
                            value={form.fullName}
                            onChange={(e) => set("fullName", e.target.value)}
                          />
                        </Field>

                        <Field label="Company / Business name">
                          <input
                            className={inputCls}
                            placeholder="Your company"
                            value={form.companyName}
                            onChange={(e) => set("companyName", e.target.value)}
                          />
                        </Field>

                        <Field
                          label="Phone / WhatsApp"
                          required
                          error={errors.phone}
                        >
                          <input
                            type="tel"
                            inputMode="tel"
                            className={inputCls}
                            placeholder="+971 50 123 4567"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                          />
                        </Field>

                        <Field label="Email" required error={errors.email}>
                          <input
                            type="email"
                            className={inputCls}
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                          />
                        </Field>

                        <Field label="Business type" className={fullWidth}>
                          <ChipGroup
                            options={BUSINESS_TYPES}
                            value={form.businessType}
                            onChange={(v) => set("businessType", v)}
                          />
                        </Field>
                      </div>
                    </section>

                    {/* Your requirement */}
                    <section>
                      <SectionTitle>Your requirement</SectionTitle>
                      <div className={gridCls}>
                        <Field label="Product" required error={errors.product}>
                          <input
                            list="inquiry-products"
                            className={inputCls}
                            placeholder="Search or type a product"
                            value={form.product}
                            onChange={(e) => set("product", e.target.value)}
                          />
                          <datalist id="inquiry-products">
                            {PRODUCT_SUGGESTIONS.map((p) => (
                              <option key={p} value={p} />
                            ))}
                          </datalist>
                        </Field>

                        <Field
                          label="Quantity"
                          required
                          error={errors.quantity}
                        >
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min={1}
                              inputMode="decimal"
                              className={`${inputCls} ${noSpinner} min-w-0 flex-1`}
                              placeholder="e.g. 500"
                              value={form.quantity}
                              onChange={(e) => set("quantity", e.target.value)}
                            />
                            <div className="relative w-28 shrink-0">
                              <select
                                className={`${inputCls} appearance-none pr-9`}
                                value={form.unit}
                                onChange={(e) =>
                                  set("unit", e.target.value as EnquiryUnit)
                                }
                                aria-label="Quantity unit"
                              >
                                {UNIT_OPTIONS.map((u) => (
                                  <option key={u} value={u}>
                                    {u}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                          </div>
                        </Field>

                        <Field label="Order frequency" className={fullWidth}>
                          <ChipGroup
                            options={FREQUENCIES}
                            value={form.orderFrequency}
                            onChange={(v) => set("orderFrequency", v)}
                          />
                        </Field>

                        <Field label="Quality grade" className={fullWidth}>
                          <ChipGroup
                            options={GRADES}
                            value={form.qualityGrade}
                            onChange={(v) => set("qualityGrade", v)}
                          />
                        </Field>

                        <Field
                          label="Packaging preference"
                          className={fullWidth}
                        >
                          <ChipGroup
                            options={PACKAGING}
                            value={form.packaging}
                            onChange={(v) => set("packaging", v)}
                          />
                        </Field>
                      </div>
                    </section>

                    {/* Delivery */}
                    <section>
                      <SectionTitle>Delivery</SectionTitle>
                      <div className={gridCls}>
                        <Field label="City" required error={errors.city}>
                          <input
                            className={inputCls}
                            placeholder="e.g. Dubai"
                            value={form.city}
                            onChange={(e) => set("city", e.target.value)}
                          />
                        </Field>

                        <Field label="Country" required error={errors.country}>
                          <input
                            className={inputCls}
                            value={form.country}
                            onChange={(e) => set("country", e.target.value)}
                          />
                        </Field>

                        <Field label="Additional notes" className={fullWidth}>
                          <textarea
                            rows={3}
                            className={textareaCls}
                            placeholder="Target price, certifications, delivery date, samples needed..."
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                          />
                        </Field>
                      </div>
                    </section>

                    {errors.form && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
                      >
                        {errors.form}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col-reverse gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <p className="flex items-center justify-center gap-2 text-[11px] text-slate-500 sm:justify-start">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-green-700" />
                      Your details are kept private.
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:flex">
                      <button
                        type="button"
                        onClick={close}
                        className="h-11 rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-900 px-6 text-sm font-semibold text-white transition hover:bg-green-800 active:scale-[0.98] disabled:opacity-70"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        {loading ? "Sending..." : "Send Enquiry"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default InquiryModel;