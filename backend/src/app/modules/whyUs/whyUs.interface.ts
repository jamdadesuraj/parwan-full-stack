import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IFeature {
  icon: string;
  title: ILocalizedText;
  desc: ILocalizedText;
}

export interface IWhyChooseUs extends Document {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  desc: ILocalizedText;
  image: string;
  features: IFeature[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
