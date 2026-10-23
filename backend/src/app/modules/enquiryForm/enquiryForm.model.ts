import mongoose, { Schema } from "mongoose";
import {
  BUSINESS_TYPES,
  ENQUIRY_STATUSES,
  IEnquiryForm,
  ORDER_FREQUENCIES,
  PACKAGING_TYPES,
  QUALITY_GRADES,
  UNITS,
} from "./enquiryForm.interface";

const enquirySchema: Schema = new Schema(
  {
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
    businessType: { type: String, enum: BUSINESS_TYPES, default: "retailer" },

    product: { type: String, required: true, trim: true, maxlength: 150 },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: UNITS, default: "kg" },
    orderFrequency: {
      type: String,
      enum: ORDER_FREQUENCIES,
      default: "one_time",
    },
    qualityGrade: { type: String, enum: QUALITY_GRADES, default: "premium" },
    packaging: { type: String, enum: PACKAGING_TYPES, default: "loose_bulk" },

    city: { type: String, required: true, trim: true, maxlength: 100 },
    country: { type: String, trim: true, maxlength: 100, default: "UAE" },
    notes: { type: String, trim: true, maxlength: 2000 },

    status: { type: String, enum: ENQUIRY_STATUSES, default: "new" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.createdAt = new Date(ret.createdAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        ret.updatedAt = new Date(ret.updatedAt).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });
        return ret;
      },
    },
  },
);

export const Enquiry = mongoose.model<IEnquiryForm>("Enquiry", enquirySchema);
