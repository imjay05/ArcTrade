const express = require("express");
const router = express.Router();
const { getAllHoldings } = require("../controllers/HoldingsController");
const { protect } = require("../middleware/AuthMiddleware");

router.get("/", protect, getAllHoldings);

module.exports = router;