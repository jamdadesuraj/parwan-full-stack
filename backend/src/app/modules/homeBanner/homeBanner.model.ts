import mongoose, { Schema } from "mongoose";
import { IHomeBanner } from "./homeBanner.interface";

const localizedText = {
  en: { type: String, required: true, trim: true },
  ar: { type: String, required: true, trim: true },
};

const homeBannerSchema: Schema = new Schema(
  {
    title: { type: new Schema(localizedText, { _id: false }), required: true },
    subTitle: {
      type: new Schema(localizedText, { _id: false }),
      required: true,
    },
    shortDesc: {
      type: new Schema(localizedText, { _id: false }),
      required: true,
    },
    bgVideo: { type: String, trim: true }, // image or video URL
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
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

export const HomeBanner = mongoose.model<IHomeBanner>(
  "HomeBanner",
  homeBannerSchema,
);