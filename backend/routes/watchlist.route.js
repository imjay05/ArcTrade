import express from "express";

const { getUniverse, addCustomStock, removeCustomStock } = require("../controllers/watchList.controller.js");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/universe", getUniverse);
router.post("/custom", protect, addCustomStock);
router.delete("/custom/:symbol", protect, removeCustomStock);


export default router;