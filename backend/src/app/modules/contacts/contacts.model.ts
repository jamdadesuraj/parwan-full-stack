import mongoose, { Schema } from "mongoose";
import { IContact } from "./contacts.interface";

const contactSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    phone: { type: String, required: true, trim: true, maxlength: 25 },
    companyName: { type: String, trim: true, maxlength: 150 },
    productOfInterest: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    requiredQty: { type: String, required: true, trim: true, maxlength: 50 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
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

export const Contact = mongoose.model<IContact>("Contact", contactSchema);
