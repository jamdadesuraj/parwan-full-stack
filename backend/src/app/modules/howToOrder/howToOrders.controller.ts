import { NextFunction, Request, Response } from "express";

import { appError } from "../../errors/appError";
import {
  howToOrderSchema,
  updateHowToOrderSchema,
} from "./howToOrders.validation";
import { HowToOrder } from "./howToOrders.model";

type Lang = "en" | "ar";
const FIELDS = ["title", "subTitle", "shortDesc"] as const;

const pick = (value: any, lang: Lang) => value?.[lang] ?? value?.en ?? "";

// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeDoc = (doc: any, lang?: string) => {
  const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
  if (lang !== "en" && lang !== "ar") return obj;
  for (const field of FIELDS) {
    obj[field] = pick(obj[field], lang);
  }
  obj.steps = (obj.steps ?? []).map((s: any) => ({
    ...s,
    title: pick(s.title, lang),
    desc: pick(s.desc, lang),
  }));
  return obj;
};

export const createHowToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = howToOrderSchema.parse(req.body);

    const existing = await HowToOrder.findOne({
      "title.en": validateData.title.en,
      isDeleted: { $ne: true },
    });

    if (existing) {
      return next(new appError("How to order already exists", 400));
    }

    const created = await HowToOrder.create(validateData);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "How to order created successfully",
      data: created,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllHowToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lang = req.query.lang as string | undefined;
    const data = await HowToOrder.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "How to order retrieved successfully"
          : "No data found",
      data: data.map((d) => localizeDoc(d, lang)),
    });
  } catch (error) {
    next(error);
  }
};

export const getHowToOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await HowToOrder.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!doc) {
      return next(new appError("How to order not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "How to order retrieved successfully",
      data: localizeDoc(doc, req.query.lang as string | undefined),
    });
  } catch (error) {
    next(error);
  }
};

export const updateHowToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validated = updateHowToOrderSchema.parse(req.body);

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
    if (validated.steps) $set.steps = validated.steps;
    if (validated.isDeleted !== undefined) $set.isDeleted = validated.isDeleted;

    if (Object.keys($set).length === 0) {
      return next(new appError("No data provided to update", 400));
    }

    const updated = await HowToOrder.findByIdAndUpdate(
      req.params.id,
      { $set },
      { new: true, runValidators: true },
    );

    if (!updated) {
      return next(new appError("How to order not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "How to order updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHowToOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const doc = await HowToOrder.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new appError("How to order not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "How to order deleted successfully",
      data: doc,
    });
  } catch (error) {
    next(error);
  }
};
