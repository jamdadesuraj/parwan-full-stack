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
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const categories_model_1 = require("./categories.model");
const appError_1 = require("../../errors/appError");
const categories_validation_1 = require("./categories.validation");
const cloudinary_1 = require("../../config/cloudinary");
// Only these fields are stored as { en, ar }. `status` is a plain string.
const LOCALIZED_FIELDS = ["categoryName", "categoryDesc"];
// "https://res.cloudinary.com/x/image/upload/v123/folder/abc.jpg" -> "folder/abc"
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
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeCategory = (doc, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of LOCALIZED_FIELDS) {
        obj[field] = (_d = (_b = (_a = obj[field]) === null || _a === void 0 ? void 0 : _a[lang]) !== null && _b !== void 0 ? _b : (_c = obj[field]) === null || _c === void 0 ? void 0 : _c.en) !== null && _d !== void 0 ? _d : "";
    }
    return obj;
};
const createCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const categoryImg = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
        if (!categoryImg) {
            return next(new appError_1.appError("Category image is required", 400));
        }
        const { categoryName, categoryDesc, status } = req.body;
        const validateData = categories_validation_1.categoriesSchema.parse({
            categoryName,
            categoryDesc,
            categoryImg,
            status,
        });
        const existing = yield categories_model_1.Categories.findOne({
            "categoryName.en": validateData.categoryName.en,
            isDeleted: { $ne: true },
        });
        if (existing) {
            yield deleteCloudinaryImage(categoryImg);
            return next(new appError_1.appError("Category already exists", 400));
        }
        const created = yield categories_model_1.Categories.create(validateData);
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Category created successfully",
            data: created,
        });
    }
    catch (error) {
        yield deleteCloudinaryImage((_b = req.file) === null || _b === void 0 ? void 0 : _b.path);
        next(error);
    }
});
exports.createCategory = createCategory;
const getAllCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lang = req.query.lang;
        const data = yield categories_model_1.Categories.find({ isDeleted: { $ne: true } }).sort({
            createdAt: -1,
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "Categories retrieved successfully"
                : "No categories found",
            data: data.map((d) => localizeCategory(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCategories = getAllCategories;
const getCategoryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield categories_model_1.Categories.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!category) {
            return next(new appError_1.appError("Category not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Category retrieved successfully",
            data: localizeCategory(category, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCategoryById = getCategoryById;
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const existing = yield categories_model_1.Categories.findById(req.params.id);
        if (!existing) {
            yield deleteCloudinaryImage((_a = req.file) === null || _a === void 0 ? void 0 : _a.path);
            return next(new appError_1.appError("Category not found", 404));
        }
        // `status` was missing here, which caused "status is not defined".
        const { categoryName, categoryDesc, status } = req.body;
        const validated = categories_validation_1.updateCategoriesSchema.parse(Object.assign({ categoryName,
            categoryDesc,
            status }, (((_b = req.file) === null || _b === void 0 ? void 0 : _b.path) && { categoryImg: req.file.path })));
        // Flatten to dot-notation so updating only "ar" doesn't wipe "en"
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
        // Plain (non-localized) fields
        if (validated.status)
            $set.status = validated.status;
        if (validated.categoryImg)
            $set.categoryImg = validated.categoryImg;
        if (Object.keys($set).length === 0) {
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield categories_model_1.Categories.findByIdAndUpdate(req.params.id, { $set }, { new: true, runValidators: true });
        if (!updated) {
            yield deleteCloudinaryImage((_c = req.file) === null || _c === void 0 ? void 0 : _c.path);
            return next(new appError_1.appError("Category not found", 404));
        }
        // Delete old image only after successful DB update
        if (((_d = req.file) === null || _d === void 0 ? void 0 : _d.path) && existing.categoryImg) {
            yield deleteCloudinaryImage(existing.categoryImg);
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Category updated successfully",
            data: updated,
        });
    }
    catch (error) {
        yield deleteCloudinaryImage((_e = req.file) === null || _e === void 0 ? void 0 : _e.path);
        next(error);
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const category = yield categories_model_1.Categories.findOneAndDelete({ _id: req.params.id });
        if (!category) {
            return next(new appError_1.appError("Category not found", 404));
        }
        yield deleteCloudinaryImage(category.categoryImg);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Category deleted successfully",
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCategory = deleteCategory;
