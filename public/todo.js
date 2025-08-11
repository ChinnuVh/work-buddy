// todo.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");

  // Load todos
  chrome.storage.local.get(["todos"], (result) => {
    const todos = result.todos || [];
    todos.forEach((todo) => addTodoToUI(todo));
  });

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
    };

    chrome.storage.local.get(["todos"], (result) => {
      const todos = result.todos || [];
      todos.push(newTodo);
      chrome.storage.local.set({ todos }, () => {
        addTodoToUI(newTodo);
        input.value = "";
      });
    });
  });

  // Add to UI
  function addTodoToUI(todo) {
    const li = document.createElement("li");
    li.innerText = todo.text;
    li.className = todo.completed ? "completed" : "";
    li.dataset.id = todo.id;

    // Toggle completed
    li.addEventListener("click", () => {
      todo.completed = !todo.completed;
      li.classList.toggle("completed");
      updateTodoStatus(todo.id, todo.completed);
    });

    // Delete on right click
    li.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (confirm("Delete this task?")) {
        removeTodo(todo.id, li);
      }
    });

    list.appendChild(li);
  }

  function updateTodoStatus(id, completed) {
    chrome.storage.local.get(["todos"], (result) => {
      const todos = result.todos.map((t) => {
        if (t.id === id) t.completed = completed;
        return t;
      });
      chrome.storage.local.set({ todos });
    });
  }

  function removeTodo(id, element) {
    chrome.storage.local.get(["todos"], (result) => {
      const todos = result.todos.filter((t) => t.id !== id);
      chrome.storage.local.set({ todos }, () => {
        element.remove();
      });
    });
  }
});
