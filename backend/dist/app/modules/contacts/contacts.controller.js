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
exports.deleteContact = exports.getContactById = exports.getAllContacts = exports.createContact = void 0;
const appError_1 = require("../../errors/appError");
const contacts_validation_1 = require("./contacts.validation");
const contacts_model_1 = require("./contacts.model");
const createContact = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validateData = contacts_validation_1.contactSchema.parse(req.body);
        yield contacts_model_1.Contact.create(validateData);
        // public endpoint: don't echo the stored document back
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Your enquiry has been sent successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createContact = createContact;
const getAllContacts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
        const filter = { isDeleted: { $ne: true } };
        const [data, total] = yield Promise.all([
            contacts_model_1.Contact.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            contacts_model_1.Contact.countDocuments(filter),
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
exports.getAllContacts = getAllContacts;
const getContactById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contacts_model_1.Contact.findOne({
            _id: req.params.id,
            isDeleted: { $ne: true },
        });
        if (!contact) {
            return next(new appError_1.appError("Enquiry not found", 404));
        }
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Enquiry retrieved successfully",
            data: contact,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getContactById = getContactById;
const deleteContact = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contact = yield contacts_model_1.Contact.findOneAndUpdate({ _id: req.params.id, isDeleted: { $ne: true } }, { $set: { isDeleted: true } }, { new: true });
        if (!contact) {
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
exports.deleteContact = deleteContact;
