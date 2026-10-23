import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "./categories.controller";
import { upload } from "../../config/cloudinary";

const router = express.Router();

router.post("/", upload.single("categoryImg"), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", upload.single("categoryImg"), updateCategory);
router.delete("/:id", deleteCategory);

export const categoriesRouter = router;
