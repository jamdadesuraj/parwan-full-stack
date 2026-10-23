"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const appError_1 = require("../errors/appError");
const requirePermission = (permission) => {
    return (req, res, next) => {
        var _a;
        const user = req.user;
        if (!user) {
            return next(new appError_1.appError("Unauthorized", 401));
        }
        // Regular admin has full access — skip permission check
        if (user.role === "admin") {
            return next();
        }
        // Role/staff users must have the specific permission
        if (!((_a = user.permissions) === null || _a === void 0 ? void 0 : _a.includes(permission))) {
            return next(new appError_1.appError(`Access denied. Required permission: "${permission}"`, 403));
        }
        next();
    };
};
exports.requirePermission = requirePermission;
