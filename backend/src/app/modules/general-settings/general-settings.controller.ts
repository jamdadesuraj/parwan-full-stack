/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from "express";

import {
  deleteCloudinaryImage,
  deleteCloudinaryImages,
  getUploadedPaths,
} from "../../utils/cloudinary.helpers";
import { GeneralSettings } from "./general-settings.model";
import { updateGeneralSettingsSchema } from "./general-settings.validation";

type Lang = "en" | "ar";

const LOCALIZED_FIELDS = [
  "address",
  "workingHrs",
  "footerDesc",
  "footerCopyrights",
] as const;

const PLAIN_FIELDS = [
  "mobileNo",
  "alternateMobileNo",
  "mail",
  "alternateEmail",
  "addressIframe",
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "youtube",
  "whatsApp",
] as const;

const IMAGE_FIELDS = ["logo", "favicon"] as const;

const getFile = (req: Request, name: string) => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  return files?.[name]?.[0]?.path;
};

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeSettings = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of LOCALIZED_FIELDS) {
    if (obj[field]) {
      obj[field] = obj[field][lang as Lang] || obj[field].en || "";
    }
  }
  return obj;
};

// POST: create the settings once. Fails if they already exist (use PUT to update).
export const createGeneralSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await GeneralSettings.findOne();
    if (existing) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return next(
        // @ts-ignore
        new appError("Settings already exist. Use PUT to update them.", 400),
      );
    }

    const validated = updateGeneralSettingsSchema.parse({
      ...Object.fromEntries(
        [...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, req.body[f]]),
      ),
      logo: getFile(req, "logo"),
      favicon: getFile(req, "favicon"),
    });

    // keep only the fields that were actually sent
    const data: Record<string, unknown> = {};
    for (const field of [
      ...LOCALIZED_FIELDS,
      ...PLAIN_FIELDS,
      ...IMAGE_FIELDS,
    ]) {
      const value = validated[field];
      if (value !== undefined && value !== "") data[field] = value;
    }

    if (Object.keys(data).length === 0) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      // @ts-ignore
      return next(new appError("No data provided", 400));
    }

    const created = await GeneralSettings.create(data);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Settings created successfully",
      data: created,
    });
  } catch (error) {
    await deleteCloudinaryImages(getUploadedPaths(req)); // don't orphan uploads
    next(error);
  }
};

export const getGeneralSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await GeneralSettings.findOne();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: settings
        ? "Settings retrieved successfully"
        : "Settings not created yet",
      data: settings
        ? localizeSettings(settings, req.query.lang as string | undefined)
        : null,
    });
  } catch (error) {
    next(error);
  }
};

// creates the settings on first save, updates them afterwards
export const updateGeneralSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await GeneralSettings.findOne();

    const validated = updateGeneralSettingsSchema.parse({
      ...Object.fromEntries(
        [...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, req.body[f]]),
      ),
      logo: getFile(req, "logo"),
      favicon: getFile(req, "favicon"),
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
    for (const field of PLAIN_FIELDS) {
      if (validated[field] !== undefined) $set[field] = validated[field];
    }
    for (const field of IMAGE_FIELDS) {
      if (validated[field]) $set[field] = validated[field];
    }

    if (Object.keys($set).length === 0) {
      await deleteCloudinaryImages(getUploadedPaths(req));
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "No data provided to update",
      });
    }

    const updated = await GeneralSettings.findOneAndUpdate(
      {},
      { $set },
      { new: true, upsert: true, runValidators: true },
    );

    // Delete replaced images only after a successful DB write
    for (const field of IMAGE_FIELDS) {
      if (validated[field] && existing?.get(field)) {
        await deleteCloudinaryImage(existing.get(field));
      }
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: existing
        ? "Settings updated successfully"
        : "Settings created successfully",
      data: updated,
    });
  } catch (error) {
    await deleteCloudinaryImages(getUploadedPaths(req)); // don't orphan new uploads
    next(error);
  }
};
