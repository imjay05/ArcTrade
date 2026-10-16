import express from "express";
import { newOrder, getAllOrders } from "../controllers/order.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, newOrder);
router.get("/", protect, getAllOrders);

export default router;