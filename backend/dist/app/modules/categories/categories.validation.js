"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoriesSchema = exports.categoriesSchema = void 0;
const zod_1 = require("zod");
const localized = (label) => zod_1.z.object({
    en: zod_1.z
        .string()
        .trim()
        .min(2, `${label} (English) must be at least 2 characters`),
    ar: zod_1.z
        .string()
        .trim()
        .min(2, `${label} (Arabic) must be at least 2 characters`),
});
const partialLocalized = (label) => localized(label).partial().optional();
exports.categoriesSchema = zod_1.z.object({
    categoryName: localized("Category name"),
    categoryDesc: localized("Category description"),
    categoryImg: zod_1.z.string().min(1, "Category image is required"),
    isDeleted: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
exports.updateCategoriesSchema = zod_1.z.object({
    categoryName: partialLocalized("Category name"),
    categoryDesc: partialLocalized("Category description"),
    categoryImg: zod_1.z.string().optional(),
    isDeleted: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
});
