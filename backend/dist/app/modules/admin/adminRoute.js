"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("./adminController");
const adminAuth_1 = require("../../middlewares/adminAuth");
const router = express_1.default.Router();
router.post("/signup", adminController_1.adminSignup);
router.post("/signin", adminController_1.adminLogin);
router.get("/me", adminAuth_1.adminAuth, adminController_1.getAdminProfile);
router.put("/change-credentials", adminAuth_1.adminAuth, adminController_1.changeAdminCredentials);
exports.adminAuthRouter = router;
