const express = require("express");
const router = express.Router();
const { signup, login, getMe, logout } = require("../controllers/AuthController");
const { protect } = require("../middleware/AuthMiddleware");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;