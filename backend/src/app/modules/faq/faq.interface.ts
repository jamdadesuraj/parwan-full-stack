import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IFaq extends Document {
  question: ILocalizedText;
  answer: ILocalizedText;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
