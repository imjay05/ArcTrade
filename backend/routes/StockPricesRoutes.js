const express = require("express");
const router = express.Router();
const { getStockPrices, getBulkQuotes } = require("../controllers/StockPricesController");

router.get("/", getStockPrices);
router.get("/bulk", getBulkQuotes);

module.exports = router;