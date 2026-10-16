import express from "express";
const { getAllHoldings } = require("../controllers/holding.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();
router.get("/", protect, getAllHoldings);

export default router;