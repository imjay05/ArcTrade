const express = require("express");
const router = express.Router();
const { newOrder, getAllOrders } = require("../controllers/order.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

router.post("/new", protect, newOrder);
router.get("/", protect, getAllOrders);

module.exports = router;