import mongoose, { Schema } from "mongoose";
import { IHowToOrder } from "./howToOrders.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const stepSchema = new Schema(
  {
    icon: { type: String, required: true, trim: true },
    title: { type: localizedText, required: true },
    desc: { type: localizedText, required: true },
  },
  { _id: false },
);

const howToOrderSchema: Schema = new Schema(
  {
    title: { type: localizedText, required: true },
    subTitle: { type: localizedText, required: true },
    shortDesc: { type: localizedText, required: true },
    steps: {
      type: [stepSchema],
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "At least one step is required",
      },
    },
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

export const HowToOrder = mongoose.model<IHowToOrder>(
  "HowToOrder",
  howToOrderSchema,
);
