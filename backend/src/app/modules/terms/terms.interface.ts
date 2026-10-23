import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ITerms extends Document {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  content: ILocalizedText; // HTML from a rich-text editor
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
