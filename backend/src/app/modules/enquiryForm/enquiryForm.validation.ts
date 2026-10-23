import { z } from "zod";
import {
  BUSINESS_TYPES,
  ENQUIRY_STATUSES,
  ORDER_FREQUENCIES,
  PACKAGING_TYPES,
  QUALITY_GRADES,
  UNITS,
} from "./enquiryForm.interface";

// "" -> undefined, so empty optional inputs are not stored
const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const enquirySchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  companyName: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(150).optional(),
  ),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\d\s-]{6,25}$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(150),
  businessType: z.enum(BUSINESS_TYPES).default("retailer"),

  product: z.string().trim().min(2, "Product is required").max(150),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.enum(UNITS).default("kg"),
  orderFrequency: z.enum(ORDER_FREQUENCIES).default("one_time"),
  qualityGrade: z.enum(QUALITY_GRADES).default("premium"),
  packaging: z.enum(PACKAGING_TYPES).default("loose_bulk"),

  city: z.string().trim().min(2, "City is required").max(100),
  country: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(100).default("UAE"),
  ),
  notes: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES),
});
