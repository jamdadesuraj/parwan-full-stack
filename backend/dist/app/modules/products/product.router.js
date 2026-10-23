"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinary_1 = require("../../config/cloudinary");
const product_interface_1 = require("./product.interface");
const product_controller_1 = require("./product.controller");
const router = express_1.default.Router();
const imagesUpload = cloudinary_1.upload.array("images", product_interface_1.MAX_IMAGES);
router.post("/", imagesUpload, product_controller_1.createProduct); // admin only
router.get("/", product_controller_1.getAllProducts); // public
router.get("/:idOrSlug", product_controller_1.getProductByIdOrSlug); // public
router.put("/:id", imagesUpload, product_controller_1.updateProduct); // admin only
router.delete("/:id", product_controller_1.deleteProduct); // admin only
exports.productsRouter = router;
