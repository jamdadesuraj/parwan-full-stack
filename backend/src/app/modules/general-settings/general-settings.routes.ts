import express from "express";
import { upload } from "../../config/cloudinary";
import {
  createGeneralSettings,
  getGeneralSettings,
  updateGeneralSettings,
} from "./general-settings.controller";

const router = express.Router();

const imageFields = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "favicon", maxCount: 1 },
]);

router.get("/", getGeneralSettings); // public: header, footer, contact page
router.post("/", imageFields, createGeneralSettings); // admin only: first-time create
router.put("/", imageFields, updateGeneralSettings); // admin only: update

export const generalSettingsRouter = router;
