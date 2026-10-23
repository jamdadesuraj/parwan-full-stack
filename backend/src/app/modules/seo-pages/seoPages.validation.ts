import { z } from "zod";

export const SEOPagesSchema = z.object({
  aboutTitle: z.string().optional(),
  aboutSubTitle: z.string().optional(),
  aboutBgImage: z.string().optional(),

  servicesTitle: z.string().optional(),
  servicesSubTitle: z.string().optional(),
  servicesBgImage: z.string().optional(),

  servicesDetailsTitle: z.string().optional(),
  servicesDetailsSubTitle: z.string().optional(),
  servicesDetailsBgImage: z.string().optional(),

  productTitle: z.string().optional(),
  productSubTitle: z.string().optional(),
  productBgImage: z.string().optional(),

  productDetailsTitle: z.string().optional(),
  productDetailsSubTitle: z.string().optional(),
  productDetailsBgImage: z.string().optional(),

  newsTitle: z.string().optional(),
  newsSubTitle: z.string().optional(),
  newsBgImage: z.string().optional(),

  newsDetailsTitle: z.string().optional(),
  newsDetailsSubTitle: z.string().optional(),
  newsDetailsBgImage: z.string().optional(),

  careerTitle: z.string().optional(),
  careerSubTitle: z.string().optional(),
  careerBgImage: z.string().optional(),

  contactTitle: z.string().optional(),
  contactSubTitle: z.string().optional(),
  contactBgImage: z.string().optional(),

  awardTitle: z.string().optional(),
  awardSubTitle: z.string().optional(),
  awardBgImage: z.string().optional(),

  ourPartnerTitle: z.string().optional(),
  ourPartnerSubTitle: z.string().optional(),
  ourPartnerBgImage: z.string().optional(),

  mediaCoverageTitle: z.string().optional(),
  mediaCoverageSubTitle: z.string().optional(),
  mediaCoverageBgImage: z.string().optional(),

  galleryTitle: z.string().optional(),
  gallerySubTitle: z.string().optional(),
  galleryBgImage: z.string().optional(),

  faqTitle: z.string().optional(),
  faqSubTitle: z.string().optional(),
  faqBgImage: z.string().optional(),

  privacyTitle: z.string().optional(),
  privacySubTitle: z.string().optional(),
  privacyBgImage: z.string().optional(),

  termsTitle: z.string().optional(),
  termsSubTitle: z.string().optional(),
  termsBgImage: z.string().optional(),

  isDeleted: z.boolean().optional().default(false),
});
