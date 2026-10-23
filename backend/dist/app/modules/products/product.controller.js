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
exports.deleteProduct = exports.updateProduct = exports.getProductByIdOrSlug = exports.getAllProducts = exports.createProduct = void 0;
const categories_model_1 = require("../categories/categories.model");
const appError_1 = require("../../errors/appError");
const sanitize_helpers_1 = require("../../utils/sanitize.helpers");
const cloudinary_helpers_1 = require("../../utils/cloudinary.helpers");
const product_validation_1 = require("./product.validation");
const product_model_1 = require("./product.model");
const product_interface_1 = require("./product.interface");
const LOCALIZED_FIELDS = [
    "productName",
    "shortDesc",
    "origin",
    "grade",
    "shelfLife",
    "type",
    "desc",
];
const PLAIN_FIELDS = [
    "category",
    "rating",
    "review",
    "price",
    "unit",
    "delPrice",
    "minOrderQty",
];
const ARRAY_FIELDS = [
    "features",
    "specifications",
    "packagingAndDelivery",
    "faqs",
];
// uploaded files with upload.array("images", n)
const getImagePaths = (req) => { var _a; return ((_a = req.files) !== null && _a !== void 0 ? _a : []).map((f) => f.path); };
// text fields come from bracket notation; arrays come as JSON strings in form-data
const readBody = (body) => (Object.assign(Object.assign({}, Object.fromEntries([...LOCALIZED_FIELDS, ...PLAIN_FIELDS].map((f) => [f, body[f]]))), Object.fromEntries(ARRAY_FIELDS.map((f) => [f, (0, cloudinary_helpers_1.parseJson)(body[f], f)]))));
const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
const uniqueSlug = (base) => __awaiter(void 0, void 0, void 0, function* () {
    let slug = base;
    let i = 1;
    while (yield product_model_1.Products.exists({ slug })) {
        i += 1;
        slug = `${base}-${i}`;
    }
    return slug;
});
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pick = (value, lang) => (value === null || value === void 0 ? void 0 : value[lang]) || (value === null || value === void 0 ? void 0 : value.en) || "";
// ?lang=en|ar -> plain strings instead of { en, ar }
const localizeProduct = (doc, lang) => {
    var _a, _b, _c, _d;
    const obj = typeof doc.toJSON === "function" ? doc.toJSON() : doc;
    if (lang !== "en" && lang !== "ar")
        return obj;
    for (const field of LOCALIZED_FIELDS) {
        if (obj[field])
            obj[field] = pick(obj[field], lang);
    }
    obj.features = ((_a = obj.features) !== null && _a !== void 0 ? _a : []).map((f) => pick(f, lang));
    for (const key of ["specifications", "packagingAndDelivery"]) {
        obj[key] = ((_b = obj[key]) !== null && _b !== void 0 ? _b : []).map((r) => ({
            label: pick(r.label, lang),
            value: pick(r.value, lang),
        }));
    }
    obj.faqs = ((_c = obj.faqs) !== null && _c !== void 0 ? _c : []).map((f) => ({
        question: pick(f.question, lang),
        answer: pick(f.answer, lang),
    }));
    if ((_d = obj.category) === null || _d === void 0 ? void 0 : _d.categoryName) {
        obj.category.categoryName = pick(obj.category.categoryName, lang);
    }
    return obj;
};
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const images = getImagePaths(req);
    try {
        if (images.length === 0) {
            return next(new appError_1.appError("At least one image is required", 400));
        }
        const validateData = product_validation_1.productSchema.parse(Object.assign(Object.assign({}, readBody(req.body)), { images }));
        const categoryExists = yield categories_model_1.Categories.exists({
            _id: validateData.category,
            isDeleted: { $ne: true },
        });
        if (!categoryExists) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(images);
            return next(new appError_1.appError("Category not found", 404));
        }
        const duplicate = yield product_model_1.Products.exists({
            "productName.en": validateData.productName.en,
            isDeleted: { $ne: true },
        });
        if (duplicate) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(images);
            return next(new appError_1.appError("Product already exists", 400));
        }
        if (validateData.desc) {
            validateData.desc = {
                en: (0, sanitize_helpers_1.cleanHtml)(validateData.desc.en),
                ar: (0, sanitize_helpers_1.cleanHtml)(validateData.desc.ar),
            };
        }
        const slug = yield uniqueSlug(slugify(validateData.productName.en));
        const created = yield product_model_1.Products.create(Object.assign(Object.assign({}, validateData), { slug }));
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Product created successfully",
            data: created,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(images); // don't orphan uploads
        next(error);
    }
});
exports.createProduct = createProduct;
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const lang = req.query.lang;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const filter = { isDeleted: { $ne: true } };
        const category = req.query.category;
        if (category && /^[0-9a-fA-F]{24}$/.test(category)) {
            filter.category = category;
        }
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.trim();
        if (search) {
            const regex = new RegExp(escapeRegex(search), "i");
            filter.$or = [{ "productName.en": regex }, { "productName.ar": regex }];
        }
        const [data, total] = yield Promise.all([
            product_model_1.Products.find(filter)
                // timestamps are selected so the Categories toJSON transform doesn't output "Invalid Date"
                .populate("category", "categoryName categoryImg createdAt updatedAt")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            product_model_1.Products.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "Products retrieved successfully"
                : "No products found",
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            data: data.map((d) => localizeProduct(d, lang)),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
// accepts either the product id or its slug
const getProductByIdOrSlug = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const param = req.params.idOrSlug;
        // @ts-ignore
        const isId = /^[0-9a-fA-F]{24}$/.test(param);
        const product = yield product_model_1.Products.findOne(Object.assign(Object.assign({}, (isId ? { _id: param } : { slug: param })), { isDeleted: { $ne: true } })).populate("category", "categoryName categoryImg createdAt updatedAt");
        if (!product) {
            return next(new appError_1.appError("Product not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product retrieved successfully",
            data: localizeProduct(product, req.query.lang),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductByIdOrSlug = getProductByIdOrSlug;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const newImages = getImagePaths(req);
    try {
        const existing = yield product_model_1.Products.findById(req.params.id);
        if (!existing) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError("Product not found", 404));
        }
        const validated = product_validation_1.updateProductSchema.parse(Object.assign(Object.assign({}, readBody(req.body)), { removeImages: (0, cloudinary_helpers_1.parseJson)(req.body.removeImages, "removeImages") }));
        if (validated.category) {
            const categoryExists = yield categories_model_1.Categories.exists({
                _id: validated.category,
                isDeleted: { $ne: true },
            });
            if (!categoryExists) {
                yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
                return next(new appError_1.appError("Category not found", 404));
            }
        }
        // Images: keep existing, drop the ones in removeImages, append new uploads
        const toRemove = ((_a = validated.removeImages) !== null && _a !== void 0 ? _a : []).filter((u) => existing.images.includes(u));
        const finalImages = [
            ...existing.images.filter((u) => !toRemove.includes(u)),
            ...newImages,
        ];
        if (finalImages.length === 0) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError("A product needs at least one image", 400));
        }
        if (finalImages.length > product_interface_1.MAX_IMAGES) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError(`A product can have at most ${product_interface_1.MAX_IMAGES} images`, 400));
        }
        // sending delPrice / minOrderQty as an empty value clears it
        const clearDelPrice = req.body.delPrice === "";
        const clearMinOrder = req.body.minOrderQty === "";
        const finalPrice = (_b = validated.price) !== null && _b !== void 0 ? _b : existing.price;
        const finalDelPrice = clearDelPrice
            ? undefined
            : ((_c = validated.delPrice) !== null && _c !== void 0 ? _c : existing.delPrice);
        if (finalDelPrice !== undefined && finalDelPrice <= finalPrice) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError("Old price (delPrice) must be greater than price", 400));
        }
        // Dot-notation so updating only "ar" doesn't wipe "en"
        const $set = {};
        for (const field of LOCALIZED_FIELDS) {
            const value = validated[field];
            if (!value)
                continue;
            Object.keys(value).forEach((lang) => {
                const text = value[lang];
                if (text === undefined)
                    return;
                $set[`${field}.${lang}`] = field === "desc" ? (0, sanitize_helpers_1.cleanHtml)(text) : text;
            });
        }
        for (const field of PLAIN_FIELDS) {
            if (validated[field] !== undefined)
                $set[field] = validated[field];
        }
        for (const field of ARRAY_FIELDS) {
            if (validated[field])
                $set[field] = validated[field];
        }
        if (validated.isDeleted !== undefined)
            $set.isDeleted = validated.isDeleted;
        if (toRemove.length > 0 || newImages.length > 0)
            $set.images = finalImages;
        const $unset = {};
        if (clearDelPrice)
            $unset.delPrice = 1;
        if (clearMinOrder)
            $unset.minOrderQty = 1;
        if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError("No data provided to update", 400));
        }
        const updated = yield product_model_1.Products.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, (Object.keys($set).length > 0 && { $set })), (Object.keys($unset).length > 0 && { $unset })), { new: true, runValidators: true });
        if (!updated) {
            yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages);
            return next(new appError_1.appError("Product not found", 404));
        }
        // Delete removed images only after a successful DB update
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(toRemove);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product updated successfully",
            data: updated,
        });
    }
    catch (error) {
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(newImages); // don't orphan new uploads
        next(error);
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.Products.findOneAndDelete({ _id: req.params.id });
        if (!product) {
            return next(new appError_1.appError("Product not found", 404));
        }
        yield (0, cloudinary_helpers_1.deleteCloudinaryImages)(product.images);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Product deleted successfully",
            data: product,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProduct = deleteProduct;
