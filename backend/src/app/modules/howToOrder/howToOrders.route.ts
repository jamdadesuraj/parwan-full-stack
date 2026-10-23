import express from "express";
import {
  createHowToOrder,
  deleteHowToOrder,
  getAllHowToOrder,
  getHowToOrderById,
  updateHowToOrder,
} from "./howToOrders.controller";

const router = express.Router();

router.post("/", createHowToOrder);
router.get("/", getAllHowToOrder);
router.get("/:id", getHowToOrderById);
router.put("/:id", updateHowToOrder);
router.delete("/:id", deleteHowToOrder);

export const howToOrderRouter = router;
