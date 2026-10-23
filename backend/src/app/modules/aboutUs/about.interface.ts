import { Document } from "mongoose";

export interface ILocalizedText {
  en: string;
  ar: string;
} 

export interface IHighlight {
  icon: string;
  title: ILocalizedText;
  desc: ILocalizedText;
}

export interface IAboutUs extends Document {
  title: ILocalizedText;
  subTitle: ILocalizedText;
  highlightsTitle: ILocalizedText;
  shortDesc: ILocalizedText;
  img1: string;
  highlights: IHighlight[];
  missionTitle: ILocalizedText;
  missionSubTitle: ILocalizedText;
  mission: ILocalizedText;
  vision: ILocalizedText;
  values: ILocalizedText[];
  whoWeAreTitle?: ILocalizedText;
  whoWeAresubTitle?: ILocalizedText;
  whoWeAreHightlightTitle?: ILocalizedText;
  whoWeAreDesc?: ILocalizedText;
  img2: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
