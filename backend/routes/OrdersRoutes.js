const express = require("express");
const router = express.Router();
const { newOrder, getAllOrders } = require("../controllers/OrdersController");
const { protect } = require("../middleware/AuthMiddleware");

router.post("/new", protect, newOrder);
router.get("/", protect, getAllOrders);

module.exports = router;