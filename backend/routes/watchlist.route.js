import express from "express";
import { getUniverse, addCustomStock, removeCustomStock } from "../controllers/watchList.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/universe", getUniverse);
router.post("/", protect, addCustomStock);
router.delete("/:symbol", protect, removeCustomStock);

export default router;