"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = void 0;
const zod_1 = require("zod");
exports.loginValidation = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email("Enter a valid email")
        .transform((email) => email.toLowerCase()),
    password: zod_1.z.string().min(1, "Password is required"),
});
