import express from "express";
import { getStockPrices, getBulkQuotes } from "../controllers/stockPrice.controller";

const router = express.Router();

router.get("/", getStockPrices);
router.get("/bulk", getBulkQuotes);

export default router;