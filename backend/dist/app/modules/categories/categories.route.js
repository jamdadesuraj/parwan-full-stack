"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = __importDefault(require("express"));
const categories_controller_1 = require("./categories.controller");
const cloudinary_1 = require("../../config/cloudinary");
const router = express_1.default.Router();
router.post("/", cloudinary_1.upload.single("categoryImg"), categories_controller_1.createCategory);
router.get("/", categories_controller_1.getAllCategories);
router.get("/:id", categories_controller_1.getCategoryById);
router.put("/:id", cloudinary_1.upload.single("categoryImg"), categories_controller_1.updateCategory);
router.delete("/:id", categories_controller_1.deleteCategory);
exports.categoriesRouter = router;
