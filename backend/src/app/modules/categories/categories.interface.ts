import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ICategories extends Document {
  categoryName: ILocalizedText;
  categoryDesc: ILocalizedText;
  categoryImg: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
