/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { Categories } from "./categories.model";
import { appError } from "../../errors/appError";
import {
  categoriesSchema,
  updateCategoriesSchema,
} from "./categories.validation";
import { cloudinary } from "../../config/cloudinary";

type Lang = "en" | "ar";

// Only these fields are stored as { en, ar }. `status` is a plain string.
const LOCALIZED_FIELDS = ["categoryName", "categoryDesc"] as const;

// "https://res.cloudinary.com/x/image/upload/v123/folder/abc.jpg" -> "folder/abc"
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

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeCategory = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of LOCALIZED_FIELDS) {
    obj[field] = obj[field]?.[lang as Lang] ?? obj[field]?.en ?? "";
  }
  return obj;
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryImg = req.file?.path;
    if (!categoryImg) {
      return next(new appError("Category image is required", 400));
    }

    const { categoryName, categoryDesc, status } = req.body;

    const validateData = categoriesSchema.parse({
      categoryName,
      categoryDesc,
      categoryImg,
      status,
    });

    const existing = await Categories.findOne({
      "categoryName.en": validateData.categoryName.en,
      isDeleted: { $ne: true },
    });

    if (existing) {
      await deleteCloudinaryImage(categoryImg);
      return next(new appError("Category already exists", 400));
    }

    const created = await Categories.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Category created successfully",
      data: created,
    });
  } catch (error) {
    await deleteCloudinaryImage(req.file?.path);
    next(error);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await Categories.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "Categories retrieved successfully"
          : "No categories found",
      data: data.map((d) => localizeCategory(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await Categories.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!category) {
      return next(new appError("Category not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category retrieved successfully",
      data: localizeCategory(category, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existing = await Categories.findById(req.params.id);
    if (!existing) {
      await deleteCloudinaryImage(req.file?.path);
      return next(new appError("Category not found", 404));
    }

    // `status` was missing here, which caused "status is not defined".
    const { categoryName, categoryDesc, status } = req.body;

    const validated = updateCategoriesSchema.parse({
      categoryName,
      categoryDesc,
      status,
      ...(req.file?.path && { categoryImg: req.file.path }),
    });

    // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, string | boolean> = {};
    for (const field of LOCALIZED_FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        if (value[lang] !== undefined) {
          $set[`${field}.${lang}`] = value[lang] as string;
        }
      });
    }

    // Plain (non-localized) fields
    if (validated.status) $set.status = validated.status;
    if (validated.categoryImg) $set.categoryImg = validated.categoryImg;

    if (Object.keys($set).length === 0) {
      return next(new appError("No data provided to update", 400));
    }

    const updated = await Categories.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      await deleteCloudinaryImage(req.file?.path);
      return next(new appError("Category not found", 404));
    }

    // Delete old image only after successful DB update
    if (req.file?.path && existing.categoryImg) {
      await deleteCloudinaryImage(existing.categoryImg);
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    await deleteCloudinaryImage(req.file?.path);
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await Categories.findOneAndDelete({ _id: req.params.id });

    if (!category) {
      return next(new appError("Category not found", 404));
    }

    await deleteCloudinaryImage(category.categoryImg);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};