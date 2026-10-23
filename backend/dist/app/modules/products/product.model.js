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
exports.Products = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const product_interface_1 = require("./product.interface");
const localizedText = new mongoose_1.Schema({
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
}, { _id: false });
const rowSchema = new mongoose_1.Schema({
    label: { type: localizedText, required: true },
    value: { type: localizedText, required: true },
}, { _id: false });
const faqSchema = new mongoose_1.Schema({
    question: { type: localizedText, required: true },
    answer: { type: localizedText, required: true },
}, { _id: false });
const productsSchema = new mongoose_1.Schema({
    images: {
        type: [String],
        validate: {
            validator: (v) => v.length >= 1 && v.length <= product_interface_1.MAX_IMAGES,
            message: `A product needs between 1 and ${product_interface_1.MAX_IMAGES} images`,
        },
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Categories",
        required: true,
        index: true,
    },
    slug: { type: String, required: true, unique: true, trim: true },
    productName: { type: localizedText, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    review: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "kg" },
    delPrice: { type: Number, min: 0 },
    minOrderQty: { type: Number, min: 0 },
    shortDesc: { type: localizedText, required: true },
    origin: { type: localizedText },
    grade: { type: localizedText },
    shelfLife: { type: localizedText },
    type: { type: localizedText },
    features: { type: [localizedText], default: [] },
    desc: { type: localizedText },
    specifications: { type: [rowSchema], default: [] },
    packagingAndDelivery: { type: [rowSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
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
// 38 vs old price 50 -> 24
productsSchema.virtual("discountPercent").get(function () {
    if (this.delPrice && this.delPrice > this.price) {
        return Math.round(((this.delPrice - this.price) / this.delPrice) * 100);
    }
    return 0;
});
exports.Products = mongoose_1.default.model("Products", productsSchema);
