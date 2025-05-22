const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./middlewares/error.middleware")
const db = require("./config/database")

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 3000

// Enhanced CORS configuration
const corsOptions = {
  origin: true, // or specify your frontend domains ['http://localhost:3001', 'https://yourdomain.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // For legacy browser support
}

// Middleware
app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) // Explicit OPTIONS handler for all routes

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Test database connection
db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully")
    connection.release()
  })
  .catch((err) => {
    console.error("Database connection error:", err)
  })

// Routes
app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/tasks", require("./routes/task.routes"))

// Add route for health checks
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handler middleware
app.use(errorHandler)

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err)
  server.close(() => process.exit(1))
})