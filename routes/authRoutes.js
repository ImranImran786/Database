const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware"); // Import 'protect' middleware

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // Protected logout, using 'protect' middleware

module.exports = router;
