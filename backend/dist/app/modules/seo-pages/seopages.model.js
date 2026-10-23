"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEOPages = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const seoPagesSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
exports.SEOPages = mongoose_1.default.model("SEOPages", seoPagesSchema);
