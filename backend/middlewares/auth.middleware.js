const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    console.log("Auth middleware: Checking authorization header")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth middleware: No valid authorization header found")
      return res.status(401).json({ error: "Access token required" })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    console.log(`Auth middleware: Token verified for user ID: ${decoded.userId}`)
    next()
  } catch (error) {
    console.error("Auth middleware error:", error.message)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    return res.status(401).json({ error: "Invalid token" })
  }
}

module.exports = authMiddleware
