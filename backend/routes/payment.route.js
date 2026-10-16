import express from "express";

const { createOrder, verifyPayment } = require("../controllers/payment.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;