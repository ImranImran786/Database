const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// Get all users (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// Delete User (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});




// const getUserById = asyncHandler(async (req, res) => {
//   const cleanId = req.params.id.trim(); // ✅ removes \n or spaces
//   const user = await User.findById(cleanId).select("-password");

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   res.json(user);
// });

// const getUserById = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password"); // Exclude password

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id.trim();
    console.log("Fetching user ID:", userId);

    const user = await User.findById(userId).select("-password");

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Found user:", user);
    res.json(user);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server error" });
  }
};








// Update User Role (Admin only)
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!["admin", "client", "driver"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  user.role = role;
  await user.save();

  res.json({ message: "User role updated successfully", user });
});




// ✅ EXPORT ALL CONTROLLERS HERE
module.exports = {
  getUsers,
  deleteUser,
  updateUserRole,
  getUserById,
};


// module.exports = { getUsers, deleteUser, updateUserRole };
