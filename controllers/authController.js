// const User = require("../models/User");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const asyncHandler = require("express-async-handler"); // Keep this line only once

// // Generate JWT Token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
// };

// // Register User
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const userExists = await User.findOne({ email });

//   if (userExists) {
//     return res.status(400).json({ message: "User already exists" });
//   }

//   // Hash Password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);

//   // Create New User with Default Role as "Client"
//   const user = await User.create({
//     name,
//     email,
//     password: hashedPassword,
//     role: "client", // Ensuring the default role is "client"
//   });

//   if (user) {
//     res.status(201).json({
//       _id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role, // This will always be "client" initially
//       token: generateToken(user.id),
//     });
//   } else {
//     res.status(400).json({ message: "Invalid user data" });
//   }
// });

// // Login User
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });

//   if (user && (await bcrypt.compare(password, user.password))) {
//     const jwtToken = generateToken(user.id);

//     res.json({
//       token: jwtToken,
//       driverId: user._id, // this is your driverId
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     });
//   } else {
//     res.status(401).json({ message: "Invalid email or password" });
//   }
// });

// // Logout User - update driver status to "Offline"
// // Logout User - update driver status to "Offline"
// const logoutUser = asyncHandler(async (req, res) => {
//   const userId = req.driverId;

//   // Update status to Offline
//   await User.findByIdAndUpdate(userId, {
//     status: "Offline",
//     connectedClientId: null, // optional, clear client connection
//   });

//   res.status(200).json({ message: "User logged out successfully" });
// });


// module.exports = {
//   registerUser,
//   loginUser,
//   logoutUser,
// };



// controllers/authController.js
const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    fatherName,
    email,
    password,
    cnic,
    phone,
    otherPhone,
    homeAddress,
    licenseNumber,
    role,
  } = req.body;

  if (!name || !email || !password || !cnic || !phone || !homeAddress) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    fatherName,
    email,
    password: hashedPassword,
    cnic,
    phone,
    otherPhone,
    homeAddress,
    licenseNumber,
    role,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Signup failed" });
  }
});

module.exports = {
  registerUser,
  loginUser: asyncHandler(async (req, res) => {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
    
      if (user && (await bcrypt.compare(password, user.password))) {
        const jwtToken = generateToken(user.id);
    
        res.json({
          token: jwtToken,
          driverId: user._id, // this is your driverId
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
  }),
  logoutUser: asyncHandler(async (req, res) => {
    res.json({ message: "Logged out" });
  }),
};
