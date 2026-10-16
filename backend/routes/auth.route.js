const express = require("express");
const router = express.Router();
const { signup, login, getMe, logout } = require("../controllers/auth.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;