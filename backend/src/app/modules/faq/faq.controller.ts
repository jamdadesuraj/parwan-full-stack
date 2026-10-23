import { NextFunction, Request, Response } from "express";
import { Faq } from "./faq.model";
import { appError } from "../../errors/appError";
import { faqSchema, updateFaqSchema } from "./faq.validation";

type Lang = "en" | "ar";
const FIELDS = [
  "question",
  "answer",
] as const;

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeFaq = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of FIELDS) {
    obj[field] = obj[field]?.[lang as Lang] ?? obj[field]?.en ?? "";
  }
  return obj;
};

export const createFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = faqSchema.parse(req.body);

    const existing = await Faq.findOne({
      "question.en": validateData.question.en,
      isDeleted: { $ne: true },
    });

    if (existing) {
      return next(new appError("FAQ already exists", 400));
    }

    const created = await Faq.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "FAQ created successfully",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await Faq.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: data.length > 0 ? "FAQ retrieved successfully" : "No FAQ found",
      data: data.map((d) => localizeFaq(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getFaqById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const faq = await Faq.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "FAQ retrieved successfully",
      data: localizeFaq(faq, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = updateFaqSchema.parse(req.body);

    // Dot-notation so updating only "ar" doesn't wipe "en"
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

    const updated = await Faq.findOneAndUpdate(
      { _id: req.params.id },
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return next(new appError("FAQ not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "FAQ updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const faq = await Faq.findOneAndDelete({ _id: req.params.id });

    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "FAQ deleted successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};
