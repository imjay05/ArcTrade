const express = require("express");
const router = express.Router();
const { getUniverse } = require("../controllers/WatchlistController");

router.get("/universe", getUniverse);

module.exports = router;