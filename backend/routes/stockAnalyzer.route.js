const express = require("express");
const router = express.Router();
const { getHoldingsByDomain } = require("../controllers/stockAnalyzer.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

router.get("/", protect, getHoldingsByDomain);

module.exports = router;