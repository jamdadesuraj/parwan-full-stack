"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enquiryRouter = void 0;
const express_1 = __importDefault(require("express"));
const enquiryForm_controller_1 = require("./enquiryForm.controller");
const router = express_1.default.Router();
router.post("/", enquiryForm_controller_1.createEnquiry); // public: the website modal
router.get("/", enquiryForm_controller_1.getAllEnquiries); // admin only
router.get("/:id", enquiryForm_controller_1.getEnquiryById); // admin only
router.patch("/:id/status", enquiryForm_controller_1.updateEnquiryStatus); // admin only
router.delete("/:id", enquiryForm_controller_1.deleteEnquiry); // admin only
exports.enquiryRouter = router;
