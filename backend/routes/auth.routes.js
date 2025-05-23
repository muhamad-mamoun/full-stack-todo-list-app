const express = require("express")
const router = express.Router()
const { check } = require("express-validator")
const { validate } = require("../middlewares/validation.middleware")
const { protect } = require("../middlewares/auth.middleware")
const { registerUser, loginUser, getUserProfile } = require("../controllers/auth.controller")

// Register a new user
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  validate,
  registerUser,
)

// Login user
router.post(
  "/login",
  [check("email", "Please include a valid email").isEmail(), check("password", "Password is required").exists()],
  validate,
  loginUser,
)

// Get user profile
router.get("/profile", protect, getUserProfile)

module.exports = router
