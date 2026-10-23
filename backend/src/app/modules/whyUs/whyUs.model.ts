import mongoose, { Schema } from "mongoose";
import { IWhyChooseUs } from "./whyUs.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const featureSchema = new Schema(
  {
    icon: { type: String, required: true, trim: true },
    title: { type: localizedText, required: true },
    desc: { type: localizedText, required: true },
  },
  { _id: false },
);

const whyChooseUsSchema: Schema = new Schema(
  {
    title: { type: localizedText, required: true },
    subTitle: { type: localizedText, required: true },
    desc: { type: localizedText, required: true },
    image: { type: String, required: true, trim: true },
    features: {
      type: [featureSchema],
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "At least one feature is required",
      },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
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

export const WhyChooseUs = mongoose.model<IWhyChooseUs>(
  "WhyChooseUs",
  whyChooseUsSchema,
);
