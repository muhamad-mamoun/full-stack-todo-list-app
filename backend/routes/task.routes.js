const express = require("express")
const router = express.Router()
const { check } = require("express-validator")
const { validate } = require("../middlewares/validation.middleware")
const { protect } = require("../middlewares/auth.middleware")
const { getTasks, createTask, updateTask, deleteTask, toggleTaskCompletion } = require("../controllers/task.controller")

// Get all tasks for current user
router.get("/", protect, getTasks)

// Create a new task
router.post(
  "/",
  protect,
  [
    check("name", "Task name is required").not().isEmpty(),
    check("priority", "Priority must be low, medium, or high").isIn(["low", "medium", "high"]),
  ],
  validate,
  createTask,
)

// Update a task
router.put(
  "/:id",
  protect,
  [
    check("name", "Task name is required").not().isEmpty(),
    check("priority", "Priority must be low, medium, or high").isIn(["low", "medium", "high"]),
  ],
  validate,
  updateTask,
)

// Delete a task
router.delete("/:id", protect, deleteTask)

// Toggle task completion status
router.patch("/:id/toggle", protect, toggleTaskCompletion)

module.exports = router
