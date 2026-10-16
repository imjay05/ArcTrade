const express = require("express");
const router = express.Router();
const { getUniverse, addCustomStock, removeCustomStock } = require("../controllers/watchList.controller.js");
const { protect } = require("../middleware/auth.middleware");

router.get("/universe", getUniverse);
router.post("/custom", protect, addCustomStock);
router.delete("/custom/:symbol", protect, removeCustomStock);

module.exports = router;