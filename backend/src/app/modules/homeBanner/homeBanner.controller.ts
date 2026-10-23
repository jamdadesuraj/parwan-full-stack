/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { HomeBanner } from "./homeBanner.model";
import { appError } from "../../errors/appError";
import {
  homeBannerUpdateSchema,
  homeBannerSchema,
} from "./homeBanner.validation";
import { cloudinary } from "../../config/cloudinary";

type Lang = "en" | "ar";

// Only these fields are { en, ar } objects. `status` is a plain string.
const LOCALIZED_FIELDS = ["title", "subTitle", "shortDesc"] as const;

// "https://res.cloudinary.com/x/video/upload/v123/folder/abc.mp4" -> "folder/abc"
// (same pattern for /image/upload/ URLs)
const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
  return match ? match[1] : null;
};

// "https://res.cloudinary.com/x/image/upload/..." -> "image"
const getResourceTypeFromUrl = (url: string): "image" | "video" =>
  url.includes("/video/upload/") ? "video" : "image";

// Works for both images and videos
const deleteCloudinaryMedia = async (url?: string) => {
  if (!url) return;
  try {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: getResourceTypeFromUrl(url),
      });
    }
  } catch (err) {
    console.error("Cloudinary media deletion failed:", err);
  }
};

// ?lang=en|ar -> returns plain strings instead of { en, ar }
const localizeBanner = (banner: any, lang?: string) => {
  const obj = typeof banner.toJSON === "function" ? banner.toJSON() : banner;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of LOCALIZED_FIELDS) {
    obj[field] = obj[field]?.[lang as Lang] ?? obj[field]?.en ?? "";
  }
  return obj;
};

export const createHomeBanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, subTitle, shortDesc, status } = req.body;
    const bgVideo = req.file?.path; // optional image or video URL

    const validatedData = homeBannerSchema.parse({
      title,
      subTitle,
      shortDesc,
      bgVideo,
      status,
    });

    const existingHomeBanner = await HomeBanner.findOne({
      "title.en": validatedData.title.en,
      "title.ar": validatedData.title.ar,
    });

    if (existingHomeBanner) {
      await deleteCloudinaryMedia(bgVideo);
      return next(new appError("Banner already exists", 400));
    }

    const homeBanner = await HomeBanner.create(validatedData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Banner created successfully",
      data: homeBanner,
    });
  } catch (error) {
    await deleteCloudinaryMedia(req.file?.path);
    next(error);
  }
};

export const getAllHomeBanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const status = req.query.status as string | undefined;

    // Optional ?status=active|inactive filter
    const filter: Record<string, unknown> = {};
    if (status === "active" || status === "inactive") {
      filter.status = status;
    }

    const banners = await HomeBanner.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        banners.length > 0
          ? "Banner retrieved successfully"
          : "No banner found",
      data: banners.map((b) => localizeBanner(b, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const homeBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const homeBanner = await HomeBanner.findById(req.params.id);

    if (!homeBanner) {
      return next(new appError("Banner not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Banner retrieved successfully",
      data: localizeBanner(homeBanner, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateHomeBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const homeBannerId = req.params.id;

    const existingBanner = await HomeBanner.findById(homeBannerId);
    if (!existingBanner) {
      await deleteCloudinaryMedia(req.file?.path);
      return next(new appError("Home Banner not found", 404));
    }

    const { title, subTitle, shortDesc, status } = req.body;

    const validatedData = homeBannerUpdateSchema.parse({
      title,
      subTitle,
      shortDesc,
      status,
      ...(req.file?.path && { bgVideo: req.file.path }),
    });

    // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, string> = {};
    for (const field of LOCALIZED_FIELDS) {
      const value = validatedData[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        if (value[lang] !== undefined) {
          $set[`${field}.${lang}`] = value[lang] as string;
        }
      });
    }
    if (validatedData.bgVideo) $set.bgVideo = validatedData.bgVideo;
    if (validatedData.status) $set.status = validatedData.status;

    if (Object.keys($set).length === 0) {
      await deleteCloudinaryMedia(req.file?.path);
      return next(new appError("No data provided to update", 400));
    }

    const updatedHomeBanner = await HomeBanner.findByIdAndUpdate(
      homeBannerId,
      { $set },
      { new: true, runValidators: true },
    );

    if (!updatedHomeBanner) {
      await deleteCloudinaryMedia(req.file?.path);
      return next(new appError("Home Banner not found", 404));
    }

    // Delete old video only after successful DB update
    if (req.file?.path && existingBanner.bgVideo) {
      await deleteCloudinaryMedia(existingBanner.bgVideo);
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Home Banner updated successfully",
      data: updatedHomeBanner,
    });
  } catch (error) {
    await deleteCloudinaryMedia(req.file?.path); // don't orphan the new upload
    next(error);
  }
};

export const deleteHomeBannerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const homeBanner = await HomeBanner.findByIdAndDelete(req.params.id);

    if (!homeBanner) {
      return next(new appError("Banner not found", 404));
    }

    await deleteCloudinaryMedia(homeBanner.bgVideo);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Banner deleted successfully",
      data: homeBanner,
    });
  } catch (error) {
    next(error);
  }
};