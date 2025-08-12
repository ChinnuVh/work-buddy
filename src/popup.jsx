import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

// IndexedDB setup
const initDB = () =>
  new Promise((resolve, reject) => {
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

const addTodoToDB = (db, task) => {
  const tx = db.transaction("todos", "readwrite");
  tx.objectStore("todos").add({ task, completed: false });
};

const getTodosFromDB = (db) =>
  new Promise((resolve) => {
    const tx = db.transaction("todos", "readonly");
    const store = tx.objectStore("todos");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });

const updateTodoStatus = (db, id, completed) => {
  const tx = db.transaction("todos", "readwrite");
  const store = tx.objectStore("todos");
  const getReq = store.get(id);
  getReq.onsuccess = () => {
    const data = getReq.result;
    data.completed = completed;
    store.put(data);
  };
};

const deleteTodoFromDB = (db, id) => {
  const tx = db.transaction("todos", "readwrite");
  tx.objectStore("todos").delete(id);
};

function PopupApp() {
  const [greeting, setGreeting] = useState("");
  const [db, setDb] = useState(null);
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12
        ? "Good morning ☀️"
        : hour < 18
        ? "Good afternoon 🌤️"
        : "Good evening 🌙"
    );
  }, []);

  // Init DB & load todos
  useEffect(() => {
    initDB().then((database) => {
      setDb(database);
      loadTodos(database);
    });
  }, []);

  const loadTodos = async (database) => {
    const allTodos = await getTodosFromDB(database);
    setTodos(allTodos);
  };

  const addTodo = () => {
    if (input.trim()) {
      addTodoToDB(db, input.trim());
      setInput("");
      loadTodos(db);
    }
  };

  const toggleTodo = (id, completed) => {
    updateTodoStatus(db, id, completed);
    loadTodos(db);
  };

  const deleteTodo = (id) => {
    deleteTodoFromDB(db, id);
    loadTodos(db);
  };

  return (
    <div>
      <div id="greeting">{greeting}</div>

      <div id="todo-container">
        <h2>To-Do List</h2>
        <input
          type="text"
          id="todo-input"
          placeholder="Add a task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button id="add-todo" onClick={addTodo}>
          Add
        </button>
        <ul id="todo-list">
          {todos.map((todo) => (
            <li
              key={todo.id}
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => toggleTodo(todo.id, e.target.checked)}
              />
              {todo.task}
              <button onClick={() => deleteTodo(todo.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<PopupApp />);
