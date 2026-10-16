const express = require("express");
const router = express.Router();
const { getAllHoldings } = require("../controllers/holding.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

router.get("/", protect, getAllHoldings);

module.exports = router;