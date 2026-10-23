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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJson = exports.getUploadedPaths = exports.deleteCloudinaryImages = exports.deleteCloudinaryImage = exports.getPublicIdFromUrl = void 0;
const cloudinary_1 = require("../config/cloudinary");
const appError_1 = require("../errors/appError");
// "https://res.cloudinary.com/x/image/upload/v123/folder/abc.jpg" -> "folder/abc"
const getPublicIdFromUrl = (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
    return match ? match[1] : null;
};
exports.getPublicIdFromUrl = getPublicIdFromUrl;
const deleteCloudinaryImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        return;
    try {
        const publicId = (0, exports.getPublicIdFromUrl)(url);
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
    }
    catch (err) {
        console.error("Cloudinary image deletion failed:", err);
    }
});
exports.deleteCloudinaryImage = deleteCloudinaryImage;
const deleteCloudinaryImages = (urls) => __awaiter(void 0, void 0, void 0, function* () {
    yield Promise.all(urls.map((u) => (0, exports.deleteCloudinaryImage)(u)));
});
exports.deleteCloudinaryImages = deleteCloudinaryImages;
// every file uploaded in this request (works with upload.fields)
const getUploadedPaths = (req) => {
    const files = req.files;
    return files
        ? Object.values(files)
            .flat()
            .map((f) => f.path)
        : [];
};
exports.getUploadedPaths = getUploadedPaths;
// form-data sends arrays as strings, so accept a JSON string
const parseJson = (value, fieldName) => {
    if (typeof value !== "string")
        return value;
    try {
        return JSON.parse(value);
    }
    catch (_a) {
        throw new appError_1.appError(`${fieldName} must be valid JSON`, 400);
    }
};
exports.parseJson = parseJson;
