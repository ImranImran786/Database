const express = require("express");
const User = require("../models/User"); // ✅ Add this line
const {
  getUsers,
  deleteUser,
  updateUserRole,
  getUserById, // ✅ Add this
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

// Admin-only routes
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);
// router.delete("/delete/:id", protect, admin, deleteUser);  // <-- changed path to avoid conflict
router.get("/details/:id", protect, getUserById); // <-- changed path to avoid conflict

router.put("/:id/role", protect, admin, updateUserRole);
router.get("/:id", protect, getUserById);
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    console.log("Updating status for:", req.params.id, "New status:", status); // ✅ Add this
    await User.findByIdAndUpdate(req.params.id, { status });
    res.status(200).json({ message: 'Status updated' });
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: 'Failed to update status' });
  }
});

module.exports = router;