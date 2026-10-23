import { z } from "zod";

const localized = (label: string) =>
  z.object({
    en: z.string().trim().min(1, `${label} (English) is required`),
    ar: z.string().trim().min(1, `${label} (Arabic) is required`),
  });

const partialLocalized = (label: string) =>
  localized(label).partial().optional();

export const counterSchema = z.object({
  protected: localized("Protected"),
  Nopreservatives: localized("No preservatives"),
  Wereheretohelp: localized("We're here to help"),
  Happycustomers: localized("Happy customers"),
  isDeleted: z.boolean().optional(),
});

export const updateCounterSchema = z.object({
  protected: partialLocalized("Protected"),
  Nopreservatives: partialLocalized("No preservatives"),
  Wereheretohelp: partialLocalized("We're here to help"),
  Happycustomers: partialLocalized("Happy customers"),
  isDeleted: z.boolean().optional(),
});
