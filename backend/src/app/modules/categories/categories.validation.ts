import { z } from "zod";

const localized = (label: string) =>
  z.object({
    en: z
      .string()
      .trim()
      .min(2, `${label} (English) must be at least 2 characters`),
    ar: z
      .string()
      .trim()
      .min(2, `${label} (Arabic) must be at least 2 characters`),
  });

const partialLocalized = (label: string) =>
  localized(label).partial().optional();

export const categoriesSchema = z.object({

  categoryName: localized("Category name"),
  categoryDesc: localized("Category description"),
  categoryImg: z.string().min(1, "Category image is required"),
  isDeleted: z.boolean().optional(),
    status: z.enum(["active", "inactive"]).optional(),
});

export const updateCategoriesSchema = z.object({
  categoryName: partialLocalized("Category name"),
  categoryDesc: partialLocalized("Category description"),
  categoryImg: z.string().optional(),
  isDeleted: z.boolean().optional(),
    status: z.enum(["active", "inactive"]).optional(),
});
