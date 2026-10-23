import { Document } from "mongoose";

export const BUSINESS_TYPES = [
  "retailer",
  "distributor",
  "hotel_restaurant",
  "caterer_sweet_shop",
  "exporter",
  "other",
] as const;
export const ORDER_FREQUENCIES = ["one_time", "weekly", "monthly"] as const;
export const QUALITY_GRADES = ["premium", "standard", "not_sure"] as const;
export const PACKAGING_TYPES = [
  "loose_bulk",
  "vacuum_packed",
  "retail_packs",
  "private_label",
] as const;
export const UNITS = [
  // weight
  "g",
  "kg",
  "ton",
  "oz",
  "lb",
  "ml",
  "l",
  "pcs",
  "dozen",
  "pack",
  "box",
  "carton",
  "bag",
  "sack",
  "tray",
  "tin",
  "jar",
  "bottle",
  "pallet",
  "container",
] as const;
export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;

export interface IEnquiryForm extends Document {
  fullName: string;
  companyName?: string;
  phone: string;
  email: string;
  businessType: (typeof BUSINESS_TYPES)[number];
  product: string;
  quantity: number;
  unit: (typeof UNITS)[number];
  orderFrequency: (typeof ORDER_FREQUENCIES)[number];
  qualityGrade: (typeof QUALITY_GRADES)[number];
  packaging: (typeof PACKAGING_TYPES)[number];
  city: string;
  country: string;
  notes?: string;
  status: (typeof ENQUIRY_STATUSES)[number];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
