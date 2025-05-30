const express = require("express")
const cors = require("cors")
const { initDatabase } = require("./config/database")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({ origin: "*" }))
app.use(express.json())

// Routes setup function
function setupRoutes() {
  const authRoutes = require("./routes/auth.routes")
  const todoRoutes = require("./routes/todo.routes")

  app.use("/auth", authRoutes)
  app.use("/todos", todoRoutes)

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() })
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message)
  res.status(500).json({ error: "Internal server error" })
})

// Start server function
async function startServer() {
  try {
    await initDatabase()
    setupRoutes()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGTERM", () => process.exit())
process.on("SIGINT", () => process.exit())
