"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privacyPolicyRouter = void 0;
const express_1 = __importDefault(require("express"));
const privacypolicy_controller_1 = require("./privacypolicy.controller");
const router = express_1.default.Router();
router.post("/", privacypolicy_controller_1.createPrivacyPolicy);
router.get("/", privacypolicy_controller_1.getAllPrivacyPolicy);
router.get("/:id", privacypolicy_controller_1.getPrivacyPolicyById);
router.put("/:id", privacypolicy_controller_1.updatePrivacyPolicy);
exports.privacyPolicyRouter = router;
