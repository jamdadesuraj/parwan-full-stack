"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whyChooseUsRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinary_1 = require("../../config/cloudinary");
const whyUs_controller_1 = require("./whyUs.controller");
const router = express_1.default.Router();
router.post("/", cloudinary_1.upload.single("image"), whyUs_controller_1.createWhyChooseUs);
router.get("/", whyUs_controller_1.getAllWhyChooseUs);
router.get("/:id", whyUs_controller_1.getWhyChooseUsById);
router.put("/:id", cloudinary_1.upload.single("image"), whyUs_controller_1.updateWhyChooseUs);
router.delete("/:id", whyUs_controller_1.deleteWhyChooseUs);
exports.whyChooseUsRouter = router;
