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
exports.deleteFaq = exports.updateFaq = exports.getFaqById = exports.getAllFaq = exports.createFaq = void 0;
const faq_model_1 = require("./faq.model");
const appError_1 = require("../../errors/appError");
const faq_validation_1 = require("./faq.validation");
const FIELDS = [
    "question",
    "answer",
];
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeFaq = (doc, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of FIELDS) {
        obj[field] = (_d = (_b = (_a = obj[field]) === null || _a === void 0 ? void 0 : _a[lang]) !== null && _b !== void 0 ? _b : (_c = obj[field]) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "";
    }
    return obj;
};
const createFaq = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = faq_validation_1.faqSchema.parse(req.body);
        const existing = yield faq_model_1.Faq.findOne({
            "question.en": validateData.question.en,
            isDeleted: { $ne: true },
        });
        if (existing) {
            return next(new appError_1.appError("FAQ already exists", 400));
        }
        const created = yield faq_model_1.Faq.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "FAQ created successfully",
            data: created,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createFaq = createFaq;
const getAllFaq = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield faq_model_1.Faq.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0 ? "FAQ retrieved successfully" : "No FAQ found",
            data: data.map((d) => localizeFaq(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllFaq = getAllFaq;
const getFaqById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faq_model_1.Faq.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!faq) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "FAQ retrieved successfully",
            data: localizeFaq(faq, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFaqById = getFaqById;
const updateFaq = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = faq_validation_1.updateFaqSchema.parse(req.body);
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
        if (validated.isDeleted !== undefined)
            $set.isDeleted = validated.isDeleted;
        if (Object.keys($set).length === 0) {
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield faq_model_1.Faq.findOneAndUpdate({ _id: req.params.id }, { $set }, { new: true, runValidators: true });
        if (!updated) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "FAQ updated successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateFaq = updateFaq;
const deleteFaq = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faq_model_1.Faq.findOneAndDelete({ _id: req.params.id });
        if (!faq) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "FAQ deleted successfully",
            data: faq,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFaq = deleteFaq;
