// API Service for communicating with the backend
const API_URL = `http://${window.env.BACKEND_DNS}:3000/api`

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json()
    console.error("API error response:", errorData) // Log error response for debugging
    throw new Error(errorData.message || "Something went wrong")
  }
  return response.json()
}

// API service object
const api = {
  // Authentication endpoints
  auth: {
    // Register a new user
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
      return handleResponse(response)
    },

    // Login user
    login: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })
      return handleResponse(response)
    },

    // Get current user profile
    getProfile: async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      console.log("Sending token in header:", token) // Log token for debugging
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse(response)
    },
  },

  // Tasks endpoints
  tasks: {
    // Get all tasks for current user
    getAll: async () => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse(response)
    },

    // Create a new task
    create: async (taskData) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })
      return handleResponse(response)
    },

    // Update a task
    update: async (taskId, taskData) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      })
      return handleResponse(response)
    },

    // Delete a task
    delete: async (taskId) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse(response)
    },

    // Toggle task completion status
    toggleComplete: async (taskId) => {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch(`${API_URL}/tasks/${taskId}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return handleResponse(response)
    },
  },
}

// Helper functions for UI
function showLoading() {
  const loadingOverlay = document.getElementById("loading-overlay")
  if (loadingOverlay) loadingOverlay.style.display = "flex"
}

function hideLoading() {
  const loadingOverlay = document.getElementById("loading-overlay")
  if (loadingOverlay) loadingOverlay.style.display = "none"
}

function showNotification(message, type = "default") {
  const notification = document.getElementById("notification")
  if (!notification) return

  notification.textContent = message
  notification.className = `notification ${type}`
  notification.classList.add("show")

  setTimeout(() => {
    notification.classList.remove("show")
  }, 3000)
}
