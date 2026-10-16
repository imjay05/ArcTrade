const express = require("express");
const router = express.Router();
const { getStockPrices, getBulkQuotes } = require("../controllers/stockPrice.controller.js");

router.get("/", getStockPrices);
router.get("/bulk", getBulkQuotes);

module.exports = router;