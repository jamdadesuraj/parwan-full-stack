import mongoose, { Schema } from "mongoose";
import { IAboutUs } from "./about.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const highlightSchema = new Schema(
  {
    icon: { type: String, required: true, trim: true },
    title: { type: localizedText, required: true },
    desc: { type: localizedText, required: true },
  },
  { _id: false },
);

const aboutUsSchema: Schema = new Schema(
  {
    title: { type: localizedText, required: true },
    subTitle: { type: localizedText, required: true },
    highlightsTitle: { type: localizedText, required: true },
    shortDesc: { type: localizedText, required: true },
    img1: { type: String, required: true, trim: true },
    highlights: { type: [highlightSchema], default: [] },
    missionTitle: { type: localizedText, required: true },
    missionSubTitle: { type: localizedText, required: true },
    mission: { type: localizedText, required: true },
    vision: { type: localizedText, required: true },
    values: { type: [localizedText], default: [] },
    whoWeAreTitle: { type: localizedText },
    whoWeAresubTitle: { type: localizedText },
    whoWeAreHightlightTitle: { type: localizedText },
    whoWeAreDesc: { type: localizedText },
    img2: { type: String, required: true, trim: true },
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

export const AboutUs = mongoose.model<IAboutUs>("AboutUs", aboutUsSchema);
