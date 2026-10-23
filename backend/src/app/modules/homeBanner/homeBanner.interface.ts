import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IHomeBanner extends Document {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  bgVideo?: string; // optional Cloudinary URL (image or video)
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}