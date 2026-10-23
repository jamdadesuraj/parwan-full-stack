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
exports.updateCounter = exports.getAllCounterData = exports.createCounter = void 0;
const counter_model_1 = require("./counter.model");
const appError_1 = require("../../errors/appError");
const counter_validation_1 = require("./counter.validation");
const FIELDS = [
    "protected",
    "Nopreservatives",
    "Wereheretohelp",
    "Happycustomers",
];
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeCounter = (doc, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of FIELDS) {
        obj[field] = (_d = (_b = (_a = obj[field]) === null || _a === void 0 ? void 0 : _a[lang]) !== null && _b !== void 0 ? _b : (_c = obj[field]) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "";
    }
    return obj;
};
const createCounter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = counter_validation_1.counterSchema.parse(req.body);
        const existingData = yield counter_model_1.Counter.findOne({
            "protected.en": validateData.protected.en,
            "Nopreservatives.en": validateData.Nopreservatives.en,
            "Wereheretohelp.en": validateData.Wereheretohelp.en,
            "Happycustomers.en": validateData.Happycustomers.en,
        });
        if (existingData) {
            return next(new appError_1.appError("Data already exists", 400));
        }
        const created = yield counter_model_1.Counter.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Counter created successfully",
            data: created,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createCounter = createCounter;
const getAllCounterData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield counter_model_1.Counter.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0 ? "Counter retrieved successfully" : "No counter found",
            data: data.map((d) => localizeCounter(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCounterData = getAllCounterData;
const updateCounter = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = counter_validation_1.updateCounterSchema.parse(req.body);
        // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
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
        const updated = yield counter_model_1.Counter.findOneAndUpdate({ _id: req.params.id }, { $set }, { new: true, runValidators: true });
        if (!updated) {
            return next(new appError_1.appError("Counter not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Counter updated successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateCounter = updateCounter;
