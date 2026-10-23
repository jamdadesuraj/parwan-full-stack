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
exports.deleteHomeBannerById = exports.updateHomeBannerById = exports.homeBannerById = exports.getAllHomeBanner = exports.createHomeBanner = void 0;
const homeBanner_model_1 = require("./homeBanner.model");
const appError_1 = require("../../errors/appError");
const homeBanner_validation_1 = require("./homeBanner.validation");
const cloudinary_1 = require("../../config/cloudinary");
// Only these fields are { en, ar } objects. `status` is a plain string.
const LOCALIZED_FIELDS = ["title", "subTitle", "shortDesc"];
// "https://res.cloudinary.com/x/video/upload/v123/folder/abc.mp4" -> "folder/abc"
// (same pattern for /image/upload/ URLs)
const getPublicIdFromUrl = (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
    return match ? match[1] : null;
};
// "https://res.cloudinary.com/x/image/upload/..." -> "image"
const getResourceTypeFromUrl = (url) => url.includes("/video/upload/") ? "video" : "image";
// Works for both images and videos
const deleteCloudinaryMedia = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        return;
    try {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(publicId, {
                resource_type: getResourceTypeFromUrl(url),
            });
        }
    }
    catch (err) {
        console.error("Cloudinary media deletion failed:", err);
    }
});
// ?lang=en|ar -> returns plain strings instead of { en, ar }
const localizeBanner = (banner, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof banner.toJSON === "function" ? banner.toJSON() : banner;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of LOCALIZED_FIELDS) {
        obj[field] = (_d = (_b = (_a = obj[field]) === null || _a === void 0 ? void 0 : _a[lang]) !== null && _b !== void 0 ? _b : (_c = obj[field]) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "";
    }
    return obj;
};
const createHomeBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { title, subTitle, shortDesc, status } = req.body;
        const bgVideo = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path; // optional image or video URL
        const validatedData = homeBanner_validation_1.homeBannerSchema.parse({
            title,
            subTitle,
            shortDesc,
            bgVideo,
            status,
        });
        const existingHomeBanner = yield homeBanner_model_1.HomeBanner.findOne({
            "title.en": validatedData.title.en,
            "title.ar": validatedData.title.ar,
        });
        if (existingHomeBanner) {
            yield deleteCloudinaryMedia(bgVideo);
            return next(new appError_1.appError("Banner already exists", 400));
        }
        const homeBanner = yield homeBanner_model_1.HomeBanner.create(validatedData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Banner created successfully",
            data: homeBanner,
        });
    }
    catch (error) {
        yield deleteCloudinaryMedia((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        next(error);
    }
});
exports.createHomeBanner = createHomeBanner;
const getAllHomeBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const status = req.query.status;
        // Optional ?status=active|inactive filter
        const filter = {};
        if (status === "active" || status === "inactive") {
            filter.status = status;
        }
        const banners = yield homeBanner_model_1.HomeBanner.find(filter).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: banners.length > 0
                ? "Banner retrieved successfully"
                : "No banner found",
            data: banners.map((b) => localizeBanner(b, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllHomeBanner = getAllHomeBanner;
const homeBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homeBanner = yield homeBanner_model_1.HomeBanner.findById(req.params.id);
        if (!homeBanner) {
            return next(new appError_1.appError("Banner not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Banner retrieved successfully",
            data: localizeBanner(homeBanner, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.homeBannerById = homeBannerById;
const updateHomeBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const homeBannerId = req.params.id;
        const existingBanner = yield homeBanner_model_1.HomeBanner.findById(homeBannerId);
        if (!existingBanner) {
            yield deleteCloudinaryMedia((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
            return next(new appError_1.appError("Home Banner not found", 404));
        }
        const { title, subTitle, shortDesc, status } = req.body;
        const validatedData = homeBanner_validation_1.homeBannerUpdateSchema.parse(Object.assign({ title,
            subTitle,
            shortDesc,
            status }, (((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) && { bgVideo: req.file.path })));
        // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
        const $set = {};
        for (const field of LOCALIZED_FIELDS) {
            const value = validatedData[field];
            if (!value)
                continue;
            Object.keys(value).forEach((lang) => {
                if (value[lang] !== undefined) {
                    $set[`${field}.${lang}`] = value[lang];
                }
            });
        }
        if (validatedData.bgVideo)
            $set.bgVideo = validatedData.bgVideo;
        if (validatedData.status)
            $set.status = validatedData.status;
        if (Object.keys($set).length === 0) {
            yield deleteCloudinaryMedia((_c = req.file) === null || _c === void 0 ? void 0 : _c.path);
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updatedHomeBanner = yield homeBanner_model_1.HomeBanner.findByIdAndUpdate(homeBannerId, { $set }, { new: true, runValidators: true });
        if (!updatedHomeBanner) {
            yield deleteCloudinaryMedia((_d = req.file) === null || _d === void 0 ? void 0 : _d.path);
            return next(new appError_1.appError("Home Banner not found", 404));
        }
        // Delete old video only after successful DB update
        if (((_e = req.file) === null || _e === void 0 ? void 0 : _e.path) && existingBanner.bgVideo) {
            yield deleteCloudinaryMedia(existingBanner.bgVideo);
        }
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Home Banner updated successfully",
            data: updatedHomeBanner,
        });
    }
    catch (error) {
        yield deleteCloudinaryMedia((_f = req.file) === null || _f === void 0 ? void 0 : _f.path); // don't orphan the new upload
        next(error);
    }
});
exports.updateHomeBannerById = updateHomeBannerById;
const deleteHomeBannerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const homeBanner = yield homeBanner_model_1.HomeBanner.findByIdAndDelete(req.params.id);
        if (!homeBanner) {
            return next(new appError_1.appError("Banner not found", 404));
        }
        yield deleteCloudinaryMedia(homeBanner.bgVideo);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Banner deleted successfully",
            data: homeBanner,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteHomeBannerById = deleteHomeBannerById;
