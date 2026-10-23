"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutUsRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinary_1 = require("../../config/cloudinary");
const about_controller_1 = require("./about.controller");
const router = express_1.default.Router();
const imageFields = cloudinary_1.upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
]);
router.post("/", imageFields, about_controller_1.createAboutUs);
router.get("/", about_controller_1.getAboutUs);
router.put("/:id", imageFields, about_controller_1.updateAboutUs);
exports.aboutUsRouter = router;
