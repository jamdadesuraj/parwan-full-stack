"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqRouter = void 0;
const express_1 = __importDefault(require("express"));
const faq_controller_1 = require("./faq.controller");
const router = express_1.default.Router();
router.post("/", faq_controller_1.createFaq);
router.get("/", faq_controller_1.getAllFaq);
router.get("/:id", faq_controller_1.getFaqById);
router.put("/:id", faq_controller_1.updateFaq);
router.delete("/:id", faq_controller_1.deleteFaq);
exports.faqRouter = router;
