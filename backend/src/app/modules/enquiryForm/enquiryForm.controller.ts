import { NextFunction, Request, Response } from "express";

import { appError } from "../../errors/appError";
import {
  enquirySchema,
  updateEnquiryStatusSchema,
} from "./enquiryForm.validation";
import { Enquiry } from "./enquiryForm.model";
import { ENQUIRY_STATUSES } from "./enquiryForm.interface";

export const createEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = enquirySchema.parse(req.body);

    await Enquiry.create(validateData);

    // public endpoint: don't echo the stored document back
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Your quote request has been sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEnquiries = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter: Record<string, unknown> = { isDeleted: { $ne: true } };
    const status = req.query.status as string | undefined;
    if (status && (ENQUIRY_STATUSES as readonly string[]).includes(status)) {
      filter.status = status;
    }

    const [data, total] = await Promise.all([
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Enquiry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message:
        data.length > 0
          ? "Enquiries retrieved successfully"
          : "No enquiries found",
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const enquiry = await Enquiry.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!enquiry) {
      return next(new appError("Enquiry not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Enquiry retrieved successfully",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = updateEnquiryStatusSchema.parse(req.body);

    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { status } },
      { new: true },
    );

    if (!enquiry) {
      return next(new appError("Enquiry not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Status updated successfully",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// soft delete, so an accidental click doesn't lose a customer enquiry
export const deleteEnquiry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const enquiry = await Enquiry.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!enquiry) {
      return next(new appError("Enquiry not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
