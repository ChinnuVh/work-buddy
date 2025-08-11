// Greet user
document.addEventListener("DOMContentLoaded", () => {
  const greetingEl = document.getElementById("greeting");
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning ☀️"
      : hour < 18
      ? "Good afternoon 🌤️"
      : "Good evening 🌙";
  greetingEl.textContent = greeting;

  initTodoApp(); // Initialize todo
});

// IndexedDB setup
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("workBuddyDB", 1);

    request.onerror = () => reject("DB failed to open");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("todos")) {
        db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

function addTodoToDB(db, task) {
  const tx = db.transaction("todos", "readwrite");
  const store = tx.objectStore("todos");
  store.add({ task, completed: false });
}

function getTodosFromDB(db) {
  return new Promise((resolve) => {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

function updateTodoStatus(db, id, completed) {
  const tx = db.transaction("todos", "readwrite");
  const store = tx.objectStore("todos");
  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const data = getReq.result;
    data.completed = completed;
    store.put(data);
  };
}

function deleteTodoFromDB(db, id) {
  const tx = db.transaction("todos", "readwrite");
  tx.objectStore("todos").delete(id);
}

async function initTodoApp() {
  const db = await initDB();

  const input = document.getElementById("todo-input");
  const addBtn = document.getElementById("add-todo");
  const list = document.getElementById("todo-list");

  const renderTodos = async () => {
    list.innerHTML = "";
    const todos = await getTodosFromDB(db);
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.textContent = todo.task;
      if (todo.completed) li.style.textDecoration = "line-through";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.onchange = () => {
        updateTodoStatus(db, todo.id, checkbox.checked);
        renderTodos();
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => {
        deleteTodoFromDB(db, todo.id);
        renderTodos();
      };

      li.prepend(checkbox);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  };

  addBtn.onclick = () => {
    const task = input.value.trim();
    if (task) {
      addTodoToDB(db, task);
      input.value = "";
      renderTodos();
    }
  };

  renderTodos();
}
