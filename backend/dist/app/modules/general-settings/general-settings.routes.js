"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalSettingsRouter = void 0;
const express_1 = __importDefault(require("express"));
const cloudinary_1 = require("../../config/cloudinary");
const general_settings_controller_1 = require("./general-settings.controller");
const router = express_1.default.Router();
const imageFields = cloudinary_1.upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
]);
router.get("/", general_settings_controller_1.getGeneralSettings); // public: header, footer, contact page
router.post("/", imageFields, general_settings_controller_1.createGeneralSettings); // admin only: first-time create
router.put("/", imageFields, general_settings_controller_1.updateGeneralSettings); // admin only: update
exports.generalSettingsRouter = router;
