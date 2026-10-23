import express from "express";
import {
  createFaq,
  deleteFaq,
  getAllFaq,
  getFaqById,
  updateFaq,
} from "./faq.controller";

const router = express.Router();

router.post("/", createFaq);
router.get("/", getAllFaq);
router.get("/:id", getFaqById);
router.put("/:id", updateFaq);
router.delete("/:id", deleteFaq);

export const faqRouter = router;
