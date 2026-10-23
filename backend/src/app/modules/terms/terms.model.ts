import mongoose, { Schema } from "mongoose";
import { ITerms } from "./terms.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const termsSchema: Schema = new Schema(
  {
    title: { type: localizedText, required: true },
    subTitle: { type: localizedText, required: true },
    shortDesc: { type: localizedText, required: true },
    content: { type: localizedText, required: true },
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

export const Terms = mongoose.model<ITerms>("Terms", termsSchema);
