const { getDatabase } = require("../config/database")

const todoController = {
  async getTodos(req, res) {
    let db
    try {
      db = getDatabase()
      const userId = req.user.userId
      console.log(`Fetching todos for user ID: ${userId}`)

      const [todos] = await db.execute(
        "SELECT id, title, description, completed, created_at FROM todos WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
      )

      console.log(`Found ${todos.length} todos for user ID: ${userId}`)
      res.json(todos)
    } catch (error) {
      console.error("Get todos error:", error)

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error while fetching todos" })
    }
  },

  async createTodo(req, res) {
    let db
    try {
      db = getDatabase()
      const userId = req.user.userId
      const { title, description } = req.body

      console.log(`Creating todo for user ID: ${userId}, title: ${title}`)

      // Validate input
      if (!title || title.trim().length === 0) {
        console.log("Create todo failed: Missing or empty title")
        return res.status(400).json({ error: "Title is required and cannot be empty" })
      }

      if (title.length > 255) {
        console.log("Create todo failed: Title too long")
        return res.status(400).json({ error: "Title cannot exceed 255 characters" })
      }

      const trimmedTitle = title.trim()
      const trimmedDescription = description ? description.trim() : ""

      const [result] = await db.execute("INSERT INTO todos (user_id, title, description) VALUES (?, ?, ?)", [
        userId,
        trimmedTitle,
        trimmedDescription,
      ])

      // Fetch the newly created todo
      const [newTodo] = await db.execute(
        "SELECT id, title, description, completed, created_at FROM todos WHERE id = ?",
        [result.insertId],
      )

      console.log(`Todo created successfully: ID ${result.insertId}`)
      res.status(201).json(newTodo[0])
    } catch (error) {
      console.error("Create todo error:", error)

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error while creating todo" })
    }
  },

  async updateTodo(req, res) {
    let db
    try {
      db = getDatabase()
      const userId = req.user.userId
      const todoId = req.params.id
      const { title, description, completed } = req.body

      console.log(`Updating todo ID: ${todoId} for user ID: ${userId}`)

      // Validate todo ID
      if (!todoId || isNaN(todoId)) {
        console.log("Update failed: Invalid todo ID")
        return res.status(400).json({ error: "Invalid todo ID" })
      }

      // Check if todo exists and belongs to user
      const [existingTodos] = await db.execute("SELECT id FROM todos WHERE id = ? AND user_id = ?", [todoId, userId])

      if (existingTodos.length === 0) {
        console.log(`Update failed: Todo ID ${todoId} not found for user ID ${userId}`)
        return res.status(404).json({ error: "Todo not found" })
      }

      // Build update query dynamically
      const updates = []
      const values = []

      if (title !== undefined) {
        if (title.trim().length === 0) {
          return res.status(400).json({ error: "Title cannot be empty" })
        }
        if (title.length > 255) {
          return res.status(400).json({ error: "Title cannot exceed 255 characters" })
        }
        updates.push("title = ?")
        values.push(title.trim())
      }

      if (description !== undefined) {
        if (description.length > 255) {
          return res.status(400).json({ error: "Description cannot exceed 255 characters" })
        }
        updates.push("description = ?")
        values.push(description.trim())
      }

      if (completed !== undefined) {
        updates.push("completed = ?")
        values.push(Boolean(completed))
      }

      if (updates.length === 0) {
        console.log("Update failed: No fields to update")
        return res.status(400).json({ error: "No fields to update" })
      }

      values.push(todoId, userId)

      await db.execute(`UPDATE todos SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`, values)

      // Fetch updated todo
      const [updatedTodo] = await db.execute(
        "SELECT id, title, description, completed, created_at FROM todos WHERE id = ?",
        [todoId],
      )

      console.log(`Todo updated successfully: ID ${todoId}`)
      res.json(updatedTodo[0])
    } catch (error) {
      console.error("Update todo error:", error)

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error while updating todo" })
    }
  },

  async deleteTodo(req, res) {
    let db
    try {
      db = getDatabase()
      const userId = req.user.userId
      const todoId = req.params.id

      console.log(`Deleting todo ID: ${todoId} for user ID: ${userId}`)

      // Validate todo ID
      if (!todoId || isNaN(todoId)) {
        console.log("Delete failed: Invalid todo ID")
        return res.status(400).json({ error: "Invalid todo ID" })
      }

      const [result] = await db.execute("DELETE FROM todos WHERE id = ? AND user_id = ?", [todoId, userId])

      if (result.affectedRows === 0) {
        console.log(`Delete failed: Todo ID ${todoId} not found for user ID ${userId}`)
        return res.status(404).json({ error: "Todo not found" })
      }

      console.log(`Todo deleted successfully: ID ${todoId}`)
      res.json({ message: "Todo deleted successfully" })
    } catch (error) {
      console.error("Delete todo error:", error)

      if (error.message.includes("Database not initialized")) {
        return res.status(500).json({ error: "Database connection not available" })
      }

      res.status(500).json({ error: "Internal server error while deleting todo" })
    }
  },
}

module.exports = todoController
