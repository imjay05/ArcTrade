const express = require("express");
const router = express.Router();
const { getUniverse, addCustomStock, removeCustomStock } = require("../controllers/WatchlistController");
const { protect } = require("../middleware/AuthMiddleware");

router.get("/universe", getUniverse);
router.post("/custom", protect, addCustomStock);
router.delete("/custom/:symbol", protect, removeCustomStock);

module.exports = router;