
import express from "express";
import { adminSignup, loginController } from "./auth.controller";

const router = express.Router();

router.post("/signin", loginController);
router.post("/signup", adminSignup);

export const authRouter = router;
