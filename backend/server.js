const express = require("express")
const cors = require("cors")
const { errorHandler } = require("./middlewares/error.middleware")
const db = require("./config/database")

const app = express()
const PORT = process.env.PORT || 3000

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

db.getConnection()
  .then((connection) => {
    console.log("Database connected successfully")
    connection.release()
  })
  .catch((err) => {
    console.error("Database connection error:", err)
  })

app.use("/api/auth", require("./routes/auth.routes"))
app.use("/api/tasks", require("./routes/task.routes"))

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err)
  server.close(() => process.exit(1))
})