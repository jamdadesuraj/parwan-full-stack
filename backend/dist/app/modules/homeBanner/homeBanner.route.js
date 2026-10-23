"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.homeBannerRouter = void 0;
const express_1 = __importDefault(require("express"));
const homeBanner_controller_1 = require("./homeBanner.controller");
const cloudinary_1 = require("../../config/cloudinary");
const router = express_1.default.Router();
router.post("/", cloudinary_1.upload.single("bgVideo"), homeBanner_controller_1.createHomeBanner);
router.get("/", homeBanner_controller_1.getAllHomeBanner);
router.get("/:id", homeBanner_controller_1.homeBannerById);
router.put("/:id", cloudinary_1.upload.single("bgVideo"), homeBanner_controller_1.updateHomeBannerById);
router.delete("/:id", homeBanner_controller_1.deleteHomeBannerById);
exports.homeBannerRouter = router;
