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
exports.updateGeneralSettings = exports.getGeneralSettings = exports.createGeneralSettings = void 0;
const cloudinary_helpers_1 = require("../../utils/cloudinary.helpers");
const general_settings_model_1 = require("./general-settings.model");
const general_settings_validation_1 = require("./general-settings.validation");
const LOCALIZED_FIELDS = [
    "address",
    "workingHrs",
    "footerDesc",
    "footerCopyrights",
];
const PLAIN_FIELDS = [
    "mobileNo",
    "alternateMobileNo",
    "mail",
    "alternateEmail",
    "addressIframe",
    "facebook",
    "instagram",
    "linkedin",
    "twitter",
    "youtube",
    "whatsApp",
];
const IMAGE_FIELDS = ["logo", "favicon"];
const getFile = (req, name) => {
    var _a, _b;
    const files = req.files;
    return (_b = (_a = files === null || files === void 0 ? void 0 : files[name]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
};
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeSettings = (doc, lang) => {
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of LOCALIZED_FIELDS) {
        if (obj[field]) {
            obj[field] = obj[field][lang] || obj[field].en || "";
        }
    }
    return obj;
};
// POST: create the settings once. Fails if they already exist (use PUT to update).
const createGeneralSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield general_settings_model_1.GeneralSettings.findOne();
        if (existing) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return next(
            // @ts-ignore
            new appError("Settings already exist. Use PUT to update them.", 400));
        }
        const validated = general_settings_validation_1.updateGeneralSettingsSchema.parse(Object.assign(Object.assign({}, Object.fromEntries([...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, req.body[f]]))), { logo: getFile(req, "logo"), favicon: getFile(req, "favicon") }));
        // keep only the fields that were actually sent
        const data = {};
        for (const field of [
            ...LOCALIZED_FIELDS,
            ...PLAIN_FIELDS,
            ...IMAGE_FIELDS,
        ]) {
            const value = validated[field];
            if (value !== undefined && value !== "")
                data[field] = value;
        }
        if (Object.keys(data).length === 0) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            // @ts-ignore
            return next(new appError("No data provided", 400));
        }
        const created = yield general_settings_model_1.GeneralSettings.create(data);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Settings created successfully",
            data: created,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req)); // don't orphan uploads
        next(error);
    }
});
exports.createGeneralSettings = createGeneralSettings;
const getGeneralSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield general_settings_model_1.GeneralSettings.findOne();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: settings
                ? "Settings retrieved successfully"
                : "Settings not created yet",
            data: settings
                ? localizeSettings(settings, req.query.lang)
                : null,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getGeneralSettings = getGeneralSettings;
// creates the settings on first save, updates them afterwards
const updateGeneralSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existing = yield general_settings_model_1.GeneralSettings.findOne();
        const validated = general_settings_validation_1.updateGeneralSettingsSchema.parse(Object.assign(Object.assign({}, Object.fromEntries([...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, req.body[f]]))), { logo: getFile(req, "logo"), favicon: getFile(req, "favicon") }));
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
        for (const field of PLAIN_FIELDS) {
            if (validated[field] !== undefined)
                $set[field] = validated[field];
        }
        for (const field of IMAGE_FIELDS) {
            if (validated[field])
                $set[field] = validated[field];
        }
        if (Object.keys($set).length === 0) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req));
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "No data provided to update",
            });
        }
        const updated = yield general_settings_model_1.GeneralSettings.findOneAndUpdate({}, { $set }, { new: true, upsert: true, runValidators: true });
        // Delete replaced images only after a successful DB write
        for (const field of IMAGE_FIELDS) {
            if (validated[field] && (existing === null || existing === void 0 ? void 0 : existing.get(field))) {
                yield (0, cloudinary_helpers_1.deleteCloudinaryImage)(existing.get(field));
            }
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: existing
                ? "Settings updated successfully"
                : "Settings created successfully",
            data: updated,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)((0, cloudinary_helpers_1.getUploadedPaths)(req)); // don't orphan new uploads
        next(error);
    }
});
exports.updateGeneralSettings = updateGeneralSettings;
