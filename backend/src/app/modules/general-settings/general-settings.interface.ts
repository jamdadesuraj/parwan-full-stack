import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
}

export interface IGeneralSettings extends Document {
  logo?: string;
  favicon?: string;

  mobileNo?: string;
  alternateMobileNo?: string;

  mail?: string;
  alternateEmail?: string;

  address?: ILocalizedText;
  addressIframe?: string; // Google Maps embed URL (src only)
  workingHrs?: ILocalizedText;

  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  whatsApp?: string;

  footerDesc?: ILocalizedText;
  footerCopyrights?: ILocalizedText;

  createdAt: Date;
  updatedAt: Date;
}
