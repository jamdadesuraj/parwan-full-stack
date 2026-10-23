"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoleToken = exports.generateToken = void 0;
/* eslint-disable @typescript-eslint/ban-ts-comment */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Existing function — no changes, User flow untouched
const generateToken = (user) => {
    const payload = {
        userId: user._id,
        // @ts-ignore
        name: user.name,
        // @ts-ignore
        phone: user.phone,
        // @ts-ignore
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.generateToken = generateToken;
// New function — for Role/staff users only
const generateRoleToken = (role) => {
    const payload = {
        userId: role._id,
        name: role.employeeName,
        email: role.email,
        role: role.role,
        permissions: role.permissions,
        isRoleUser: true, // flag used in authMiddleware to separate the two flows
    };
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};
exports.generateRoleToken = generateRoleToken;
