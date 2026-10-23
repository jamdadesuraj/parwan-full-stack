"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faq = void 0;
const mongoose_1 = require("mongoose");
// { en, ar } sub-document (no extra _id)
const localizedText = new mongoose_1.Schema({
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
}, { _id: false });
const faqSchema = new mongoose_1.Schema({
    question: { type: localizedText, required: true },
    answer: { type: localizedText, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Faq = (0, mongoose_1.model)("Faq", faqSchema);
