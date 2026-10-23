import { Schema, model } from "mongoose";

// { en, ar } sub-document (no extra _id)
const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: localizedText, required: true },
    answer: { type: localizedText, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Faq = model("Faq", faqSchema);