const express = require("express")
const todoController = require("../controllers/todo.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router()

// All todo routes require authentication
router.use(authMiddleware)

router.get("/", todoController.getTodos)
router.post("/", todoController.createTodo)
router.put("/:id", todoController.updateTodo)
router.delete("/:id", todoController.deleteTodo)

module.exports = router
