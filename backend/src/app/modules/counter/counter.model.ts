import mongoose, { Schema } from "mongoose";
import { ICounter } from "./counter.interface";

const localizedText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const counterSchema: Schema = new Schema(
  {
    protected: { type: localizedText, required: true },
    Nopreservatives: { type: localizedText, required: true },
    Wereheretohelp: { type: localizedText, required: true },
    Happycustomers: { type: localizedText, required: true },
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

export const Counter = mongoose.model<ICounter>("Counter", counterSchema);
