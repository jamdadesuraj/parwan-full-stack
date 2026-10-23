import { Document } from "mongoose";

export interface ISEOPages extends Document {
  aboutTitle: string;
  aboutSubTitle: string;
  aboutBgImage: string;

  servicesTitle: string;
  servicesSubTitle: string;
  servicesBgImage: string;

  servicesDetailsTitle: string;
  servicesDetailsSubTitle: string;
  servicesDetailsBgImage: string;

  productTitle: string;
  productSubTitle: string;
  productBgImage: string;

  productDetailsTitle: string;
  productDetailsSubTitle: string;
  productDetailsBgImage: string;

  newsTitle: string;
  newsSubTitle: string;
  newsBgImage: string;

  newsDetailsTitle: string;
  newsDetailsSubTitle: string;
  newsDetailsBgImage: string;

  careerTitle: string;
  careerSubTitle: string;
  careerBgImage: string;

  contactTitle: string;
  contactSubTitle: string;
  contactBgImage: string;

  awardTitle: string;
  awardSubTitle: string;
  awardBgImage: string;

  ourPartnerTitle: string;
  ourPartnerSubTitle: string;
  ourPartnerBgImage: string;

  mediaCoverageTitle: string;
  mediaCoverageSubTitle: string;
  mediaCoverageBgImage: string;

  galleryTitle: string;
  gallerySubTitle: string;
  galleryBgImage: string;

  faqTitle: string;
  faqSubTitle: string;
  faqBgImage: string;

  privacyTitle: string;
  privacySubTitle: string;
  privacyBgImage: string;

  termsTitle: string;
  termsSubTitle: string;
  termsBgImage: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
