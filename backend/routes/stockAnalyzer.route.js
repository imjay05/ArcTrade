import express from "express";

const { getHoldingsByDomain } = require("../controllers/stockAnalyzer.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/", protect, getHoldingsByDomain);

export default router;