import express from "express";
import { getHoldingsByDomain } from "../controllers/stockAnalyzer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getHoldingsByDomain);

export default router;