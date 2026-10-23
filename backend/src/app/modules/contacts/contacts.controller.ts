import { NextFunction, Request, Response } from "express";

import { appError } from "../../errors/appError";
import { contactSchema } from "./contacts.validation";
import { Contact } from "./contacts.model";

export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validateData = contactSchema.parse(req.body);

    await Contact.create(validateData);

    // public endpoint: don't echo the stored document back
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Your enquiry has been sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const filter = { isDeleted: { $ne: true } };

    const [data, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Contact.countDocuments(filter),
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

export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });

    if (!contact) {
      return next(new appError("Enquiry not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Enquiry retrieved successfully",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!contact) {
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
