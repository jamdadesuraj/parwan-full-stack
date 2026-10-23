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
exports.deleteHowToOrder = exports.updateHowToOrder = exports.getHowToOrderById = exports.getAllHowToOrder = exports.createHowToOrder = void 0;
const appError_1 = require("../../errors/appError");
const howToOrders_validation_1 = require("./howToOrders.validation");
const howToOrders_model_1 = require("./howToOrders.model");
const FIELDS = ["title", "subTitle", "shortDesc"];
const pick = (value, lang) => { var _a, _b; return (_b = (_a = value === null || value === void 0 ? void 0 : value[lang]) !== null && _a !== void 0 ? _a : value === null || value === void 0 ? void 0 : value.en) !== null && _b !== void 0 ? _b : ""; };
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeDoc = (doc, lang) => {
    var _a;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of FIELDS) {
        obj[field] = pick(obj[field], lang);
    }
    obj.steps = ((_a = obj.steps) !== null && _a !== void 0 ? _a : []).map((s) => (Object.assign(Object.assign({}, s), { title: pick(s.title, lang), desc: pick(s.desc, lang) })));
    return obj;
};
const createHowToOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = howToOrders_validation_1.howToOrderSchema.parse(req.body);
        const existing = yield howToOrders_model_1.HowToOrder.findOne({
            "title.en": validateData.title.en,
            isDeleted: { $ne: true },
        });
        if (existing) {
            return next(new appError_1.appError("How to order already exists", 400));
        }
        const created = yield howToOrders_model_1.HowToOrder.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "How to order created successfully",
            data: created,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createHowToOrder = createHowToOrder;
const getAllHowToOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield howToOrders_model_1.HowToOrder.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "How to order retrieved successfully"
                : "No data found",
            data: data.map((d) => localizeDoc(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllHowToOrder = getAllHowToOrder;
const getHowToOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield howToOrders_model_1.HowToOrder.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!doc) {
            return next(new appError_1.appError("How to order not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "How to order retrieved successfully",
            data: localizeDoc(doc, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getHowToOrderById = getHowToOrderById;
const updateHowToOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = howToOrders_validation_1.updateHowToOrderSchema.parse(req.body);
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
        if (validated.steps)
            $set.steps = validated.steps;
        if (validated.isDeleted !== undefined)
            $set.isDeleted = validated.isDeleted;
        if (Object.keys($set).length === 0) {
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield howToOrders_model_1.HowToOrder.findByIdAndUpdate(req.params.id, { $set }, { new: true, runValidators: true });
        if (!updated) {
            return next(new appError_1.appError("How to order not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "How to order updated successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateHowToOrder = updateHowToOrder;
const deleteHowToOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield howToOrders_model_1.HowToOrder.findOneAndDelete({ _id: req.params.id });
        if (!doc) {
            return next(new appError_1.appError("How to order not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "How to order deleted successfully",
            data: doc,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteHowToOrder = deleteHowToOrder;
