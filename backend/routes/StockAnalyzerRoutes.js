const express = require("express");
const router = express.Router();
const { getHoldingsByDomain } = require("../controllers/StockAnalyzerController");
const { protect } = require("../middleware/AuthMiddleware");

router.get("/", protect, getHoldingsByDomain);

module.exports = router;