import { Document, Types } from "mongoose";

export const MAX_IMAGES = 10;

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IRow {
  label: ILocalizedText;
  value: ILocalizedText;
}

export interface IFaqItem {
  question: ILocalizedText;
  answer: ILocalizedText;
}

export interface IProducts extends Document {
  images: string[];
  category: Types.ObjectId;
  slug: string;
  productName: ILocalizedText;
  rating: number;
  review: number;
  price: number;
  unit: string; // "kg" -> shown as "/kg"
  delPrice?: number; // old price, shown struck through
  minOrderQty?: number;
  shortDesc: ILocalizedText;
  origin?: ILocalizedText;
  grade?: ILocalizedText;
  shelfLife?: ILocalizedText;
  type?: ILocalizedText;
  features: ILocalizedText[];
  desc?: ILocalizedText; // HTML from a rich-text editor
  specifications: IRow[];
  packagingAndDelivery: IRow[];
  faqs: IFaqItem[];
  discountPercent?: number; // virtual
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
