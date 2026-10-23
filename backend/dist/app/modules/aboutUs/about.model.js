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
exports.AboutUs = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const localizedText = new mongoose_1.Schema({
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
}, { _id: false });
const highlightSchema = new mongoose_1.Schema({
    icon: { type: String, required: true, trim: true },
    title: { type: localizedText, required: true },
    desc: { type: localizedText, required: true },
}, { _id: false });
const aboutUsSchema = new mongoose_1.Schema({
    title: { type: localizedText, required: true },
    subTitle: { type: localizedText, required: true },
    highlightsTitle: { type: localizedText, required: true },
    shortDesc: { type: localizedText, required: true },
    img1: { type: String, required: true, trim: true },
    highlights: { type: [highlightSchema], default: [] },
    missionTitle: { type: localizedText, required: true },
    missionSubTitle: { type: localizedText, required: true },
    mission: { type: localizedText, required: true },
    vision: { type: localizedText, required: true },
    values: { type: [localizedText], default: [] },
    whoWeAreTitle: { type: localizedText },
    whoWeAresubTitle: { type: localizedText },
    whoWeAreHightlightTitle: { type: localizedText },
    whoWeAreDesc: { type: localizedText },
    img2: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
            });
            ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
            });
            return ret;
        },
    },
});
exports.AboutUs = mongoose_1.default.model("AboutUs", aboutUsSchema);
