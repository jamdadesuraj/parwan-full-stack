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
exports.updateTerms = exports.getAllTerms = exports.createTerms = void 0;
const terms_model_1 = require("./terms.model");
const appError_1 = require("../../errors/appError");
const terms_validation_1 = require("./terms.validation");
const sanitize_helpers_1 = require("../../utils/sanitize.helpers");
const TEXT_FIELDS = ["title", "subTitle", "shortDesc"];
const ALL_FIELDS = [...TEXT_FIELDS, "content"];
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeTerms = (doc, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of ALL_FIELDS) {
        obj[field] = (_d = (_b = (_a = obj[field]) === null || _a === void 0 ? void 0 : _a[lang]) !== null && _b !== void 0 ? _b : (_c = obj[field]) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "";
    }
    return obj;
};
const createTerms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = terms_validation_1.termsSchema.parse(req.body);
        // only the HTML field needs sanitizing
        validateData.content = {
            en: (0, sanitize_helpers_1.cleanHtml)(validateData.content.en),
            ar: (0, sanitize_helpers_1.cleanHtml)(validateData.content.ar),
        };
        const created = yield terms_model_1.Terms.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Terms created successfully",
            data: created,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createTerms = createTerms;
const getAllTerms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield terms_model_1.Terms.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0 ? "Terms retrieved successfully" : "No terms found",
            data: data.map((d) => localizeTerms(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTerms = getAllTerms;
const updateTerms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = terms_validation_1.updateTermsSchema.parse(req.body);
        // Dot-notation so updating only "ar" doesn't wipe "en"
        const $set = {};
        for (const field of ALL_FIELDS) {
            const value = validated[field];
            if (!value)
                continue;
            Object.keys(value).forEach((lang) => {
                const text = value[lang];
                if (text === undefined)
                    return;
                $set[`${field}.${lang}`] = field === "content" ? (0, sanitize_helpers_1.cleanHtml)(text) : text;
            });
        }
        if (validated.isDeleted !== undefined)
            $set.isDeleted = validated.isDeleted;
        if (Object.keys($set).length === 0) {
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield terms_model_1.Terms.findOneAndUpdate({ _id: req.params.id }, { $set }, { new: true, runValidators: true });
        if (!updated) {
            return next(new appError_1.appError("Terms not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Terms updated successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateTerms = updateTerms;
