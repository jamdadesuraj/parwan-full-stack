import express from "express";
import {
  createSeoPages,
  deleteSeoPages,
  getAllSeoPages,
  getByIdSeoPages,
  updateSeoPages,
} from "./seoPages.controller";
import { upload } from "../../config/cloudinary";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "aboutBgImage", maxCount: 1 },
  { name: "servicesBgImage", maxCount: 1 },
  { name: "servicesDetailsBgImage", maxCount: 1 },
  { name: "productBgImage", maxCount: 1 },
  { name: "productDetailsBgImage", maxCount: 1 },
  { name: "newsBgImage", maxCount: 1 },
  { name: "newsDetailsBgImage", maxCount: 1 },
  { name: "careerBgImage", maxCount: 1 },
  { name: "contactBgImage", maxCount: 1 },
  { name: "awardBgImage", maxCount: 1 },
  { name: "ourPartnerBgImage", maxCount: 1 },
  { name: "mediaCoverageBgImage", maxCount: 1 },
  { name: "galleryBgImage", maxCount: 1 },
  { name: "faqBgImage", maxCount: 1 },
  { name: "privacyBgImage", maxCount: 1 },
  { name: "termsBgImage", maxCount: 1 },
]);

router.post("/", uploadFields, createSeoPages);

// get all
router.get("/", getAllSeoPages);

// single get
router.get("/:id", getByIdSeoPages);

// update
router.put("/:id", uploadFields, updateSeoPages);

// delete
router.delete("/:id", deleteSeoPages);

export const seoPagesRouter = router;
