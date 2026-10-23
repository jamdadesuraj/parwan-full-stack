import express from "express";
import {
  createEnquiry,
  deleteEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
} from "./enquiryForm.controller";

const router = express.Router();

router.post("/", createEnquiry); // public: the website modal
router.get("/", getAllEnquiries); // admin only
router.get("/:id", getEnquiryById); // admin only
router.patch("/:id/status", updateEnquiryStatus); // admin only
router.delete("/:id", deleteEnquiry); // admin only

export const enquiryRouter = router;
