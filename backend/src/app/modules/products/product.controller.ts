/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextFunction, Request, Response } from "express";

import { Categories } from "../categories/categories.model";
import { appError } from "../../errors/appError";
import { cleanHtml } from "../../utils/sanitize.helpers";
import {
  deleteCloudinaryImages,
  parseJson,
} from "../../utils/cloudinary.helpers";
import { productSchema, updateProductSchema } from "./product.validation";
import { Products } from "./product.model";
import { MAX_IMAGES } from "./product.interface";

type Lang = "en" | "ar";

const LOCALIZED_FIELDS = [
  "productName",
  "shortDesc",
  "origin",
  "grade",
  "shelfLife",
  "type",
  "desc",
] as const;

const PLAIN_FIELDS = [
  "category",
  "rating",
  "review",
  "price",
  "unit",
  "delPrice",
  "minOrderQty",
] as const;

const ARRAY_FIELDS = [
  "features",
  "specifications",
  "packagingAndDelivery",
  "faqs",
] as const;

// uploaded files with upload.array("images", n)
const getImagePaths = (req: Request): string[] =>
  ((req.files as Express.Multer.File[] | undefined) ?? []).map((f) => f.path);

// text fields come from bracket notation; arrays come as JSON strings in form-data
const readBody = (body: Record<string, any>) => ({
  ...Object.fromEntries(
    [...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, body[f]]),
  ),
  ...Object.fromEntries(ARRAY_FIELDS.map((f) => [f, parseJson(body[f], f)])),
});

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";

