import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface ICounter extends Document {
  protected: ILocalizedText;
  Nopreservatives: ILocalizedText;
  Wereheretohelp: ILocalizedText;
  Happycustomers: ILocalizedText;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
