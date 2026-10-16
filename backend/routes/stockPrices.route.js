import express from "express";

const { getStockPrices, getBulkQuotes } = require("../controllers/stockPrice.controller.js");

const router = express.Router();
router.get("/", getStockPrices);
router.get("/bulk", getBulkQuotes);


export default router;