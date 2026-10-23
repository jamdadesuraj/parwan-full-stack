"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.howToOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const howToOrders_controller_1 = require("./howToOrders.controller");
const router = express_1.default.Router();
router.post("/", howToOrders_controller_1.createHowToOrder);
router.get("/", howToOrders_controller_1.getAllHowToOrder);
router.get("/:id", howToOrders_controller_1.getHowToOrderById);
router.put("/:id", howToOrders_controller_1.updateHowToOrder);
router.delete("/:id", howToOrders_controller_1.deleteHowToOrder);
exports.howToOrderRouter = router;
