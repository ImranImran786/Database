const jwt = require("jsonwebtoken");
const User = require("../models/User");


// Protect middleware to check if the user is authenticated
const protect = async (req, res, next) => {
  let token;

  // Check if token is provided in the authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get the token from the Authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user from the database (excluding password field)
      req.user = await User.findById(decoded.id).select("-password");

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // In case of token verification failure
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // If no token is provided in the header
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Admin middleware to check if the user has admin role
const admin = (req, res, next) => {
  // Check if the user is an admin
  if (req.user && req.user.role === "admin") {
    next(); // Proceed to the next middleware/route handler if admin
  } else {
    // If not an admin, respond with a 403 Forbidden error
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };
