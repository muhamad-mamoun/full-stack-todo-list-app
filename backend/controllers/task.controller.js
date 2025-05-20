const db = require("../config/database")

// @desc    Get all tasks for current user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", [req.user.id])

    res.json(rows)
  } catch (error) {
    next(error)
  }
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { name, description, priority } = req.body

    const [result] = await db.query("INSERT INTO tasks (user_id, name, description, priority) VALUES (?, ?, ?, ?)", [
      req.user.id,
      name,
      description || "",
      priority || "medium",
    ])

    if (result.affectedRows === 1) {
      const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [result.insertId])

      res.status(201).json(rows[0])
    } else {
      res.status(400)
      throw new Error("Invalid task data")
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, priority } = req.body

    // Check if task exists and belongs to user
    const [existingTasks] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (existingTasks.length === 0) {
      res.status(404)
      throw new Error("Task not found")
    }

    const [result] = await db.query(
      "UPDATE tasks SET name = ?, description = ?, priority = ? WHERE id = ? AND user_id = ?",
      [name, description || "", priority || "medium", id, req.user.id],
    )

    if (result.affectedRows === 1) {
      const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id])

      res.json(rows[0])
    } else {
      res.status(400)
      throw new Error("Failed to update task")
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if task exists and belongs to user
    const [existingTasks] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (existingTasks.length === 0) {
      res.status(404)
      throw new Error("Task not found")
    }

    const [result] = await db.query("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (result.affectedRows === 1) {
      res.json({ id, message: "Task removed" })
    } else {
      res.status(400)
      throw new Error("Failed to delete task")
    }
  } catch (error) {
    next(error)
  }
}

// @desc    Toggle task completion status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskCompletion = async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if task exists and belongs to user
    const [existingTasks] = await db.query("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id])

    if (existingTasks.length === 0) {
      res.status(404)
      throw new Error("Task not found")
    }

    const task = existingTasks[0]
    const newCompletionStatus = !task.completed

    const [result] = await db.query("UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?", [
      newCompletionStatus,
      id,
      req.user.id,
    ])

    if (result.affectedRows === 1) {
      const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id])

      res.json(rows[0])
    } else {
      res.status(400)
      throw new Error("Failed to update task status")
    }
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
}