const uniqueSlug = async (base: string) => {
  let slug = base;
  let i = 1;
  while (await Products.exists({ slug })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pick = (value: any, lang: Lang) => value?.[lang] || value?.en || "";

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeProduct = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;

  for (const field of LOCALIZED_FIELDS) {
    if (obj[field]) obj[field] = pick(obj[field], lang);
  }
  obj.features = (obj.features ?? []).map((f: any) => pick(f, lang));
  for (const key of ["specifications", "packagingAndDelivery"]) {
    obj[key] = (obj[key] ?? []).map((r: any) => ({
      label: pick(r.label, lang),
      value: pick(r.value, lang),
    }));
  }
  obj.faqs = (obj.faqs ?? []).map((f: any) => ({
    question: pick(f.question, lang),
    answer: pick(f.answer, lang),
  }));
  if (obj.category?.categoryName) {
    obj.category.categoryName = pick(obj.category.categoryName, lang);
  }
  return obj;
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const images = getImagePaths(req);
  try {
    if (images.length === 0) {
      return next(new appError("At least one image is required", 400));
    }

    const validateData = productSchema.parse({ ...readBody(req.body), images });

    const categoryExists = await Categories.exists({
      _id: validateData.category,
      isDeleted: { $ne: true },
    });
    if (!categoryExists) {
      await deleteCloudinaryImages(images);
      return next(new appError("Category not found", 404));
    }

    const duplicate = await Products.exists({
      "productName.en": validateData.productName.en,
      isDeleted: { $ne: true },
    });
    if (duplicate) {
      await deleteCloudinaryImages(images);
      return next(new appError("Product already exists", 400));
    }

    if (validateData.desc) {
      validateData.desc = {
        en: cleanHtml(validateData.desc.en),
        ar: cleanHtml(validateData.desc.ar),
      };
    }

    const slug = await uniqueSlug(slugify(validateData.productName.en));
    const created = await Products.create({ ...validateData, slug });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Product created successfully",
      data: created,
    });
  } catch (error) {
    await deleteCloudinaryImages(images); // don't orphan uploads
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };

    const category = req.query.category as string | undefined;
    if (category && /^[0-9a-fA-F]{24}$/.test(category)) {
      filter.category = category;
    }

    const search = (req.query.search as string | undefined)?.trim();
    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ "productName.en": regex }, { "productName.ar": regex }];
    }

    const [data, total] = await Promise.all([
      Products.find(filter)
        // timestamps are selected so the Categories toJSON transform doesn't output "Invalid Date"
        .populate("category", "categoryName categoryImg createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Products.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "Products retrieved successfully"
          : "No products found",
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data: data.map((d) => localizeProduct(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

// accepts either the product id or its slug
export const getProductByIdOrSlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const param = req.params.idOrSlug;
    // @ts-ignore
    const isId = /^[0-9a-fA-F]{24}$/.test(param);

    const product = await Products.findOne({
      ...(isId ? { _id: param } : { slug: param }),
      isDeleted: { $ne: true },
    }).populate("category", "categoryName categoryImg createdAt updatedAt");

    if (!product) {
      return next(new appError("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product retrieved successfully",
      data: localizeProduct(product, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newImages = getImagePaths(req);
  try {
    const existing = await Products.findById(req.params.id);
    if (!existing) {
      await deleteCloudinaryImages(newImages);
      return next(new appError("Product not found", 404));
    }

    const validated = updateProductSchema.parse({
      ...readBody(req.body),
      removeImages: parseJson(req.body.removeImages, "removeImages"),
    });

    if (validated.category) {
      const categoryExists = await Categories.exists({
        _id: validated.category,
        isDeleted: { $ne: true },
      });
      if (!categoryExists) {
        await deleteCloudinaryImages(newImages);
        return next(new appError("Category not found", 404));
      }
    }

    // Images: keep existing, drop the ones in removeImages, append new uploads
    const toRemove = (validated.removeImages ?? []).filter((u) =>
      existing.images.includes(u),
    );
    const finalImages = [
      ...existing.images.filter((u) => !toRemove.includes(u)),
      ...newImages,
    ];

    if (finalImages.length === 0) {
      await deleteCloudinaryImages(newImages);
      return next(new appError("A product needs at least one image", 400));
    }
    if (finalImages.length > MAX_IMAGES) {
      await deleteCloudinaryImages(newImages);
      return next(
        new appError(`A product can have at most ${MAX_IMAGES} images`, 400),
      );
    }

    // sending delPrice / minOrderQty as an empty value clears it
    const clearDelPrice = req.body.delPrice === "";
    const clearMinOrder = req.body.minOrderQty === "";

    const finalPrice = validated.price ?? existing.price;
    const finalDelPrice = clearDelPrice
      ? undefined
      : (validated.delPrice ?? existing.delPrice);
    if (finalDelPrice !== undefined && finalDelPrice <= finalPrice) {
      await deleteCloudinaryImages(newImages);
      return next(
        new appError("Old price (delPrice) must be greater than price", 400),
      );
    }

    // Dot-notation so updating only "ar" doesn't wipe "en"
    const $set: Record<string, unknown> = {};
    for (const field of LOCALIZED_FIELDS) {
      const value = validated[field];
      if (!value) continue;
      (Object.keys(value) as Lang[]).forEach((lang) => {
        const text = value[lang];
        if (text === undefined) return;
        $set[`${field}.${lang}`] = field === "desc" ? cleanHtml(text) : text;
      });
    }
    for (const field of PLAIN_FIELDS) {
      if (validated[field] !== undefined) $set[field] = validated[field];
    }
    for (const field of ARRAY_FIELDS) {
      if (validated[field]) $set[field] = validated[field];
    }
    if (validated.isDeleted !== undefined) $set.isDeleted = validated.isDeleted;
    if (toRemove.length > 0 || newImages.length > 0) $set.images = finalImages;

    const $unset: Record<string, 1> = {};
    if (clearDelPrice) $unset.delPrice = 1;
    if (clearMinOrder) $unset.minOrderQty = 1;

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
      await deleteCloudinaryImages(newImages);
      return next(new appError("No data provided to update", 400));
    }

    const updated = await Products.findByIdAndUpdate(
      req.params.id,
      {
        ...(Object.keys($set).length > 0 && { $set }),
        ...(Object.keys($unset).length > 0 && { $unset }),
      },
      { new: true, runValidators: true },
    );

    if (!updated) {
      await deleteCloudinaryImages(newImages);
      return next(new appError("Product not found", 404));
    }

    // Delete removed images only after a successful DB update
    await deleteCloudinaryImages(toRemove);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    await deleteCloudinaryImages(newImages); // don't orphan new uploads
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Products.findOneAndDelete({ _id: req.params.id });

    if (!product) {
      return next(new appError("Product not found", 404));
    }

    await deleteCloudinaryImages(product.images);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
