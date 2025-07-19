class TodoApp {
  constructor() {
    this.todos = []
    this.todoIdCounter = 1

    // Get DOM elements
    this.todoForm = document.getElementById("todoForm")
    this.todoInput = document.getElementById("todoInput")
    this.todoList = document.getElementById("todoList")
    this.todoCount = document.getElementById("todoCount")
    this.emptyState = document.getElementById("emptyState")

    // Bind event listeners
    this.bindEvents()

    // Load todos from localStorage
    this.loadTodos()

    // Initial render
    this.render()
  }

  bindEvents() {
    this.todoForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTodo()
    })

    // Management buttons
    const clearAllBtn = document.getElementById("clearAllBtn")

    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", () => this.clearAllTodos())
    }
  }

  addTodo() {
    const text = this.todoInput.value.trim()

    if (text === "") {
      this.showInputError()
      return
    }

    const todo = {
      id: this.todoIdCounter++,
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    this.todos.push(todo)
    this.todoInput.value = ""
    this.saveTodos()
    this.render()

    // Add success feedback
    this.showSuccessMessage()
  }

  deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`)

    if (todoElement) {
      todoElement.classList.add("removing")

      setTimeout(() => {
        this.todos = this.todos.filter((todo) => todo.id !== id)
        this.saveTodos()
        this.render()
      }, 300)
    }
  }

  toggleTodo(id) {
    const todo = this.todos.find((todo) => todo.id === id)
    if (todo) {
      todo.completed = !todo.completed
      this.saveTodos()
      this.render()
    }
  }

  render() {
    this.renderTodos()
    this.updateStats()
    this.toggleEmptyState()
  }

  renderTodos() {
    this.todoList.innerHTML = ""

    this.todos.forEach((todo) => {
      const todoElement = this.createTodoElement(todo)
      this.todoList.appendChild(todoElement)
    })
  }

  createTodoElement(todo) {
    const li = document.createElement("li")
    li.className = `todo-item ${todo.completed ? "completed" : ""}`
    li.setAttribute("data-id", todo.id)
    li.setAttribute("role", "listitem")

    li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? "checked" : ""}
                aria-label="Mark as ${todo.completed ? "incomplete" : "complete"}"
            >
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            <button class="delete-btn" aria-label="Delete todo item">
                Delete
            </button>
        `

    // Add event listeners
    const checkbox = li.querySelector(".todo-checkbox")
    const deleteBtn = li.querySelector(".delete-btn")

    checkbox.addEventListener("change", () => {
      this.toggleTodo(todo.id)
    })

    deleteBtn.addEventListener("click", () => {
      this.deleteTodo(todo.id)
    })

    return li
  }

  updateStats() {
    const totalTodos = this.todos.length
    const completedTodos = this.todos.filter((todo) => todo.completed).length
    const remainingTodos = totalTodos - completedTodos

    let statsText = ""
    if (totalTodos === 0) {
      statsText = "0 tasks remaining"
    } else if (remainingTodos === 0) {
      statsText = `All ${totalTodos} tasks completed! 🎉`
    } else {
      statsText = `${remainingTodos} of ${totalTodos} tasks remaining`
    }

    // Add storage indicator
    const storageUsed = this.getStorageUsage()
    if (storageUsed > 0) {
      statsText += ` • ${storageUsed}KB stored`
    }

    this.todoCount.textContent = statsText
  }

  toggleEmptyState() {
    if (this.todos.length === 0) {
      this.emptyState.classList.remove("hidden")
      this.todoList.style.display = "none"
    } else {
      this.emptyState.classList.add("hidden")
      this.todoList.style.display = "block"
    }
  }

  showInputError() {
    this.todoInput.style.borderColor = "#dc3545"
    this.todoInput.style.boxShadow = "0 0 0 3px rgba(220, 53, 69, 0.1)"

    setTimeout(() => {
      this.todoInput.style.borderColor = "#e1e5e9"
      this.todoInput.style.boxShadow = "none"
    }, 2000)
  }

  showSuccessMessage() {
    const addBtn = document.querySelector(".add-btn")
    const originalContent = addBtn.innerHTML

    addBtn.innerHTML = "<span>✓</span>"
    addBtn.style.background = "#28a745"

    setTimeout(() => {
      addBtn.innerHTML = originalContent
      addBtn.style.background = ""
    }, 1000)
  }

  saveTodos() {
    try {
      // Validate data before saving
      const dataToSave = {
        todos: this.todos,
        counter: this.todoIdCounter,
        lastSaved: new Date().toISOString(),
      }

      localStorage.setItem("todoApp_todos", JSON.stringify(dataToSave))
      console.log(`Saved ${this.todos.length} todos to localStorage`)
    } catch (error) {
      console.warn("Could not save todos to localStorage:", error)
      this.showStorageError("Failed to save your tasks. Your browser storage might be full.")
    }
  }

  loadTodos() {
    try {
      const savedData = localStorage.getItem("todoApp_todos")

      if (savedData) {
        const parsedData = JSON.parse(savedData)

        // Handle new format
        if (parsedData.todos && Array.isArray(parsedData.todos)) {
          this.todos = parsedData.todos.filter(
            (todo) => todo && typeof todo.id === "number" && typeof todo.text === "string",
          )
          this.todoIdCounter = parsedData.counter || this.getNextId()
          console.log(`Loaded ${this.todos.length} todos from localStorage`)
        }
        // Handle legacy format (backward compatibility)
        else if (Array.isArray(parsedData)) {
          this.todos = parsedData.filter((todo) => todo && typeof todo.id === "number" && typeof todo.text === "string")
          this.todoIdCounter = this.getNextId()
          // Migrate to new format
          this.saveTodos()
        }
      }
    } catch (error) {
      console.warn("Could not load todos from localStorage:", error)
      this.showStorageError("Failed to load your saved tasks.")
      this.todos = []
      this.todoIdCounter = 1
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  getNextId() {
    return this.todos.length > 0 ? Math.max(...this.todos.map((t) => t.id)) + 1 : 1
  }

  showStorageError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "storage-error"
    errorDiv.style.cssText = `
      background: #f8d7da;
      color: #721c24;
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: slideIn 0.3s ease;
    `
    errorDiv.innerHTML = `<span>⚠️</span> ${message}`

    const main = document.querySelector("main")
    const todoForm = document.querySelector(".todo-form")
    main.insertBefore(errorDiv, todoForm.nextSibling)

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove()
      }
    }, 5000)
  }

  clearAllTodos() {
    if (confirm("Are you sure you want to delete all tasks? This action cannot be undone.")) {
      this.todos = []
      this.saveTodos()
      this.render()
      this.showMessage("All tasks have been cleared.", "success")
    }
  }

  showMessage(message, type = "info") {
    const messageDiv = document.createElement("div")
    messageDiv.className = `message message-${type}`
    messageDiv.style.cssText = `
      background: ${type === "success" ? "#d4edda" : type === "error" ? "#f8d7da" : "#d1ecf1"};
      color: ${type === "success" ? "#155724" : type === "error" ? "#721c24" : "#0c5460"};
      padding: 12px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid ${type === "success" ? "#c3e6cb" : type === "error" ? "#f5c6cb" : "#bee5eb"};
      animation: slideIn 0.3s ease;
    `
    messageDiv.textContent = message

    const main = document.querySelector("main")
    const todoForm = document.querySelector(".todo-form")
    main.insertBefore(messageDiv, todoForm.nextSibling)

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 3000)
  }

  getStorageUsage() {
    try {
      const data = localStorage.getItem("todoApp_todos")
      return data ? Math.round(new Blob([data]).size / 1024) : 0
    } catch (error) {
      return 0
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TodoApp()
})

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Focus input when pressing 'n' or '/'
  if ((e.key === "n" || e.key === "/") && !e.target.matches("input, textarea")) {
    e.preventDefault()
    document.getElementById("todoInput").focus()
  }
})
