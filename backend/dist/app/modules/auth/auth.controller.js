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
exports.adminSignup = exports.loginController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("./auth.model");
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";
        const password = req.body.password;
        if (!email || typeof password !== "string" || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }
        const user = yield auth_model_1.User.findOne({ email }).select("+password");
        if (!user || !(yield user.comparePassword(password))) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, secret, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to sign in",
        });
    }
});
exports.loginController = loginController;
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = typeof req.body.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";
        const password = req.body.password;
        if (!email || typeof password !== "string" || !password) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long",
            });
            return;
        }
        const existingUser = yield auth_model_1.User.findOne({ email });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
            return;
        }
        // The User model's pre-save hook hashes the password.
        const user = yield auth_model_1.User.create({
            email,
            password,
        });
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not configured");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, secret, { expiresIn: "1d" });
        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            data: {
                user: {
                    _id: user._id,
                    email: user.email,
                },
                token,
            },
        });
    }
    catch (error) {
        if (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000) {
            res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
            return;
        }
        console.error("Admin signup error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create admin account",
        });
    }
});
exports.adminSignup = adminSignup;
