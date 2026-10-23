import express from "express";
import { upload } from "../../config/cloudinary";
import { MAX_IMAGES } from "./product.interface";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductByIdOrSlug,
  updateProduct,
} from "./product.controller";

const router = express.Router();

const imagesUpload = upload.array("images", MAX_IMAGES);

router.post("/", imagesUpload, createProduct); // admin only
router.get("/", getAllProducts); // public
router.get("/:idOrSlug", getProductByIdOrSlug); // public
router.put("/:id", imagesUpload, updateProduct); // admin only
router.delete("/:id", deleteProduct); // admin only

export const productsRouter = router;
