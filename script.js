class TodoApp {
  constructor() {
    this.todos = []
    this.todoIdCounter = 1

    this.todoForm = document.getElementById("todoForm")
    this.todoInput = document.getElementById("todoInput")
    this.todoList = document.getElementById("todoList")
    this.todoCount = document.getElementById("todoCount")
    this.emptyState = document.getElementById("emptyState")

    this.bindEvents()

    this.loadTodos()

    this.render()
  }

  bindEvents() {
    this.todoForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTodo()
    })
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
      localStorage.setItem("todos", JSON.stringify(this.todos))
      localStorage.setItem("todoIdCounter", this.todoIdCounter.toString())
    } catch (error) {
      console.warn("Could not save todos to localStorage:", error)
    }
  }

  loadTodos() {
    try {
      const savedTodos = localStorage.getItem("todos")
      const savedCounter = localStorage.getItem("todoIdCounter")

      if (savedTodos) {
        this.todos = JSON.parse(savedTodos)
      }

      if (savedCounter) {
        this.todoIdCounter = Number.parseInt(savedCounter, 10)
      }
    } catch (error) {
      console.warn("Could not load todos from localStorage:", error)
      this.todos = []
      this.todoIdCounter = 1
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp()
})

document.addEventListener("keydown", (e) => {
  if ((e.key === "n" || e.key === "/") && !e.target.matches("input, textarea")) {
    e.preventDefault()
    document.getElementById("todoInput").focus()
  }
})
