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
exports.Enquiry = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const enquiryForm_interface_1 = require("./enquiryForm.interface");
const enquirySchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    companyName: { type: String, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 25 },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 150,
    },
    businessType: { type: String, enum: enquiryForm_interface_1.BUSINESS_TYPES, default: "retailer" },
    product: { type: String, required: true, trim: true, maxlength: 150 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: enquiryForm_interface_1.UNITS, default: "kg" },
    orderFrequency: {
        type: String,
        enum: enquiryForm_interface_1.ORDER_FREQUENCIES,
        default: "one_time",
    },
    qualityGrade: { type: String, enum: enquiryForm_interface_1.QUALITY_GRADES, default: "premium" },
    packaging: { type: String, enum: enquiryForm_interface_1.PACKAGING_TYPES, default: "loose_bulk" },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, trim: true, maxlength: 100, default: "UAE" },
    notes: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: enquiryForm_interface_1.ENQUIRY_STATUSES, default: "new" },
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
exports.Enquiry = mongoose_1.default.model("Enquiry", enquirySchema);
