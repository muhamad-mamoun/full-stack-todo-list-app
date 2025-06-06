// Global state
let currentUser = null
let authToken = null
let todos = []

// DOM elements
const authSection = document.getElementById("auth-section")
const todoSection = document.getElementById("todo-section")
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const showRegisterLink = document.getElementById("showRegister")
const showLoginLink = document.getElementById("showLogin")
const loginFormElement = document.getElementById("loginForm")
const registerFormElement = document.getElementById("registerForm")
const todoFormElement = document.getElementById("todoForm")
const logoutBtn = document.getElementById("logoutBtn")
const usernameDisplay = document.getElementById("username-display")
const todosList = document.getElementById("todosList")
const loading = document.getElementById("loading")
const messageDiv = document.getElementById("message")

// API base URL
const API_BASE = "/api"

// Utility functions
function showLoading() {
  console.log("Showing loading spinner")
  loading.classList.remove("hidden")
}

function hideLoading() {
  console.log("Hiding loading spinner")
  loading.classList.add("hidden")
}

function showMessage(text, type = "info") {
  console.log(`Showing ${type} message: ${text}`)
  messageDiv.textContent = text
  messageDiv.className = `message ${type}`
  messageDiv.classList.remove("hidden")

  setTimeout(() => {
    messageDiv.classList.add("hidden")
  }, 5000)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString() + " " + date.toLocaleTimeString()
}

// API functions
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }

  console.log(`Making API call: ${config.method || "GET"} ${url}`)

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    console.log(`API response (${response.status}):`, data)

    if (!response.ok) {
      throw new Error(data.error || "API request failed")
    }

    return data
  } catch (error) {
    console.error("API call failed:", error)
    throw error
  }
}

// Auth functions
async function register(username, password) {
  showLoading()
  try {
    const data = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    showMessage("Registration successful! Please login.", "success")
    showLoginForm()
    return data
  } catch (error) {
    showMessage(error.message, "error")
    throw error
  } finally {
    hideLoading()
  }
}

async function login(username, password) {
  showLoading()
  try {
    const data = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    authToken = data.token
    currentUser = data.user

    // Store token in localStorage
    localStorage.setItem("authToken", authToken)
    localStorage.setItem("currentUser", JSON.stringify(currentUser))

    console.log("Login successful, user:", currentUser)
    showTodoSection()
    await loadTodos()

    return data
  } catch (error) {
    showMessage(error.message, "error")
    throw error
  } finally {
    hideLoading()
  }
}

async function logout() {
  showLoading()
  try {
    await apiCall("/auth/logout", {
      method: "POST",
    })

    console.log("Logout successful")
  } catch (error) {
    console.error("Logout API call failed:", error)
    // Continue with logout even if API call fails
  } finally {
    // Clear local storage and state
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    authToken = null
    currentUser = null
    todos = []

    showAuthSection()
    hideLoading()
    showMessage("Logged out successfully", "info")
  }
}

// Todo functions
async function loadTodos() {
  showLoading()
  try {
    const data = await apiCall("/todos")
    todos = data
    console.log(`Loaded ${todos.length} todos`)
    renderTodos()
  } catch (error) {
    showMessage("Failed to load todos: " + error.message, "error")
  } finally {
    hideLoading()
  }
}

async function createTodo(title, description) {
  showLoading()
  try {
    const data = await apiCall("/todos", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    })

    todos.unshift(data)
    console.log("Todo created:", data)
    renderTodos()
    showMessage("Todo created successfully", "success")

    // Clear form
    document.getElementById("todoTitle").value = ""
    document.getElementById("todoDescription").value = ""

    return data
  } catch (error) {
    showMessage("Failed to create todo: " + error.message, "error")
    throw error
  } finally {
    hideLoading()
  }
}

async function updateTodo(id, updates) {
  showLoading()
  try {
    const data = await apiCall(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })

    const index = todos.findIndex((todo) => todo.id === id)
    if (index !== -1) {
      todos[index] = data
    }

    console.log("Todo updated:", data)
    renderTodos()
    showMessage("Todo updated successfully", "success")

    return data
  } catch (error) {
    showMessage("Failed to update todo: " + error.message, "error")
    throw error
  } finally {
    hideLoading()
  }
}

async function deleteTodo(id) {
  if (!confirm("Are you sure you want to delete this todo?")) {
    return
  }

  showLoading()
  try {
    await apiCall(`/todos/${id}`, {
      method: "DELETE",
    })

    todos = todos.filter((todo) => todo.id !== id)
    console.log("Todo deleted:", id)
    renderTodos()
    showMessage("Todo deleted successfully", "success")
  } catch (error) {
    showMessage("Failed to delete todo: " + error.message, "error")
    throw error
  } finally {
    hideLoading()
  }
}

// UI functions
function showAuthSection() {
  console.log("Showing auth section")
  authSection.classList.remove("hidden")
  todoSection.classList.add("hidden")
}

