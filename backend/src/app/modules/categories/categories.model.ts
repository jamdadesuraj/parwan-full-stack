import mongoose, { Schema } from "mongoose";
import { ICategories } from "./categories.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const categoriesSchema: Schema = new Schema(
  {
    categoryName: { type: localizedText, required: true },
    categoryDesc: { type: localizedText, required: true },
    categoryImg: { type: String, required: true, trim: true },
       status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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

export const Categories = mongoose.model<ICategories>(
  "Categories",
  categoriesSchema,
);
