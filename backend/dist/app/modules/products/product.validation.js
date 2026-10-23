"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.productSchema = void 0;
const zod_1 = require("zod");
const localized = (label, min = 2) => zod_1.z.object({
    en: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (English) must be at least ${min} characters`),
    ar: zod_1.z
        .string()
        .trim()
        .min(min, `${label} (Arabic) must be at least ${min} characters`),
});
const optionalLocalized = (label, min = 2) => localized(label, min).optional();
const partialLocalized = (label, min = 2) => localized(label, min).partial().optional();
// "" -> undefined, so empty optional form rows are ignored
const emptyToUndefined = (v) => (v === "" ? undefined : v);
const row = zod_1.z.object({
    label: localized("Label", 1),
    value: localized("Value", 1),
});
const faqItem = zod_1.z.object({
    question: localized("Question"),
    answer: localized("Answer"),
});
const objectId = zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category id");
exports.productSchema = zod_1.z
    .object({
    images: zod_1.z.array(zod_1.z.string()).min(1, "At least one image is required"),
    category: objectId,
    productName: localized("Product name"),
    rating: zod_1.z.coerce.number().min(0).max(5).default(0),
    review: zod_1.z.coerce.number().int().min(0).default(0),
    price: zod_1.z.coerce.number().positive("Price must be greater than 0"),
    unit: zod_1.z.string().trim().min(1).max(20).default("kg"),
    delPrice: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().positive().optional()),
    minOrderQty: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().positive().optional()),
    shortDesc: localized("Short description"),
    origin: optionalLocalized("Origin", 1),
    grade: optionalLocalized("Grade", 1),
    shelfLife: optionalLocalized("Shelf life", 1),
    type: optionalLocalized("Type", 1),
    features: zod_1.z.array(localized("Feature")).default([]),
    desc: optionalLocalized("Description", 1),
    specifications: zod_1.z.array(row).default([]),
    packagingAndDelivery: zod_1.z.array(row).default([]),
    faqs: zod_1.z.array(faqItem).default([]),
})
    .refine((d) => d.delPrice === undefined || d.delPrice > d.price, {
    message: "Old price (delPrice) must be greater than price",
    path: ["delPrice"],
});
exports.updateProductSchema = zod_1.z.object({
    category: zod_1.z.preprocess(emptyToUndefined, objectId.optional()),
    productName: partialLocalized("Product name"),
    rating: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().min(0).max(5).optional()),
    review: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().int().min(0).optional()),
    price: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().positive().optional()),
    unit: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().trim().min(1).max(20).optional()),
    delPrice: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().positive().optional()),
    minOrderQty: zod_1.z.preprocess(emptyToUndefined, zod_1.z.coerce.number().positive().optional()),
    shortDesc: partialLocalized("Short description"),
    origin: partialLocalized("Origin", 1),
    grade: partialLocalized("Grade", 1),
    shelfLife: partialLocalized("Shelf life", 1),
    type: partialLocalized("Type", 1),
    desc: partialLocalized("Description", 1),
    // arrays are replaced as a whole, so every item must be complete
    features: zod_1.z.array(localized("Feature")).optional(),
    specifications: zod_1.z.array(row).optional(),
    packagingAndDelivery: zod_1.z.array(row).optional(),
    faqs: zod_1.z.array(faqItem).optional(),
    // image URLs to remove from the product
    removeImages: zod_1.z.array(zod_1.z.string()).optional(),
    isDeleted: zod_1.z.boolean().optional(),
});
