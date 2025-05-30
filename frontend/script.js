const express = require("express")
const cors = require("cors")
const { initDatabase, closeDatabase } = require("./config/database")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({ origin: "*" }))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint (available before database initialization)
app.get("/health", (req, res) => {
  console.log("Health check requested")
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Initialize database and start server
async function startServer() {
  try {
    console.log("Starting server initialization...")

    // Initialize database connection
    await initDatabase()
    console.log("Database initialized successfully")

    // Import routes after database is initialized
    const authRoutes = require("./routes/auth.routes")
    const todoRoutes = require("./routes/todo.routes")

    // Setup routes
    app.use("/auth", authRoutes)
    app.use("/todos", todoRoutes)

    // 404 handler
    app.use("*", (req, res) => {
      console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`)
      res.status(404).json({ error: "Route not found" })
    })

    // Global error handling middleware
    app.use((err, req, res, next) => {
      console.error("Global error handler:", err)

      // Handle specific error types
      if (err.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid JSON in request body" })
      }

      if (err.type === "entity.too.large") {
        return res.status(413).json({ error: "Request body too large" })
      }

      res.status(500).json({ error: "Internal server error" })
    })

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Health check available at http://localhost:${PORT}/health`)
    })

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received, shutting down gracefully...")
      server.close(async () => {
        await closeDatabase()
        process.exit(0)
      })
    })

    process.on("SIGINT", async () => {
      console.log("SIGINT received, shutting down gracefully...")
      server.close(async () => {
        await closeDatabase()
        process.exit(0)
      })
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Start the server
startServer()
