import express from "express";
const { newOrder, getAllOrders } = require("../controllers/order.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/new", protect, newOrder);
router.get("/", protect, getAllOrders);

export default router;