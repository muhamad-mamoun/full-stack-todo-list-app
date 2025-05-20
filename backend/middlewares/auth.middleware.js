const jwt = require("jsonwebtoken")
const db = require("../config/database")

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]
      console.log("Received token:", token) // Log the token for debugging

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from database
      const [rows] = await db.query("SELECT id, name, email FROM users WHERE id = ?", [decoded.id])

      if (rows.length === 0) {
        res.status(401)
        throw new Error("Not authorized, user not found")
      }

      // Set user in request object
      req.user = rows[0]
      next()
    } catch (error) {
      console.error("Auth middleware error:", error.message) // Log error message
      if (error.name === "JsonWebTokenError") {
        console.error("Malformed token:", token) // Log malformed token
      }
      res.status(401).json({ message: "Not authorized, invalid token" }) // Send proper error response
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" }) // Handle missing token
  }
}

module.exports = { protect }
