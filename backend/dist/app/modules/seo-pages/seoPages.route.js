"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seoPagesRouter = void 0;
const express_1 = __importDefault(require("express"));
const seoPages_controller_1 = require("./seoPages.controller");
const cloudinary_1 = require("../../config/cloudinary");
const router = express_1.default.Router();
const uploadFields = cloudinary_1.upload.fields([
    { name: "aboutBgImage", maxCount: 1 },
    { name: "servicesBgImage", maxCount: 1 },
    { name: "servicesDetailsBgImage", maxCount: 1 },
    { name: "productBgImage", maxCount: 1 },
    { name: "productDetailsBgImage", maxCount: 1 },
    { name: "newsBgImage", maxCount: 1 },
    { name: "newsDetailsBgImage", maxCount: 1 },
    { name: "careerBgImage", maxCount: 1 },
    { name: "contactBgImage", maxCount: 1 },
    { name: "awardBgImage", maxCount: 1 },
    { name: "ourPartnerBgImage", maxCount: 1 },
    { name: "mediaCoverageBgImage", maxCount: 1 },
    { name: "galleryBgImage", maxCount: 1 },
    { name: "faqBgImage", maxCount: 1 },
    { name: "privacyBgImage", maxCount: 1 },
    { name: "termsBgImage", maxCount: 1 },
]);
router.post("/", uploadFields, seoPages_controller_1.createSeoPages);
// get all
router.get("/", seoPages_controller_1.getAllSeoPages);
// single get
router.get("/:id", seoPages_controller_1.getByIdSeoPages);
// update
router.put("/:id", uploadFields, seoPages_controller_1.updateSeoPages);
// delete
router.delete("/:id", seoPages_controller_1.deleteSeoPages);
exports.seoPagesRouter = router;
