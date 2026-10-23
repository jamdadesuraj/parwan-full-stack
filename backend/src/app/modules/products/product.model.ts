import mongoose, { Schema } from "mongoose";
import { IProducts, MAX_IMAGES } from "./product.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const rowSchema = new Schema(
  {
    label: { type: localizedText, required: true },
    value: { type: localizedText, required: true },
  },
  { _id: false },
);

const faqSchema = new Schema(
  {
    question: { type: localizedText, required: true },
    answer: { type: localizedText, required: true },
  },
  { _id: false },
);

const productsSchema: Schema = new Schema(
  {
    images: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= MAX_IMAGES,
        message: `A product needs between 1 and ${MAX_IMAGES} images`,
      },
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, unique: true, trim: true },

    productName: { type: localizedText, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    review: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "kg" },
    delPrice: { type: Number, min: 0 },
    minOrderQty: { type: Number, min: 0 },

    shortDesc: { type: localizedText, required: true },
    origin: { type: localizedText },
    grade: { type: localizedText },
    shelfLife: { type: localizedText },
    type: { type: localizedText },

    features: { type: [localizedText], default: [] },
    desc: { type: localizedText },
    specifications: { type: [rowSchema], default: [] },
    packagingAndDelivery: { type: [rowSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret: any) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        return ret;
      },
    },
  },
);

// 38 vs old price 50 -> 24
productsSchema.virtual("discountPercent").get(function (this: any) {
  if (this.delPrice && this.delPrice > this.price) {
    return Math.round(((this.delPrice - this.price) / this.delPrice) * 100);
  }
  return 0;
});

export const Products = mongoose.model<IProducts>("Products", productsSchema);
