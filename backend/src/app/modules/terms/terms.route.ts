import express from "express";
import { createTerms, getAllTerms, updateTerms } from "./terms.controller";

const router = express.Router();

router.post("/", createTerms);

router.get("/", getAllTerms);

router.put("/:id", updateTerms);

export const termsRouter = router;
