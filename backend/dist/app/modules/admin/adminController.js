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
exports.changeAdminCredentials = exports.getAdminProfile = exports.adminLogin = exports.adminSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = __importDefault(require("zod"));
const appError_1 = require("../../errors/appError");
const admin_model_1 = require("./admin.model");
const signupSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required").trim(),
    email: zod_1.default.string().email("Invalid email").toLowerCase().trim(),
    password: zod_1.default.string().min(8, "Password must be at least 8 characters"),
});
const loginSchema = zod_1.default.object({
    email: zod_1.default.string().email("Invalid email").toLowerCase().trim(),
    password: zod_1.default.string().min(1, "Password is required"),
});
const changeCredentialsSchema = zod_1.default
    .object({
    currentPassword: zod_1.default.string().min(1, "Current password is required"),
    newEmail: zod_1.default
        .string()
        .email("Invalid email")
        .toLowerCase()
        .trim()
        .optional()
        .or(zod_1.default.literal("")),
    newPassword: zod_1.default
        .string()
        .min(8, "Password must be at least 8 characters")
        .optional()
        .or(zod_1.default.literal("")),
})
    .refine((d) => !!d.newEmail || !!d.newPassword, {
    message: "Provide a new email or a new password",
});
const signToken = (id, role) => jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "1d"),
});
// POST /v1/api/admin-auth/signup
const adminSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new appError_1.appError(parsed.error.issues[0].message, 400));
        }
        const { name, email, password } = parsed.data;
        if (yield admin_model_1.Admin.findOne({ email })) {
            return next(new appError_1.appError("Admin already exists with this email", 400));
        }
        const hashed = yield bcrypt_1.default.hash(password, 10);
        const admin = yield admin_model_1.Admin.create({ name, email, password: hashed });
        const token = signToken(admin.id, admin.role);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Admin registered successfully",
            token,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminSignup = adminSignup;
// POST /v1/api/admin-auth/signin
const adminLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new appError_1.appError(parsed.error.issues[0].message, 400));
        }
        const { email, password } = parsed.data;
        const admin = yield admin_model_1.Admin.findOne({ email }).select("+password");
        // same message for both cases so attackers can't tell which was wrong
        if (!admin || !(yield bcrypt_1.default.compare(password, admin.password))) {
            return next(new appError_1.appError("Invalid email or password", 401));
        }
        if (admin.status !== "active") {
            return next(new appError_1.appError("Account is not active", 403));
        }
        const token = signToken(admin.id, admin.role);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Login successful",
            token,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.adminLogin = adminLogin;
// GET /v1/api/admin-auth/me  (needs adminAuth)
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ success: true, data: req.admin });
});
exports.getAdminProfile = getAdminProfile;
// PUT /v1/api/admin-auth/change-credentials  (needs adminAuth)
const changeAdminCredentials = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // set by adminAuth from the verified token (never from the body)
        const authAdmin = req.admin;
        const adminId = (_a = authAdmin === null || authAdmin === void 0 ? void 0 : authAdmin._id) !== null && _a !== void 0 ? _a : authAdmin === null || authAdmin === void 0 ? void 0 : authAdmin.id;
        if (!adminId) {
            return next(new appError_1.appError("Unauthorized", 401));
        }
        const parsed = changeCredentialsSchema.safeParse(req.body);
        if (!parsed.success) {
            return next(new appError_1.appError(parsed.error.issues[0].message, 400));
        }
        const { currentPassword, newEmail, newPassword } = parsed.data;
        // password is select:false, so ask for it explicitly
        const admin = yield admin_model_1.Admin.findById(adminId).select("+password");
        if (!admin) {
            return next(new appError_1.appError("Admin not found", 404));
        }
        // always confirm the current password first
        if (!(yield bcrypt_1.default.compare(currentPassword, admin.password))) {
            return next(new appError_1.appError("Current password is incorrect", 400));
        }
        let changed = false;
        // ---------- EMAIL ----------
        if (newEmail && newEmail !== admin.email) {
            const exists = yield admin_model_1.Admin.findOne({
                email: newEmail,
                _id: { $ne: admin._id },
            });
            if (exists) {
                return next(new appError_1.appError("This email is already in use", 400));
            }
            admin.email = newEmail;
            changed = true;
        }
        // ---------- PASSWORD ----------
        if (newPassword) {
            if (yield bcrypt_1.default.compare(newPassword, admin.password)) {
                return next(new appError_1.appError("New password must be different from the current one", 400));
            }
            admin.password = yield bcrypt_1.default.hash(newPassword, 10);
            changed = true;
        }
        if (!changed) {
            return next(new appError_1.appError("Nothing to update", 400));
        }
        yield admin.save();
        // fresh token so the admin stays logged in after the change
        const token = signToken(admin.id, admin.role);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Credentials updated successfully",
            token,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
            },
        });
    }
    catch (error) {
        // duplicate email slipped past the check (race condition)
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return next(new appError_1.appError("This email is already in use", 400));
        }
        next(error);
    }
});
exports.changeAdminCredentials = changeAdminCredentials;
