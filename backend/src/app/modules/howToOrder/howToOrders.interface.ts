import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IStep {
  icon: string;
  title: ILocalizedText;
  desc: ILocalizedText;
}

export interface IHowToOrder extends Document {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  steps: IStep[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
