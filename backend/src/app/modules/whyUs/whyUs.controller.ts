/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";

import { appError } from "../../errors/appError";

import { cloudinary } from "../../config/cloudinary";
import { updateWhyChooseUsSchema, whyChooseUsSchema } from "./whyUs.validation";
import { WhyChooseUs } from "./whyUs.model";

type Lang = "en" | "ar";
const FIELDS = ["title", "subTitle", "desc"] as const;

const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
  return match ? match[1] : null;
};

const deleteCloudinaryImage = async (url?: string) => {
  if (!url) return;
  try {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
  } catch (err) {
    console.error("Cloudinary image deletion failed:", err);
  }
};

// form-data sends everything as strings, so accept features as a JSON string
const parseFeatures = (features: unknown) => {
  if (typeof features !== "string") return features;
  try {
    return JSON.parse(features);
  } catch {
    throw new appError("features must be valid JSON", 400);
  }
};

// ?lang=en|ar -> plain strings instead of { en, ar }
const pick = (value: any, lang: Lang) => value?.[lang] ?? value?.en ?? "";

const localizeDoc = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of FIELDS) {
    obj[field] = pick(obj[field], lang);
  }
  obj.features = (obj.features ?? []).map((f: any) => ({
    ...f,
    title: pick(f.title, lang),
    desc: pick(f.desc, lang),
  }));
  return obj;
};

export const createWhyChooseUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const image = req.file?.path;
    if (!image) {
      return next(new appError("Image is required", 400));
    }

    const { title, subTitle, desc, features } = req.body;

    const validateData = whyChooseUsSchema.parse({
      title,
      subTitle,
      desc,
      image,
      features: parseFeatures(features),
    });

    const existing = await WhyChooseUs.findOne({
      "title.en": validateData.title.en,
      isDeleted: { $ne: true },
    });

    if (existing) {
      await deleteCloudinaryImage(image);
      return next(new appError("Section already exists", 400));
    }

    const created = await WhyChooseUs.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Why choose us created successfully",
      data: created,
    });
  } catch (error) {
    await deleteCloudinaryImage(req.file?.path);
    next(error);
  }
};

export const getAllWhyChooseUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await WhyChooseUs.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "Why choose us retrieved successfully"
          : "No data found",
      data: data.map((d) => localizeDoc(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getWhyChooseUsById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await WhyChooseUs.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!doc) {
      return next(new appError("Not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Why choose us retrieved successfully",
      data: localizeDoc(doc, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateWhyChooseUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await WhyChooseUs.findById(req.params.id);
    if (!existing) {
      await deleteCloudinaryImage(req.file?.path);
      return next(new appError("Not found", 404));
    }

    const { title, subTitle, desc, features } = req.body;

    const validated = updateWhyChooseUsSchema.parse({
      title,
      subTitle,
      desc,
      features: parseFeatures(features),
      ...(req.file?.path && { image: req.file.path }),
    });

    // Dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, unknown> = {};
    for (const field of FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        if (value[lang] !== undefined) {
          $set[`${field}.${lang}`] = value[lang];
        }
      });
    }
    if (validated.image) $set.image = validated.image;
    if (validated.features) $set.features = validated.features;

    if (Object.keys($set).length === 0) {
      await deleteCloudinaryImage(req.file?.path);
      return next(new appError("No data provided to update", 400));
    }

    const updated = await WhyChooseUs.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      await deleteCloudinaryImage(req.file?.path);
      return next(new appError("Not found", 404));
    }

    // Delete old image only after successful DB update
    if (req.file?.path && existing.image) {
      await deleteCloudinaryImage(existing.image);
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Why choose us updated successfully",
      data: updated,
    });
  } catch (error) {
    await deleteCloudinaryImage(req.file?.path);
    next(error);
  }
};

export const deleteWhyChooseUs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await WhyChooseUs.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new appError("Not found", 404));
    }

    await deleteCloudinaryImage(doc.image);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Why choose us deleted successfully",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
