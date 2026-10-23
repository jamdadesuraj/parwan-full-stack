"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("../errors/appError");
const admin_model_1 = require("../modules/admin/admin.model");
const adminAuth = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const header = req.headers.authorization;
        if (!(header === null || header === void 0 ? void 0 : header.startsWith("Bearer "))) {
            return next(new appError_1.appError("Authorization token missing", 401));
        }
        const token = header.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = yield admin_model_1.Admin.findById(decoded.id);
        if (!admin)
            return next(new appError_1.appError("Admin not found", 401));
        if (admin.status !== "active")
            return next(new appError_1.appError("Account is not active", 403));
        if (admin.role !== "admin")
            return next(new appError_1.appError("Admin access required", 403));
        req.admin = admin;
        next();
    }
    catch (_a) {
        next(new appError_1.appError("Invalid or expired token", 401));
    }
});
exports.adminAuth = adminAuth;
