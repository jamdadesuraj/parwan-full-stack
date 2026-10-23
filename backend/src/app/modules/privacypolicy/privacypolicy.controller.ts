import { NextFunction, Request, Response } from "express";
import { appError } from "../../errors/appError";
import { cleanHtml } from "../../utils/sanitize.helpers";
import { privacySchema, updatePrivacySchema } from "./privacypolicy.validation";
import { Privacy } from "./privacypolicy.model";

type Lang = "en" | "ar";

const TEXT_FIELDS = ["title", "subTitle", "shortDesc"] as const;
const ALL_FIELDS = [...TEXT_FIELDS, "content"] as const;

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizePrivacy = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of ALL_FIELDS) {
    obj[field] = obj[field]?.[lang as Lang] ?? obj[field]?.en ?? "";
  }
  return obj;
};

export const createPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = privacySchema.parse(req.body);

    // only the HTML field needs sanitizing
    validateData.content = {
      en: cleanHtml(validateData.content.en),
      ar: cleanHtml(validateData.content.ar),
    };

    const created = await Privacy.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Privacy policy created successfully",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await Privacy.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "Privacy policy retrieved successfully"
          : "No privacy policy found",
      data: data.map((d) => localizePrivacy(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getPrivacyPolicyById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await Privacy.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!doc) {
      return next(new appError("Privacy policy not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Privacy policy retrieved successfully",
      data: localizePrivacy(doc, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = updatePrivacySchema.parse(req.body);

    // Dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, string | boolean> = {};

    for (const field of ALL_FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        const text = value[lang];
        if (text === undefined) return;
        $set[`${field}.${lang}`] = field === "content" ? cleanHtml(text) : text;
      });
    }
    if (validated.isDeleted !== undefined) $set.isDeleted = validated.isDeleted;

    if (Object.keys($set).length === 0) {
      return next(new appError("No data provided to update", 400));
    }

    const updated = await Privacy.findOneAndUpdate(
      { _id: req.params.id },
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return next(new appError("Privacy policy not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Privacy policy updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
