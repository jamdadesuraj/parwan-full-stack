import { z } from "zod";

const localized = (label: string, min = 2) =>
  z.object({
    en: z
      .string()
      .trim()
      .min(min, `${label} (English) must be at least ${min} characters`),
    ar: z
      .string()
      .trim()
      .min(min, `${label} (Arabic) must be at least ${min} characters`),
  });

const optionalLocalized = (label: string, min = 2) =>
  localized(label, min).optional();
const partialLocalized = (label: string, min = 2) =>
  localized(label, min).partial().optional();

// "" -> undefined, so empty optional form rows are ignored
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const row = z.object({
  label: localized("Label", 1),
  value: localized("Value", 1),
});

const faqItem = z.object({
  question: localized("Question"),
  answer: localized("Answer"),
});

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category id");

export const productSchema = z
  .object({
    images: z.array(z.string()).min(1, "At least one image is required"),
    category: objectId,

    productName: localized("Product name"),
    rating: z.coerce.number().min(0).max(5).default(0),
    review: z.coerce.number().int().min(0).default(0),
    price: z.coerce.number().positive("Price must be greater than 0"),
    unit: z.string().trim().min(1).max(20).default("kg"),
    delPrice: z.preprocess(
      emptyToUndefined,
      z.coerce.number().positive().optional(),
    ),
    minOrderQty: z.preprocess(
      emptyToUndefined,
      z.coerce.number().positive().optional(),
    ),

    shortDesc: localized("Short description"),
    origin: optionalLocalized("Origin", 1),
    grade: optionalLocalized("Grade", 1),
    shelfLife: optionalLocalized("Shelf life", 1),
    type: optionalLocalized("Type", 1),

    features: z.array(localized("Feature")).default([]),
    desc: optionalLocalized("Description", 1),
    specifications: z.array(row).default([]),
    packagingAndDelivery: z.array(row).default([]),
    faqs: z.array(faqItem).default([]),
  })
  .refine((d) => d.delPrice === undefined || d.delPrice > d.price, {
    message: "Old price (delPrice) must be greater than price",
    path: ["delPrice"],
  });

export const updateProductSchema = z.object({
  category: z.preprocess(emptyToUndefined, objectId.optional()),

  productName: partialLocalized("Product name"),
  rating: z.preprocess(
    emptyToUndefined,
    z.coerce.number().min(0).max(5).optional(),
  ),
  review: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).optional(),
  ),
  price: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional(),
  ),
  unit: z.preprocess(
    emptyToUndefined,
    z.string().trim().min(1).max(20).optional(),
  ),
  delPrice: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional(),
  ),
  minOrderQty: z.preprocess(
    emptyToUndefined,
    z.coerce.number().positive().optional(),
  ),

  shortDesc: partialLocalized("Short description"),
  origin: partialLocalized("Origin", 1),
  grade: partialLocalized("Grade", 1),
  shelfLife: partialLocalized("Shelf life", 1),
  type: partialLocalized("Type", 1),
  desc: partialLocalized("Description", 1),

  // arrays are replaced as a whole, so every item must be complete
  features: z.array(localized("Feature")).optional(),
  specifications: z.array(row).optional(),
  packagingAndDelivery: z.array(row).optional(),
  faqs: z.array(faqItem).optional(),

  // image URLs to remove from the product
  removeImages: z.array(z.string()).optional(),
  isDeleted: z.boolean().optional(),
});
