import express from "express";
import { getAllHoldings } from "../controllers/holding.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllHoldings);

export default router;