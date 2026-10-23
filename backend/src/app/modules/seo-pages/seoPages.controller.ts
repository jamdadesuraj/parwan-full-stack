import { NextFunction, Request, Response } from "express";
import { SEOPages } from "./seopages.model";
import { SEOPagesSchema } from "./seoPages.validation";
import { appError } from "../../errors/appError";

export const createSeoPages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      aboutTitle,
      aboutSubTitle,
      servicesTitle,
      servicesSubTitle,
      servicesDetailsTitle,
      servicesDetailsSubTitle,
      productTitle,
      productSubTitle,
      productDetailsTitle,
      productDetailsSubTitle,
      newsTitle,
      newsSubTitle,
      newsDetailsTitle,
      newsDetailsSubTitle,
      careerTitle,
      careerSubTitle,
      contactTitle,
      contactSubTitle,
      awardTitle,
      awardSubTitle,
      ourPartnerTitle,
      ourPartnerSubTitle,
      mediaCoverageTitle,
      mediaCoverageSubTitle,
      galleryTitle,
      gallerySubTitle,
      faqTitle,
      faqSubTitle,
      privacyTitle,
      privacySubTitle,
      termsTitle,
      termsSubTitle,
    } = req.body;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const aboutBgImage = files?.aboutBgImage?.[0]?.path;
    const servicesBgImage = files?.servicesBgImage?.[0]?.path;
    const servicesDetailsBgImage = files?.servicesDetailsBgImage?.[0]?.path;
    const productBgImage = files?.productBgImage?.[0]?.path;
    const productDetailsBgImage = files?.productDetailsBgImage?.[0]?.path;
    const newsBgImage = files?.newsBgImage?.[0]?.path;
    const newsDetailsBgImage = files?.newsDetailsBgImage?.[0]?.path;
    const careerBgImage = files?.careerBgImage?.[0]?.path;
    const contactBgImage = files?.contactBgImage?.[0]?.path;
    const awardBgImage = files?.awardBgImage?.[0]?.path;
    const ourPartnerBgImage = files?.ourPartnerBgImage?.[0]?.path;
    const mediaCoverageBgImage = files?.mediaCoverageBgImage?.[0]?.path;
    const galleryBgImage = files?.galleryBgImage?.[0]?.path;
    const faqBgImage = files?.faqBgImage?.[0]?.path;
    const privacyBgImage = files?.privacyBgImage?.[0]?.path;
    const termsBgImage = files?.termsBgImage?.[0]?.path;

    // existing
    const existingData = await SEOPages.findOne({
      aboutTitle,
      aboutSubTitle,
      servicesTitle,
      servicesSubTitle,
      servicesDetailsTitle,
      servicesDetailsSubTitle,
      productTitle,
      productSubTitle,
      productDetailsTitle,
      productDetailsSubTitle,
      newsTitle,
      newsSubTitle,
      newsDetailsTitle,
      newsDetailsSubTitle,
      careerTitle,
      careerSubTitle,
      contactTitle,
      contactSubTitle,
      awardTitle,
      awardSubTitle,
      ourPartnerTitle,
      ourPartnerSubTitle,
      mediaCoverageTitle,
      mediaCoverageSubTitle,
      galleryTitle,
      gallerySubTitle,
      faqTitle,
      faqSubTitle,
      privacyTitle,
      privacySubTitle,
      termsTitle,
      termsSubTitle,
    });

    if (existingData) {
      return next(new Error("Data already exists"));
    }

    // validate
    const validateData = await SEOPagesSchema.parse({
      aboutTitle,
      aboutSubTitle,
      servicesTitle,
      servicesSubTitle,
      servicesDetailsTitle,
      servicesDetailsSubTitle,
      productTitle,
      productSubTitle,
      productDetailsTitle,
      productDetailsSubTitle,
      newsTitle,
      newsSubTitle,
      newsDetailsTitle,
      newsDetailsSubTitle,
      careerTitle,
      careerSubTitle,
      contactTitle,
      contactSubTitle,
      awardTitle,
      awardSubTitle,
      ourPartnerTitle,
      ourPartnerSubTitle,
      mediaCoverageTitle,
      mediaCoverageSubTitle,
      galleryTitle,
      gallerySubTitle,
      faqTitle,
      faqSubTitle,
      privacyTitle,
      privacySubTitle,
      termsTitle,
      termsSubTitle,
      aboutBgImage,
      servicesBgImage,
      servicesDetailsBgImage,
      productBgImage,
      productDetailsBgImage,
      newsBgImage,
      newsDetailsBgImage,
      careerBgImage,
      contactBgImage,
      awardBgImage,
      ourPartnerBgImage,
      mediaCoverageBgImage,
      galleryBgImage,
      faqBgImage,
      privacyBgImage,
      termsBgImage,
    });

    // /create
    const createSeoPages = await SEOPages.create(validateData);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SeoPages created successfully",
      data: createSeoPages,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllSeoPages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const getAllSeoPages = await SEOPages.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SeoPages retrieved successfully",
      data: getAllSeoPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getByIdSeoPages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const getByIdSeoPages = await SEOPages.findOne({ _id: req.params.id });

    if (!getByIdSeoPages) {
      return next(new appError("SeoPages not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SeoPages retrieved successfully",
      data: getByIdSeoPages,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSeoPages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seoPagesById = req.params.id;

    const validatedData = SEOPagesSchema.parse(req.body);

    const existingSeoPages = await SEOPages.findById(seoPagesById);

    if (!existingSeoPages) {
      return next(new appError("SeoPages not found", 404));
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (files?.aboutBgImage?.[0]) {
      validatedData.aboutBgImage = files.aboutBgImage[0].path;
    }

    if (files?.servicesBgImage?.[0]) {
      validatedData.servicesBgImage = files.servicesBgImage[0].path;
    }

    if (files?.servicesDetailsBgImage?.[0]) {
      validatedData.servicesDetailsBgImage =
        files.servicesDetailsBgImage[0].path;
    }

    if (files?.productBgImage?.[0]) {
      validatedData.productBgImage = files.productBgImage[0].path;
    }

    if (files?.productDetailsBgImage?.[0]) {
      validatedData.productDetailsBgImage = files.productDetailsBgImage[0].path;
    }

    if (files?.newsBgImage?.[0]) {
      validatedData.newsBgImage = files.newsBgImage[0].path;
    }

    if (files?.newsDetailsBgImage?.[0]) {
      validatedData.newsDetailsBgImage = files.newsDetailsBgImage[0].path;
    }

    if (files?.careerBgImage?.[0]) {
      validatedData.careerBgImage = files.careerBgImage[0].path;
    }

    if (files?.contactBgImage?.[0]) {
      validatedData.contactBgImage = files.contactBgImage[0].path;
    }

    if (files?.awardBgImage?.[0]) {
      validatedData.awardBgImage = files.awardBgImage[0].path;
    }

    if (files?.ourPartnerBgImage?.[0]) {
      validatedData.ourPartnerBgImage = files.ourPartnerBgImage[0].path;
    }

    if (files?.mediaCoverageBgImage?.[0]) {
      validatedData.mediaCoverageBgImage = files.mediaCoverageBgImage[0].path;
    }

    if (files?.galleryBgImage?.[0]) {
      validatedData.galleryBgImage = files.galleryBgImage[0].path;
    }

    if (files?.privacyBgImage?.[0]) {
      validatedData.privacyBgImage = files.privacyBgImage[0].path;
    }

    if (files?.termsBgImage?.[0]) {
      validatedData.termsBgImage = files.termsBgImage[0].path;
    }

    const updatedSeoPages = await SEOPages.findByIdAndUpdate(
      seoPagesById,
      validatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedSeoPages) {
      return next(new appError("SeoPages not found", 404));
    }

    await updatedSeoPages.save();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SeoPages updated successfully",
      data: updatedSeoPages,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSeoPages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deleteSeoPages = await SEOPages.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deleteSeoPages) {
      return next(new appError("SeoPages not found", 404));
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "SeoPages deleted successfully",
      data: deleteSeoPages,
    });

    return;
  } catch (error) {
    next(error);
  }
};
