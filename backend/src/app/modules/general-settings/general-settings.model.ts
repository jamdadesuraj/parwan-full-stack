import mongoose, { Schema } from "mongoose";
import { IGeneralSettings } from "./general-settings.interface";

const localizedText = new Schema(
  {
    en: { type: String, trim: true, default: "" },
    ar: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const generalSettingsSchema: Schema = new Schema(
  {
    logo: { type: String, trim: true },
    favicon: { type: String, trim: true },

    mobileNo: { type: String, trim: true },
    alternateMobileNo: { type: String, trim: true },

    mail: { type: String, trim: true, lowercase: true },
    alternateEmail: { type: String, trim: true, lowercase: true },

    address: { type: localizedText },
    addressIframe: { type: String, trim: true },
    workingHrs: { type: localizedText },

    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    youtube: { type: String, trim: true },
    whatsApp: { type: String, trim: true },

    footerDesc: { type: localizedText },
    footerCopyrights: { type: localizedText },
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

export const GeneralSettings = mongoose.model<IGeneralSettings>(
  "GeneralSettings",
  generalSettingsSchema,
);
