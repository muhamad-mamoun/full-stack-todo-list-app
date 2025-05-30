const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { getDatabase } = require("../config/database")

const authController = {
  async register(req, res) {
    let db
    try {
      db = getDatabase()
      const { username, password } = req.body
      console.log(`Registration attempt for username: ${username}`)

      // Validate input
      if (!username || !password) {
        console.log("Registration failed: Missing username or password")
        return res.status(400).json({ error: "Username and password are required" })
      }

      if (username.length < 3) {
        console.log("Registration failed: Username too short")
        return res.status(400).json({ error: "Username must be at least 3 characters long" })
      }

      if (password.length < 6) {
        console.log("Registration failed: Password too short")
        return res.status(400).json({ error: "Password must be at least 6 characters long" })
      }

      // Check if user already exists
      console.log("Checking if user already exists...")
      const [existingUsers] = await db.execute("SELECT id FROM users WHERE username = ?", [username])

      if (existingUsers.length > 0) {
        console.log(`Registration failed: Username ${username} already exists`)
        return res.status(409).json({ error: "Username already exists" })
      }

      // Hash password
      console.log("Hashing password...")
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(password, saltRounds)

      // Insert user
      console.log("Inserting new user into database...")
      const [result] = await db.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
        username,
        passwordHash,
      ])

      console.log(`User registered successfully: ${username} (ID: ${result.insertId})`)

      res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId,
      })
    } catch (error) {
      console.error("Registration error:", error)

      // Handle specific database errors
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Username already exists" })
      }

      if (error.code === "ER_NO_SUCH_TABLE") {
        return res.status(500).json({ error: "Database tables not initialized" })
      }

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error during registration" })
    }
  },

  async login(req, res) {
    let db
    try {
      db = getDatabase()
      const { username, password } = req.body
      console.log(`Login attempt for username: ${username}`)

      // Validate input
      if (!username || !password) {
        console.log("Login failed: Missing username or password")
        return res.status(400).json({ error: "Username and password are required" })
      }

      // Find user
      console.log("Looking up user in database...")
      const [users] = await db.execute("SELECT id, username, password_hash FROM users WHERE username = ?", [username])

      if (users.length === 0) {
        console.log(`Login failed: User ${username} not found`)
        return res.status(401).json({ error: "Invalid credentials" })
      }

      const user = users[0]

      // Verify password
      console.log("Verifying password...")
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        console.log(`Login failed: Invalid password for ${username}`)
        return res.status(401).json({ error: "Invalid credentials" })
      }

      // Generate JWT token
      console.log("Generating JWT token...")
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not configured")
        return res.status(500).json({ error: "Server configuration error" })
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "24h" })

      console.log(`Login successful for user: ${username} (ID: ${user.id})`)

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      })
    } catch (error) {
      console.error("Login error:", error)

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error during login" })
    }
  },

  async logout(req, res) {
    try {
      const userId = req.user?.userId
      console.log(`Logout request from user ID: ${userId}`)

      // In a real app, you might want to blacklist the token
      // For now, we'll just send a success response
      console.log("Logout successful")
      res.json({ message: "Logout successful" })
    } catch (error) {
      console.error("Logout error:", error)
      res.status(500).json({ error: "Internal server error during logout" })
    }
  },
}

module.exports = authController