function showTodoSection() {
  console.log("Showing todo section")
  authSection.classList.add("hidden")
  todoSection.classList.remove("hidden")
  usernameDisplay.textContent = currentUser.username
}

function showLoginForm() {
  console.log("Showing login form")
  loginForm.classList.add("active")
  registerForm.classList.remove("active")
}

function showRegisterForm() {
  console.log("Showing register form")
  registerForm.classList.add("active")
  loginForm.classList.remove("active")
}

function renderTodos() {
  console.log(`Rendering ${todos.length} todos`)

  if (todos.length === 0) {
    todosList.innerHTML = '<div class="no-todos">No todos yet. Create your first todo above!</div>'
    return
  }

  todosList.innerHTML = todos
    .map(
      (todo) => `
        <div class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
            <div class="todo-header">
                <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                <div class="todo-actions">
                    <button class="complete-btn ${todo.completed ? "completed" : ""}" onclick="toggleTodo(${todo.id})">
                        ${todo.completed ? "Undo" : "Complete"}
                    </button>
                    <button class="edit-btn" onclick="editTodo(${todo.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
                </div>
            </div>
            ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ""}
            <p class="todo-date">Created: ${formatDate(todo.created_at)}</p>
            <div id="edit-form-${todo.id}" class="edit-form hidden">
                <input type="text" id="edit-title-${todo.id}" value="${escapeHtml(todo.title)}" placeholder="Title">
                <input type="text" id="edit-description-${todo.id}" value="${escapeHtml(todo.description || "")}" placeholder="Description">
                <div class="form-actions">
                    <button class="save-btn" onclick="saveTodoEdit(${todo.id})">Save</button>
                    <button class="cancel-btn" onclick="cancelTodoEdit(${todo.id})">Cancel</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function editTodo(id) {
  console.log("Editing todo:", id)
  const editForm = document.getElementById(`edit-form-${id}`)
  editForm.classList.remove("hidden")
}

function cancelTodoEdit(id) {
  console.log("Cancelling todo edit:", id)
  const editForm = document.getElementById(`edit-form-${id}`)
  editForm.classList.add("hidden")
}

async function saveTodoEdit(id) {
  const title = document.getElementById(`edit-title-${id}`).value.trim()
  const description = document.getElementById(`edit-description-${id}`).value.trim()

  if (!title) {
    showMessage("Title is required", "error")
    return
  }

  console.log("Saving todo edit:", id, { title, description })

  try {
    await updateTodo(id, { title, description })
    const editForm = document.getElementById(`edit-form-${id}`)
    editForm.classList.add("hidden")
  } catch (error) {
    // Error already handled in updateTodo
  }
}

async function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id)
  if (!todo) return

  console.log("Toggling todo completion:", id, !todo.completed)

  try {
    await updateTodo(id, { completed: !todo.completed })
  } catch (error) {
    // Error already handled in updateTodo
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app")

  // Check for stored auth token
  const storedToken = localStorage.getItem("authToken")
  const storedUser = localStorage.getItem("currentUser")

  if (storedToken && storedUser) {
    console.log("Found stored auth token, attempting to restore session")
    authToken = storedToken
    currentUser = JSON.parse(storedUser)
    showTodoSection()
    loadTodos()
  } else {
    console.log("No stored auth token, showing auth section")
    showAuthSection()
  }
})

// Auth form toggles
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault()
  showRegisterForm()
})

showLoginLink.addEventListener("click", (e) => {
  e.preventDefault()
  showLoginForm()
})

// Form submissions
loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault()
  const username = document.getElementById("loginUsername").value.trim()
  const password = document.getElementById("loginPassword").value

  console.log("Login form submitted for username:", username)

  if (!username || !password) {
    showMessage("Please fill in all fields", "error")
    return
  }

  try {
    await login(username, password)
  } catch (error) {
    // Error already handled in login function
  }
})

registerFormElement.addEventListener("submit", async (e) => {
  e.preventDefault()
  const username = document.getElementById("registerUsername").value.trim()
  const password = document.getElementById("registerPassword").value

  console.log("Register form submitted for username:", username)

  if (!username || !password) {
    showMessage("Please fill in all fields", "error")
    return
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters long", "error")
    return
  }

  try {
    await register(username, password)
  } catch (error) {
    // Error already handled in register function
  }
})

todoFormElement.addEventListener("submit", async (e) => {
  e.preventDefault()
  const title = document.getElementById("todoTitle").value.trim()
  const description = document.getElementById("todoDescription").value.trim()

  console.log("Todo form submitted:", { title, description })

  if (!title) {
    showMessage("Please enter a todo title", "error")
    return
  }

  try {
    await createTodo(title, description)
  } catch (error) {
    // Error already handled in createTodo function
  }
})

logoutBtn.addEventListener("click", async () => {
  console.log("Logout button clicked")
  await logout()
})

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
  showMessage("An unexpected error occurred", "error")
})

// Global unhandled promise rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  showMessage("An unexpected error occurred", "error")
})

console.log("Todo app script loaded successfully")
