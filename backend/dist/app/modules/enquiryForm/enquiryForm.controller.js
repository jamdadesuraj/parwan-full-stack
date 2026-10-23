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
exports.deleteEnquiry = exports.updateEnquiryStatus = exports.getEnquiryById = exports.getAllEnquiries = exports.createEnquiry = void 0;
const appError_1 = require("../../errors/appError");
const enquiryForm_validation_1 = require("./enquiryForm.validation");
const enquiryForm_model_1 = require("./enquiryForm.model");
const enquiryForm_interface_1 = require("./enquiryForm.interface");
const createEnquiry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = enquiryForm_validation_1.enquirySchema.parse(req.body);
        yield enquiryForm_model_1.Enquiry.create(validateData);
        // public endpoint: don't echo the stored document back
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Your quote request has been sent successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createEnquiry = createEnquiry;
const getAllEnquiries = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const filter = { isDeleted: { $ne: true } };
        const status = req.query.status;
        if (status && enquiryForm_interface_1.ENQUIRY_STATUSES.includes(status)) {
            filter.status = status;
        }
        const [data, total] = yield Promise.all([
            enquiryForm_model_1.Enquiry.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            enquiryForm_model_1.Enquiry.countDocuments(filter),
        ]);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: data.length > 0
                ? "Enquiries retrieved successfully"
                : "No enquiries found",
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
            data,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllEnquiries = getAllEnquiries;
const getEnquiryById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enquiry = yield enquiryForm_model_1.Enquiry.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!enquiry) {
            return next(new appError_1.appError("Enquiry not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Enquiry retrieved successfully",
            data: enquiry,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEnquiryById = getEnquiryById;
const updateEnquiryStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = enquiryForm_validation_1.updateEnquiryStatusSchema.parse(req.body);
        const enquiry = yield enquiryForm_model_1.Enquiry.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { $set: { status } }, { new: true });
        if (!enquiry) {
            return next(new appError_1.appError("Enquiry not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Status updated successfully",
            data: enquiry,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEnquiryStatus = updateEnquiryStatus;
// soft delete, so an accidental click doesn't lose a customer enquiry
const deleteEnquiry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const enquiry = yield enquiryForm_model_1.Enquiry.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { $set: { isDeleted: true } }, { new: true });
        if (!enquiry) {
            return next(new appError_1.appError("Enquiry not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Enquiry deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteEnquiry = deleteEnquiry;
