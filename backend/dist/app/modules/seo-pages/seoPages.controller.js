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
exports.deleteSeoPages = exports.updateSeoPages = exports.getByIdSeoPages = exports.getAllSeoPages = exports.createSeoPages = void 0;
const seopages_model_1 = require("./seopages.model");
const seoPages_validation_1 = require("./seoPages.validation");
const appError_1 = require("../../errors/appError");
const createSeoPages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    try {
        const { aboutTitle, aboutSubTitle, servicesTitle, servicesSubTitle, servicesDetailsTitle, servicesDetailsSubTitle, productTitle, productSubTitle, productDetailsTitle, productDetailsSubTitle, newsTitle, newsSubTitle, newsDetailsTitle, newsDetailsSubTitle, careerTitle, careerSubTitle, contactTitle, contactSubTitle, awardTitle, awardSubTitle, ourPartnerTitle, ourPartnerSubTitle, mediaCoverageTitle, mediaCoverageSubTitle, galleryTitle, gallerySubTitle, faqTitle, faqSubTitle, privacyTitle, privacySubTitle, termsTitle, termsSubTitle, } = req.body;
        const files = req.files;
        const aboutBgImage = (_b = (_a = files === null || files === void 0 ? void 0 : files.aboutBgImage) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path;
        const servicesBgImage = (_d = (_c = files === null || files === void 0 ? void 0 : files.servicesBgImage) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path;
        const servicesDetailsBgImage = (_f = (_e = files === null || files === void 0 ? void 0 : files.servicesDetailsBgImage) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.path;
        const productBgImage = (_h = (_g = files === null || files === void 0 ? void 0 : files.productBgImage) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.path;
        const productDetailsBgImage = (_k = (_j = files === null || files === void 0 ? void 0 : files.productDetailsBgImage) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.path;
        const newsBgImage = (_m = (_l = files === null || files === void 0 ? void 0 : files.newsBgImage) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.path;
        const newsDetailsBgImage = (_p = (_o = files === null || files === void 0 ? void 0 : files.newsDetailsBgImage) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.path;
        const careerBgImage = (_r = (_q = files === null || files === void 0 ? void 0 : files.careerBgImage) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.path;
        const contactBgImage = (_t = (_s = files === null || files === void 0 ? void 0 : files.contactBgImage) === null || _s === void 0 ? void 0 : _s[0]) === null || _t === void 0 ? void 0 : _t.path;
        const awardBgImage = (_v = (_u = files === null || files === void 0 ? void 0 : files.awardBgImage) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.path;
        const ourPartnerBgImage = (_x = (_w = files === null || files === void 0 ? void 0 : files.ourPartnerBgImage) === null || _w === void 0 ? void 0 : _w[0]) === null || _x === void 0 ? void 0 : _x.path;
        const mediaCoverageBgImage = (_z = (_y = files === null || files === void 0 ? void 0 : files.mediaCoverageBgImage) === null || _y === void 0 ? void 0 : _y[0]) === null || _z === void 0 ? void 0 : _z.path;
        const galleryBgImage = (_1 = (_0 = files === null || files === void 0 ? void 0 : files.galleryBgImage) === null || _0 === void 0 ? void 0 : _0[0]) === null || _1 === void 0 ? void 0 : _1.path;
        const faqBgImage = (_3 = (_2 = files === null || files === void 0 ? void 0 : files.faqBgImage) === null || _2 === void 0 ? void 0 : _2[0]) === null || _3 === void 0 ? void 0 : _3.path;
        const privacyBgImage = (_5 = (_4 = files === null || files === void 0 ? void 0 : files.privacyBgImage) === null || _4 === void 0 ? void 0 : _4[0]) === null || _5 === void 0 ? void 0 : _5.path;
        const termsBgImage = (_7 = (_6 = files === null || files === void 0 ? void 0 : files.termsBgImage) === null || _6 === void 0 ? void 0 : _6[0]) === null || _7 === void 0 ? void 0 : _7.path;
        // existing
        const existingData = yield seopages_model_1.SEOPages.findOne({
            aboutTitle,
            aboutSubTitle,
            servicesTitle,
            servicesSubTitle,
            servicesDetailsTitle,
            servicesDetailsSubTitle,
            productTitle,
            productSubTitle,
            productDetailsTitle,
            productDetailsSubTitle,
            newsTitle,
            newsSubTitle,
            newsDetailsTitle,
            newsDetailsSubTitle,
            careerTitle,
            careerSubTitle,
            contactTitle,
            contactSubTitle,
            awardTitle,
            awardSubTitle,
            ourPartnerTitle,
            ourPartnerSubTitle,
            mediaCoverageTitle,
            mediaCoverageSubTitle,
            galleryTitle,
            gallerySubTitle,
            faqTitle,
            faqSubTitle,
            privacyTitle,
            privacySubTitle,
            termsTitle,
            termsSubTitle,
        });
        if (existingData) {
            return next(new Error("Data already exists"));
        }
        // validate
        const validateData = yield seoPages_validation_1.SEOPagesSchema.parse({
            aboutTitle,
            aboutSubTitle,
            servicesTitle,
            servicesSubTitle,
            servicesDetailsTitle,
            servicesDetailsSubTitle,
            productTitle,
            productSubTitle,
            productDetailsTitle,
            productDetailsSubTitle,
            newsTitle,
            newsSubTitle,
            newsDetailsTitle,
            newsDetailsSubTitle,
            careerTitle,
            careerSubTitle,
            contactTitle,
            contactSubTitle,
            awardTitle,
            awardSubTitle,
            ourPartnerTitle,
            ourPartnerSubTitle,
            mediaCoverageTitle,
            mediaCoverageSubTitle,
            galleryTitle,
            gallerySubTitle,
            faqTitle,
            faqSubTitle,
            privacyTitle,
            privacySubTitle,
            termsTitle,
            termsSubTitle,
            aboutBgImage,
            servicesBgImage,
            servicesDetailsBgImage,
            productBgImage,
            productDetailsBgImage,
            newsBgImage,
            newsDetailsBgImage,
            careerBgImage,
            contactBgImage,
            awardBgImage,
            ourPartnerBgImage,
            mediaCoverageBgImage,
            galleryBgImage,
            faqBgImage,
            privacyBgImage,
            termsBgImage,
        });
        // /create
        const createSeoPages = yield seopages_model_1.SEOPages.create(validateData);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "SeoPages created successfully",
            data: createSeoPages,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createSeoPages = createSeoPages;
const getAllSeoPages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getAllSeoPages = yield seopages_model_1.SEOPages.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "SeoPages retrieved successfully",
            data: getAllSeoPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSeoPages = getAllSeoPages;
const getByIdSeoPages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getByIdSeoPages = yield seopages_model_1.SEOPages.findOne({ _id: req.params.id });
        if (!getByIdSeoPages) {
            return next(new appError_1.appError("SeoPages not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "SeoPages retrieved successfully",
            data: getByIdSeoPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getByIdSeoPages = getByIdSeoPages;
const updateSeoPages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    try {
        const seoPagesById = req.params.id;
        const validatedData = seoPages_validation_1.SEOPagesSchema.parse(req.body);
        const existingSeoPages = yield seopages_model_1.SEOPages.findById(seoPagesById);
        if (!existingSeoPages) {
            return next(new appError_1.appError("SeoPages not found", 404));
        }
        const files = req.files;
        if ((_a = files === null || files === void 0 ? void 0 : files.aboutBgImage) === null || _a === void 0 ? void 0 : _a[0]) {
            validatedData.aboutBgImage = files.aboutBgImage[0].path;
        }
        if ((_b = files === null || files === void 0 ? void 0 : files.servicesBgImage) === null || _b === void 0 ? void 0 : _b[0]) {
            validatedData.servicesBgImage = files.servicesBgImage[0].path;
        }
        if ((_c = files === null || files === void 0 ? void 0 : files.servicesDetailsBgImage) === null || _c === void 0 ? void 0 : _c[0]) {
            validatedData.servicesDetailsBgImage =
                files.servicesDetailsBgImage[0].path;
        }
        if ((_d = files === null || files === void 0 ? void 0 : files.productBgImage) === null || _d === void 0 ? void 0 : _d[0]) {
            validatedData.productBgImage = files.productBgImage[0].path;
        }
        if ((_e = files === null || files === void 0 ? void 0 : files.productDetailsBgImage) === null || _e === void 0 ? void 0 : _e[0]) {
            validatedData.productDetailsBgImage = files.productDetailsBgImage[0].path;
        }
        if ((_f = files === null || files === void 0 ? void 0 : files.newsBgImage) === null || _f === void 0 ? void 0 : _f[0]) {
            validatedData.newsBgImage = files.newsBgImage[0].path;
        }
        if ((_g = files === null || files === void 0 ? void 0 : files.newsDetailsBgImage) === null || _g === void 0 ? void 0 : _g[0]) {
            validatedData.newsDetailsBgImage = files.newsDetailsBgImage[0].path;
        }
        if ((_h = files === null || files === void 0 ? void 0 : files.careerBgImage) === null || _h === void 0 ? void 0 : _h[0]) {
            validatedData.careerBgImage = files.careerBgImage[0].path;
        }
        if ((_j = files === null || files === void 0 ? void 0 : files.contactBgImage) === null || _j === void 0 ? void 0 : _j[0]) {
            validatedData.contactBgImage = files.contactBgImage[0].path;
        }
        if ((_k = files === null || files === void 0 ? void 0 : files.awardBgImage) === null || _k === void 0 ? void 0 : _k[0]) {
            validatedData.awardBgImage = files.awardBgImage[0].path;
        }
        if ((_l = files === null || files === void 0 ? void 0 : files.ourPartnerBgImage) === null || _l === void 0 ? void 0 : _l[0]) {
            validatedData.ourPartnerBgImage = files.ourPartnerBgImage[0].path;
        }
        if ((_m = files === null || files === void 0 ? void 0 : files.mediaCoverageBgImage) === null || _m === void 0 ? void 0 : _m[0]) {
            validatedData.mediaCoverageBgImage = files.mediaCoverageBgImage[0].path;
        }
        if ((_o = files === null || files === void 0 ? void 0 : files.galleryBgImage) === null || _o === void 0 ? void 0 : _o[0]) {
            validatedData.galleryBgImage = files.galleryBgImage[0].path;
        }
        if ((_p = files === null || files === void 0 ? void 0 : files.privacyBgImage) === null || _p === void 0 ? void 0 : _p[0]) {
            validatedData.privacyBgImage = files.privacyBgImage[0].path;
        }
        if ((_q = files === null || files === void 0 ? void 0 : files.termsBgImage) === null || _q === void 0 ? void 0 : _q[0]) {
            validatedData.termsBgImage = files.termsBgImage[0].path;
        }
        const updatedSeoPages = yield seopages_model_1.SEOPages.findByIdAndUpdate(seoPagesById, validatedData, {
            new: true,
            runValidators: true,
        });
        if (!updatedSeoPages) {
            return next(new appError_1.appError("SeoPages not found", 404));
        }
        yield updatedSeoPages.save();
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "SeoPages updated successfully",
            data: updatedSeoPages,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSeoPages = updateSeoPages;
const deleteSeoPages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteSeoPages = yield seopages_model_1.SEOPages.findOneAndDelete({
            _id: req.params.id,
        });
        if (!deleteSeoPages) {
            return next(new appError_1.appError("SeoPages not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "SeoPages deleted successfully",
            data: deleteSeoPages,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSeoPages = deleteSeoPages;
