import express from "express";

import { upload } from "../../config/cloudinary";
import {
  createWhyChooseUs,
  deleteWhyChooseUs,
  getAllWhyChooseUs,
  getWhyChooseUsById,
  updateWhyChooseUs,
} from "./whyUs.controller";

const router = express.Router();

router.post("/", upload.single("image"), createWhyChooseUs);
router.get("/", getAllWhyChooseUs);
router.get("/:id", getWhyChooseUsById);
router.put("/:id", upload.single("image"), updateWhyChooseUs);
router.delete("/:id", deleteWhyChooseUs);

export const whyChooseUsRouter = router;
