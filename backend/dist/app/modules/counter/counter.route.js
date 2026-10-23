"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.counterRouter = void 0;
const express_1 = __importDefault(require("express"));
const counter_controller_1 = require("./counter.controller");
const router = express_1.default.Router();
router.post("/", counter_controller_1.createCounter);
router.get("/", counter_controller_1.getAllCounterData);
router.put("/:id", counter_controller_1.updateCounter);
exports.counterRouter = router;
