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
exports.updateAboutUs = exports.getAboutUs = exports.createAboutUs = void 0;
const about_model_1 = require("./about.model");
const about_validation_1 = require("./about.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_helpers_1 = require("../../utils/cloudinary.helpers");
const LOCALIZED_FIELDS = [
    "title",
    "subTitle",
    "highlightsTitle",
    "shortDesc",
    "missionTitle",
    "missionSubTitle",
    "mission",
    "vision",
    "whoWeAreTitle",
    "whoWeAresubTitle",
    "whoWeAreHightlightTitle",
    "whoWeAreDesc",
];
const IMAGE_FIELDS = ["img1", "img2"];
const getFile = (req, name) => {
    var _a, _b;
    const files = req.files;
    return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
};
const pickLocalizedFromBody = (body) => Object.fromEntries(LOCALIZED_FIELDS.map((f) => [f, body[f]]));
// ?lang=en|ar -> plain strings instead of { en, ar }
const pick = (value, lang) => { var _a, _b; return (_b = (_a = value === null || value === void 0 ? void 0 : value[lang]) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.en) !== null && _b !== void 0 ? _b : ""; };
const localizeDoc = (doc, lang) => {
    var _a, _b;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of LOCALIZED_FIELDS) {
        if (obj[field])
            obj[field] = pick(obj[field], lang);
    }
    obj.highlights = ((_a = obj.highlights) !== null && _a !== void 0 ? _a : []).map((h) => (Object.assign(Object.assign({}, h), { title: pick(h.title, lang), desc: pick(h.desc, lang) })));
    obj.values = ((_b = obj.values) !== null && _b !== void 0 ? _b : []).map((v) => pick(v, lang));
    return obj;
};
const createAboutUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const img1 = getFile(req, "img1");
        const img2 = getFile(req, "img2");
        if (!img1 || !img2) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(new appError_1.appError("Both images (img1, img2) are required", 400));
        }
        const validateData = about_validation_1.aboutUsSchema.parse(Object.assign(Object.assign({}, pickLocalizedFromBody(req.body)), { highlights: (0, cloudinary_helpers_1.parseJson)(req.body.highlights, "highlights"), values: (0, cloudinary_helpers_1.parseJson)(req.body.values, "values"), img1,
            img2 }));
        const existing = yield about_model_1.AboutUs.findOne({
            "title.en": validateData.title.en,
            isDeleted: { $ne: true },
        });
        if (existing) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(new appError_1.appError("About Us already exists", 400));
        }
        const created = yield about_model_1.AboutUs.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "About Us created successfully",
            data: created,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
        next(error);
    }
});
exports.createAboutUs = createAboutUs;
const getAboutUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield about_model_1.AboutUs.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "About us retrieved successfully"
                : "No about us found",
            data: data.map((d) => localizeDoc(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAboutUs = getAboutUs;
const updateAboutUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield about_model_1.AboutUs.findById(req.params.id);
        if (!existing) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(new appError_1.appError("About us not found", 404));
        }
        const validated = about_validation_1.aboutUsUpdateSchema.parse(Object.assign(Object.assign({}, pickLocalizedFromBody(req.body)), { highlights: (0, cloudinary_helpers_1.parseJson)(req.body.highlights, "highlights"), values: (0, cloudinary_helpers_1.parseJson)(req.body.values, "values"), img1: getFile(req, "img1"), img2: getFile(req, "img2") }));
        // Dot-notation so updating only "ar" doesn't wipe "en"
        const $set = {};
        for (const field of LOCALIZED_FIELDS) {
            const value = validated[field];
            if (!value)
                continue;
            Object.keys(value).forEach((lang) => {
                if (value[lang] !== undefined) {
                    $set[`${field}.${lang}`] = value[lang];
                }
            });
        }
        if (validated.highlights)
            $set.highlights = validated.highlights;
        if (validated.values)
            $set.values = validated.values;
        for (const key of IMAGE_FIELDS) {
            if (validated[key])
                $set[key] = validated[key];
        }
        if (Object.keys($set).length === 0) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield about_model_1.AboutUs.findByIdAndUpdate(req.params.id, { $set }, { new: true, runValidators: true });
        if (!updated) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(new appError_1.appError("About us not found", 404));
        }
        // Delete replaced images only after a successful DB update
        for (const key of IMAGE_FIELDS) {
            if (validated[key]) {
                yield (0, cloudinary_helpers_1.deleteCloudinaryImage)(existing.get(key));
            }
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "About us updated successfully",
            data: updated,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req)); // don't orphan new uploads
        next(error);
    }
});
exports.updateAboutUs = updateAboutUs;
