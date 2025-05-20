const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/database")

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      res.status(400)
      throw new Error("User already exists")
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const [result] = await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])

    if (result.affectedRows === 1) {
      // Get the created user
      const [rows] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [result.insertId])

      const user = rows[0]

      res.status(201).json({
        user,
        token: generateToken(user.id),
      })
    } else {
      res.status(400)
      throw new Error("Invalid user data")
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Check for user email
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email])

    if (rows.length === 0) {
      res.status(401)
      throw new Error("Invalid credentials")
    }

    const user = rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      res.status(401)
      throw new Error("Invalid credentials")
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user.id),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    res.json(req.user)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
}
