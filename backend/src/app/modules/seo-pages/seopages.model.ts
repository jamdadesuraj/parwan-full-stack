import mongoose, { Schema } from "mongoose";
import { ISEOPages } from "./seoPages.interface";

const seoPagesSchema: Schema<ISEOPages> = new Schema(
  {
    aboutTitle: { type: String, default: "" },
    aboutSubTitle: { type: String, default: "" },
    aboutBgImage: { type: String, default: "" },

    servicesTitle: { type: String, default: "" },
    servicesSubTitle: { type: String, default: "" },
    servicesBgImage: { type: String, default: "" },

    servicesDetailsTitle: { type: String, default: "" },
    servicesDetailsSubTitle: { type: String, default: "" },
    servicesDetailsBgImage: { type: String, default: "" },

    productTitle: { type: String, default: "" },
    productSubTitle: { type: String, default: "" },
    productBgImage: { type: String, default: "" },

    productDetailsTitle: { type: String, default: "" },
    productDetailsSubTitle: { type: String, default: "" },
    productDetailsBgImage: { type: String, default: "" },

    newsTitle: { type: String, default: "" },
    newsSubTitle: { type: String, default: "" },
    newsBgImage: { type: String, default: "" },

    newsDetailsTitle: { type: String, default: "" },
    newsDetailsSubTitle: { type: String, default: "" },
    newsDetailsBgImage: { type: String, default: "" },

    careerTitle: { type: String, default: "" },
    careerSubTitle: { type: String, default: "" },
    careerBgImage: { type: String, default: "" },

    contactTitle: { type: String, default: "" },
    contactSubTitle: { type: String, default: "" },
    contactBgImage: { type: String, default: "" },

    awardTitle: { type: String, default: "" },
    awardSubTitle: { type: String, default: "" },
    awardBgImage: { type: String, default: "" },

    ourPartnerTitle: { type: String, default: "" },
    ourPartnerSubTitle: { type: String, default: "" },
    ourPartnerBgImage: { type: String, default: "" },

    mediaCoverageTitle: { type: String, default: "" },
    mediaCoverageSubTitle: { type: String, default: "" },
    mediaCoverageBgImage: { type: String, default: "" },

    galleryTitle: { type: String, default: "" },
    gallerySubTitle: { type: String, default: "" },
    galleryBgImage: { type: String, default: "" },

    faqTitle: { type: String, default: "" },
    faqSubTitle: { type: String, default: "" },
    faqBgImage: { type: String, default: "" },

    privacyTitle: { type: String, default: "" },
    privacySubTitle: { type: String, default: "" },
    privacyBgImage: { type: String, default: "" },

    termsTitle: { type: String, default: "" },
    termsSubTitle: { type: String, default: "" },
    termsBgImage: { type: String, default: "" },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const SEOPages = mongoose.model<ISEOPages>("SEOPages", seoPagesSchema);
