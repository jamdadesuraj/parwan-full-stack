"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnquiryStatusSchema = exports.enquirySchema = void 0;
const zod_1 = require("zod");
const enquiryForm_interface_1 = require("./enquiryForm.interface");
// "" -> undefined, so empty optional inputs are not stored
const emptyToUndefined = (v) => (v === "" ? undefined : v);
exports.enquirySchema = zod_1.z.object({
    fullName: zod_1.z.string().trim().min(2, "Full name is required").max(100),
    companyName: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().trim().max(150).optional()),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[+()\d\s-]{6,25}$/, "Enter a valid phone number"),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .email("Enter a valid email address")
        .max(150),
    businessType: zod_1.z.enum(enquiryForm_interface_1.BUSINESS_TYPES).default("retailer"),
    product: zod_1.z.string().trim().min(2, "Product is required").max(150),
    quantity: zod_1.z.coerce.number().positive("Quantity must be greater than 0"),
    unit: zod_1.z.enum(enquiryForm_interface_1.UNITS).default("kg"),
    orderFrequency: zod_1.z.enum(enquiryForm_interface_1.ORDER_FREQUENCIES).default("one_time"),
    qualityGrade: zod_1.z.enum(enquiryForm_interface_1.QUALITY_GRADES).default("premium"),
    packaging: zod_1.z.enum(enquiryForm_interface_1.PACKAGING_TYPES).default("loose_bulk"),
    city: zod_1.z.string().trim().min(2, "City is required").max(100),
    country: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().trim().max(100).default("UAE")),
    notes: zod_1.z.preprocess(emptyToUndefined, zod_1.z.string().trim().max(2000).optional()),
});
exports.updateEnquiryStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(enquiryForm_interface_1.ENQUIRY_STATUSES),
});
