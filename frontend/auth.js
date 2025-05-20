// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded - initializing auth.js")

  // Check if user is already logged in
  const token = localStorage.getItem("token")
  if (token) {
    console.log("User already logged in, redirecting to dashboard")
    window.location.href = "dashboard.html"
    return
  }

  // Get DOM elements
  const loginForm = document.getElementById("login-form")
  const registerForm = document.getElementById("register-form")
  const loginError = document.getElementById("login-error")
  const registerError = document.getElementById("register-error")
  const tabBtns = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const loadingOverlay = document.getElementById("loading-overlay")

  console.log("Forms found:", {
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    loginError: !!loginError,
    registerError: !!registerError,
  })

  // Tab switching functionality
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log("Tab clicked:", this.getAttribute("data-tab"))

      // Remove active class from all buttons and contents
      tabBtns.forEach((b) => b.classList.remove("active"))
      tabContents.forEach((c) => c.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      this.classList.add("active")
      const tabId = this.getAttribute("data-tab")
      document.getElementById(tabId).classList.add("active")
    })
  })

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Login form submitted")

      if (loginError) loginError.textContent = ""

      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value

      try {
        showLoading()
        const response = await loginUser({ email, password })

        // Store token and user info
        console.log("Storing token:", response.token) // Log token for debugging
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))

        showNotification("Login successful! Redirecting...", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Login error:", error)
        if (loginError) loginError.textContent = error.message || "Failed to login. Please check your credentials."
        showNotification("Login failed", "error")
      } finally {
        hideLoading()
      }
    })
  } else {
    console.error("Login form not found in the DOM")
  }

  // Register form submission
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Register form submitted")

      if (registerError) registerError.textContent = ""

      const name = document.getElementById("register-name").value
      const email = document.getElementById("register-email").value
      const password = document.getElementById("register-password").value
      const confirmPassword = document.getElementById("register-confirm-password").value

      console.log("Register data:", { name, email, password: "***", confirmPassword: "***" })

      // Validate passwords match
      if (password !== confirmPassword) {
        if (registerError) registerError.textContent = "Passwords do not match"
        showNotification("Passwords do not match", "error")
        return
      }

      try {
        showLoading()
        const response = await registerUser({ name, email, password })

        // Store token and user info
        localStorage.setItem("token", response.token)
        localStorage.setItem("user", JSON.stringify(response.user))

        showNotification("Registration successful! Redirecting...", "success")

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "dashboard.html"
        }, 1000)
      } catch (error) {
        console.error("Registration error:", error)
        if (registerError) registerError.textContent = error.message || "Failed to register. Please try again."
        showNotification("Registration failed", "error")
      } finally {
        hideLoading()
      }
    })
  } else {
    console.error("Register form not found in the DOM")
  }

  // Add direct event listener to register button as a backup
  const registerBtn = document.getElementById("register-btn")
  if (registerBtn) {
    registerBtn.addEventListener("click", (e) => {
      console.log("Register button clicked directly")
      // The form's submit event should handle this, this is just a backup
      if (registerForm && !registerForm.reportValidity()) {
        e.preventDefault()
      }
    })
  }

  // Helper functions
  function showLoading() {
    console.log("Showing loading overlay")
    if (loadingOverlay) loadingOverlay.style.display = "flex"
  }

  function hideLoading() {
    console.log("Hiding loading overlay")
    if (loadingOverlay) loadingOverlay.style.display = "none"
  }

  function showNotification(message, type = "default") {
    console.log(`Notification: ${message} (${type})`)
    const notification = document.getElementById("notification")
    if (!notification) return

    notification.textContent = message
    notification.className = `notification ${type}`
    notification.classList.add("show")

    setTimeout(() => {
      notification.classList.remove("show")
    }, 3000)
  }

  // Mock API functions
  async function loginUser(credentials) {
    console.log("Attempting login with:", credentials.email)

    // Use the backend API for login
    return api.auth.login(credentials)
  }

  async function registerUser(userData) {
    console.log("Attempting registration for:", userData.email)

    // Use the backend API for registration
    return api.auth.register(userData)
  }
})
