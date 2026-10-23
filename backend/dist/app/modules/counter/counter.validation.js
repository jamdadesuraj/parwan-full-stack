"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCounterSchema = exports.counterSchema = void 0;
const zod_1 = require("zod");
const localized = (label) => zod_1.z.object({
    en: zod_1.z.string().trim().min(1, `${label} (English) is required`),
    ar: zod_1.z.string().trim().min(1, `${label} (Arabic) is required`),
});
const partialLocalized = (label) => localized(label).partial().optional();
exports.counterSchema = zod_1.z.object({
    protected: localized("Protected"),
    Nopreservatives: localized("No preservatives"),
    Wereheretohelp: localized("We're here to help"),
    Happycustomers: localized("Happy customers"),
    isDeleted: zod_1.z.boolean().optional(),
});
exports.updateCounterSchema = zod_1.z.object({
    protected: partialLocalized("Protected"),
    Nopreservatives: partialLocalized("No preservatives"),
    Wereheretohelp: partialLocalized("We're here to help"),
    Happycustomers: partialLocalized("Happy customers"),
    isDeleted: zod_1.z.boolean().optional(),
});
