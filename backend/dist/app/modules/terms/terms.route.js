"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.termsRouter = void 0;
const express_1 = __importDefault(require("express"));
const terms_controller_1 = require("./terms.controller");
const router = express_1.default.Router();
router.post("/", terms_controller_1.createTerms);
router.get("/", terms_controller_1.getAllTerms);
router.put("/:id", terms_controller_1.updateTerms);
exports.termsRouter = router;
