document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const token = localStorage.getItem("token")
  if (!token) {
    window.location.href = "index.html"
    return
  }

  // Set user name in header
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  document.getElementById("user-name").textContent = user.name || "User"

  // Logout functionality
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "index.html"
  })

  // Task form submission
  const taskForm = document.getElementById("task-form")
  const taskError = document.getElementById("task-error")

  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    taskError.textContent = ""

    const name = document.getElementById("task-name").value
    const description = document.getElementById("task-description").value
    const priority = document.getElementById("task-priority").value

    try {
      showLoading()
      await api.tasks.create({ name, description, priority })

      // Reset form
      taskForm.reset()

      // Show success notification
      showNotification("Task created successfully!", "success")

      // Reload tasks
      loadTasks()
    } catch (error) {
      taskError.textContent = error.message || "Failed to create task. Please try again."
      showNotification("Failed to create task", "error")
    } finally {
      hideLoading()
    }
  })

  // Filter functionality
  const filterPriority = document.getElementById("filter-priority")
  const filterStatus = document.getElementById("filter-status")

  filterPriority.addEventListener("change", applyFilters)
  filterStatus.addEventListener("change", applyFilters)

  // Load tasks on page load
  loadTasks()

  // Function to load tasks
  async function loadTasks() {
    const tasksContainer = document.getElementById("tasks-container")

    try {
      showLoading()
      const tasks = await api.tasks.getAll()

      // Update tasks count
      document.getElementById("tasks-count").textContent = tasks.length

      // Display tasks
      if (tasks.length === 0) {
        tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No tasks yet. Add your first task!</p>
                    </div>
                `
      } else {
        // Apply filters to tasks
        applyFilters(tasks)
      }
    } catch (error) {
      tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>Error loading tasks. Please try again.</p>
                </div>
            `
      showNotification("Failed to load tasks", "error")
    } finally {
      hideLoading()
    }
  }

  // Function to apply filters
  async function applyFilters(tasksData = null) {
    const priorityFilter = filterPriority.value
    const statusFilter = filterStatus.value
    const tasksContainer = document.getElementById("tasks-container")

    try {
      let tasks
      if (!tasksData) {
        showLoading()
        tasks = await api.tasks.getAll()
      } else {
        tasks = tasksData
      }

      // Apply filters
      const filteredTasks = tasks.filter((task) => {
        const priorityMatch = priorityFilter === "all" || task.priority === priorityFilter
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "completed" && task.completed) ||
          (statusFilter === "pending" && !task.completed)
        return priorityMatch && statusMatch
      })

      // Update tasks count
      document.getElementById("tasks-count").textContent = filteredTasks.length

      // Display filtered tasks
      if (filteredTasks.length === 0) {
        tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No tasks match your filters.</p>
                    </div>
                `
      } else {
        renderTasks(filteredTasks)
      }
    } catch (error) {
      if (!tasksData) {
        tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <p>Error loading tasks. Please try again.</p>
                    </div>
                `
        showNotification("Failed to load tasks", "error")
      }
    } finally {
      if (!tasksData) {
        hideLoading()
      }
    }
  }

  // Function to render tasks
  function renderTasks(tasks) {
    const tasksContainer = document.getElementById("tasks-container")
    tasksContainer.innerHTML = ""

    // Sort tasks by priority (high to low) and then by creation date (newest first)
    tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

    tasks.forEach((task) => {
      const taskElement = document.createElement("div")
      taskElement.className = `task-item ${task.priority} ${task.completed ? "completed" : ""}`

      // Format date
      const createdAt = new Date(task.createdAt)
      const formattedDate = createdAt.toLocaleDateString() + " " + createdAt.toLocaleTimeString()

      taskElement.innerHTML = `
                <div class="task-header">
                    <div class="task-name">${task.name}</div>
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                </div>
                <div class="task-description">${task.description || "No description"}</div>
                <div class="task-meta">
                    <span>Created: ${formattedDate}</span>
                    <div class="task-actions">
                        <button class="delete-btn" data-id="${task.id}">Delete</button>
                        <button class="complete-btn" data-id="${task.id}">
                            ${task.completed ? "Undo" : "Complete"}
                        </button>
                    </div>
                </div>
            `

      tasksContainer.appendChild(taskElement)
    })

    // Add event listeners for task actions
    addTaskActionListeners()
  }

  // Function to add event listeners to task action buttons
  function addTaskActionListeners() {
    // Delete task buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const taskId = this.getAttribute("data-id")

        if (confirm("Are you sure you want to delete this task?")) {
          try {
            showLoading()
            await api.tasks.delete(taskId)

            // Show success notification
            showNotification("Task deleted successfully!", "success")

            // Reload tasks
            loadTasks()
          } catch (error) {
            showNotification("Failed to delete task", "error")
          } finally {
            hideLoading()
          }
        }
      })
    })

    // Complete/Undo task buttons
    document.querySelectorAll(".complete-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const taskId = this.getAttribute("data-id")

        try {
          showLoading()
          await api.tasks.toggleComplete(taskId)

          // Show success notification
          showNotification("Task status updated!", "success")

          // Reload tasks
          loadTasks()
        } catch (error) {
          showNotification("Failed to update task status", "error")
        } finally {
          hideLoading()
        }
      })
    })
  }
})
