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
exports.deleteWhyChooseUs = exports.updateWhyChooseUs = exports.getWhyChooseUsById = exports.getAllWhyChooseUs = exports.createWhyChooseUs = void 0;
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const whyUs_validation_1 = require("./whyUs.validation");
const whyUs_model_1 = require("./whyUs.model");
const FIELDS = ["title", "subTitle", "desc"];
const getPublicIdFromUrl = (url) => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
    return match ? match[1] : null;
};
const deleteCloudinaryImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        return;
    try {
        const publicId = getPublicIdFromUrl(url);
        if (publicId) {
            yield cloudinary_1.cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }
    }
    catch (err) {
        console.error("Cloudinary image deletion failed:", err);
    }
});
// form-data sends everything as strings, so accept features as a JSON string
const parseFeatures = (features) => {
    if (typeof features !== "string")
        return features;
    try {
        return JSON.parse(features);
    }
    catch (_a) {
        throw new appError_1.appError("features must be valid JSON", 400);
    }
};
// ?lang=en|ar -> plain strings instead of { en, ar }
const pick = (value, lang) => { var _a, _b; return (_b = (_a = value === null || value === void 0 ? void 0 : value[lang]) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.en) !== null && _b !== void 0 ? _b : ""; };
const localizeDoc = (doc, lang) => {
    var _a;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of FIELDS) {
        obj[field] = pick(obj[field], lang);
    }
    obj.features = ((_a = obj.features) !== null && _a !== void 0 ? _a : []).map((f) => (Object.assign(Object.assign({}, f), { title: pick(f.title, lang), desc: pick(f.desc, lang) })));
    return obj;
};
const createWhyChooseUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!image) {
            return next(new appError_1.appError("Image is required", 400));
        }
        const { title, subTitle, desc, features } = req.body;
        const validateData = whyUs_validation_1.whyChooseUsSchema.parse({
            title,
            subTitle,
            desc,
            image,
            features: parseFeatures(features),
        });
        const existing = yield whyUs_model_1.WhyChooseUs.findOne({
            "title.en": validateData.title.en,
            isDeleted: { $ne: true },
        });
        if (existing) {
            yield deleteCloudinaryImage(image);
            return next(new appError_1.appError("Section already exists", 400));
        }
        const created = yield whyUs_model_1.WhyChooseUs.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Why choose us created successfully",
            data: created,
        });
    }
    catch (error) {
        yield deleteCloudinaryImage((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        next(error);
    }
});
exports.createWhyChooseUs = createWhyChooseUs;
const getAllWhyChooseUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield whyUs_model_1.WhyChooseUs.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "Why choose us retrieved successfully"
                : "No data found",
            data: data.map((d) => localizeDoc(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllWhyChooseUs = getAllWhyChooseUs;
const getWhyChooseUsById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield whyUs_model_1.WhyChooseUs.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!doc) {
            return next(new appError_1.appError("Not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Why choose us retrieved successfully",
            data: localizeDoc(doc, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getWhyChooseUsById = getWhyChooseUsById;
const updateWhyChooseUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const existing = yield whyUs_model_1.WhyChooseUs.findById(req.params.id);
        if (!existing) {
            yield deleteCloudinaryImage((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
            return next(new appError_1.appError("Not found", 404));
        }
        const { title, subTitle, desc, features } = req.body;
        const validated = whyUs_validation_1.updateWhyChooseUsSchema.parse(Object.assign({ title,
            subTitle,
            desc, features: parseFeatures(features) }, (((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) && { image: req.file.path })));
        // Dot-notation so updating only "ar" doesn't wipe "en"
        const $set = {};
        for (const field of FIELDS) {
            const value = validated[field];
            if (!value)
                continue;
            Object.keys(value).forEach((lang) => {
                if (value[lang] !== undefined) {
                    $set[`${field}.${lang}`] = value[lang];
                }
            });
        }
        if (validated.image)
            $set.image = validated.image;
        if (validated.features)
            $set.features = validated.features;
        if (Object.keys($set).length === 0) {
            yield deleteCloudinaryImage((_c = req.file) === null || _c === void 0 ? void 0 : _c.path);
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield whyUs_model_1.WhyChooseUs.findByIdAndUpdate(req.params.id, { $set }, { new: true, runValidators: true });
        if (!updated) {
            yield deleteCloudinaryImage((_d = req.file) === null || _d === void 0 ? void 0 : _d.path);
            return next(new appError_1.appError("Not found", 404));
        }
        // Delete old image only after successful DB update
        if (((_e = req.file) === null || _e === void 0 ? void 0 : _e.path) && existing.image) {
            yield deleteCloudinaryImage(existing.image);
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Why choose us updated successfully",
            data: updated,
        });
    }
    catch (error) {
        yield deleteCloudinaryImage((_f = req.file) === null || _f === void 0 ? void 0 : _f.path);
        next(error);
    }
});
exports.updateWhyChooseUs = updateWhyChooseUs;
const deleteWhyChooseUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield whyUs_model_1.WhyChooseUs.findOneAndDelete({ _id: req.params.id });
        if (!doc) {
            return next(new appError_1.appError("Not found", 404));
        }
        yield deleteCloudinaryImage(doc.image);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Why choose us deleted successfully",
            data: doc,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteWhyChooseUs = deleteWhyChooseUs;
