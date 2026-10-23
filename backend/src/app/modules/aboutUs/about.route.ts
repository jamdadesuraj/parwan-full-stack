import express from "express";
import { upload } from "../../config/cloudinary";
import { createAboutUs, getAboutUs, updateAboutUs } from "./about.controller";

const router = express.Router();

const imageFields = upload.fields([
  { name: "img1", maxCount: 1 },
  { name: "img2", maxCount: 1 },
]);

router.post("/", imageFields, createAboutUs);
router.get("/", getAboutUs);
router.put("/:id", imageFields, updateAboutUs);

export const aboutUsRouter = router;
