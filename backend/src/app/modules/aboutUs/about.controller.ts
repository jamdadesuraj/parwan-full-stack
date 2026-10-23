import { NextFunction, Request, Response } from "express";
import { AboutUs } from "./about.model";
import { aboutUsSchema, aboutUsUpdateSchema } from "./about.validation";
import { appError } from "../../errors/appError";
import {
  deleteCloudinaryImage,
  deleteCloudinaryImages,
  getUploadedPaths,
  parseJson,
} from "../../utils/cloudinary.helpers";

type Lang = "en" | "ar";

const LOCALIZED_FIELDS = [
  "title",
  "subTitle",
  "highlightsTitle",
  "shortDesc",
  "missionTitle",
  "missionSubTitle",
  "mission",
  "vision",
  "whoWeAreTitle",
  "whoWeAresubTitle",
  "whoWeAreHightlightTitle",
  "whoWeAreDesc",
] as const;

const IMAGE_FIELDS = ["img1", "img2"] as const;

const getFile = (req: Request, name: string) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  return files?.[name]?.[0]?.path;
};

const pickLocalizedFromBody = (body: Record<string, any>) =>
  Object.fromEntries(LOCALIZED_FIELDS.map((f) => [f, body[f]]));

// ?lang=en|ar -> plain strings instead of { en, ar }
const pick = (value: any, lang: Lang) => value?.[lang] ?? value?.en ?? "";

const localizeDoc = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;

  for (const field of LOCALIZED_FIELDS) {
    if (obj[field]) obj[field] = pick(obj[field], lang);
  }
  obj.highlights = (obj.highlights ?? []).map((h: any) => ({
    ...h,
    title: pick(h.title, lang),
    desc: pick(h.desc, lang),
  }));
  obj.values = (obj.values ?? []).map((v: any) => pick(v, lang));
  return obj;
};

export const createAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const img1 = getFile(req, "img1");
    const img2 = getFile(req, "img2");

    if (!img1 || !img2) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(new appError("Both images (img1, img2) are required", 400));
    }

    const validateData = aboutUsSchema.parse({
      ...pickLocalizedFromBody(req.body),
      highlights: parseJson(req.body.highlights, "highlights"),
      values: parseJson(req.body.values, "values"),
      img1,
      img2,
    });

    const existing = await AboutUs.findOne({
      "title.en": validateData.title.en,
      isDeleted: { $ne: true },
    });

    if (existing) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(new appError("About Us already exists", 400));
    }

    const created = await AboutUs.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "About Us created successfully",
      data: created,
    });
  } catch (error) {
    await deleteCloudinaryImages(getUploadedPaths(req));
    next(error);
  }
};

export const getAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await AboutUs.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "About us retrieved successfully"
          : "No about us found",
      data: data.map((d) => localizeDoc(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await AboutUs.findById(req.params.id);
    if (!existing) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(new appError("About us not found", 404));
    }

    const validated = aboutUsUpdateSchema.parse({
      ...pickLocalizedFromBody(req.body),
      highlights: parseJson(req.body.highlights, "highlights"),
      values: parseJson(req.body.values, "values"),
      img1: getFile(req, "img1"),
      img2: getFile(req, "img2"),
    });

    // Dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, unknown> = {};
    for (const field of LOCALIZED_FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        if (value[lang] !== undefined) {
          $set[`${field}.${lang}`] = value[lang];
        }
      });
    }
    if (validated.highlights) $set.highlights = validated.highlights;
    if (validated.values) $set.values = validated.values;
    for (const key of IMAGE_FIELDS) {
      if (validated[key]) $set[key] = validated[key];
    }

    if (Object.keys($set).length === 0) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(new appError("No data provided to update", 400));
    }

    const updated = await AboutUs.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(new appError("About us not found", 404));
    }

    // Delete replaced images only after a successful DB update
    for (const key of IMAGE_FIELDS) {
      if (validated[key]) {
        await deleteCloudinaryImage(existing.get(key));
      }
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "About us updated successfully",
      data: updated,
    });
  } catch (error) {
    await deleteCloudinaryImages(getUploadedPaths(req)); // don't orphan new uploads
    next(error);
  }
};
