import { NextFunction, Request, Response } from "express";
import { Counter } from "./counter.model";
import { appError } from "../../errors/appError";
import { counterSchema, updateCounterSchema } from "./counter.validation";

type Lang = "en" | "ar";
const FIELDS = [
  "protected",
  "Nopreservatives",
  "Wereheretohelp",
  "Happycustomers",
] as const;

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeCounter = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of FIELDS) {
    obj[field] = obj[field]?.[lang as Lang] ?? obj[field]?.en ?? "";
  }
  return obj;
};

export const createCounter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = counterSchema.parse(req.body);

    const existingData = await Counter.findOne({
      "protected.en": validateData.protected.en,
      "Nopreservatives.en": validateData.Nopreservatives.en,
      "Wereheretohelp.en": validateData.Wereheretohelp.en,
      "Happycustomers.en": validateData.Happycustomers.en,
    });

    if (existingData) {
      return next(new appError("Data already exists", 400));
    }

    const created = await Counter.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Counter created successfully",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCounterData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await Counter.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0 ? "Counter retrieved successfully" : "No counter found",
      data: data.map((d) => localizeCounter(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCounter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = updateCounterSchema.parse(req.body);

    // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, string | boolean> = {};
    for (const field of FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        if (value[lang] !== undefined) {
          $set[`${field}.${lang}`] = value[lang] as string;
        }
      });
    }
    if (validated.isDeleted !== undefined) $set.isDeleted = validated.isDeleted;

    if (Object.keys($set).length === 0) {
      return next(new appError("No data provided to update", 400));
    }

    const updated = await Counter.findOneAndUpdate(
      { _id: req.params.id },
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return next(new appError("Counter not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Counter updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
