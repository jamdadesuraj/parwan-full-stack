import express from "express";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
} from "./contacts.controller";

const router = express.Router();

router.post("/", createContact); // public: the website form
router.get("/", getAllContacts); // admin only
router.get("/:id", getContactById); // admin only
router.delete("/:id", deleteContact); // admin only

export const contactRouter = router;
