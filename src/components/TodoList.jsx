import React, { useState, useEffect } from "react";
import { getAll, addItem, updateItem, deleteItem, TODO_STORE } from "../utils/indexedDB";

const priorityColors = {
  low: "green",
  medium: "gold",
  high: "red",
};

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    getAll(TODO_STORE).then(setTodos);
  }, []);

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const todo = { text: newTodo, completed: false, priority: "low" };
    await addItem(TODO_STORE, todo);
    setTodos(await getAll(TODO_STORE));
    setNewTodo("");
  };

  const toggleTodo = async (todo) => {
    todo.completed = !todo.completed;
    await updateItem(TODO_STORE, todo);
    setTodos(await getAll(TODO_STORE));
  };

  const changePriority = async (todo) => {
    const nextPriority =
      todo.priority === "low"
        ? "medium"
        : todo.priority === "medium"
        ? "high"
        : "low";
    todo.priority = nextPriority;
    await updateItem(TODO_STORE, todo);
    setTodos(await getAll(TODO_STORE));
  };

  const removeTodo = async (id) => {
    await deleteItem(TODO_STORE, id);
    setTodos(await getAll(TODO_STORE));
  };

  return (
    <div className="section">
      <h2>✅ To-Do List</h2>
      <div className="input-group">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new task..."
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span
              className="priority-dot"
              style={{
                backgroundColor: priorityColors[todo.priority],
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                marginRight: "6px",
                cursor: "pointer",
              }}
              onClick={() => changePriority(todo)}
              title={`Priority: ${todo.priority}`}
            ></span>
            <span className="todo-text">{todo.text}</span>
            <button className="delete-btn" onClick={() => removeTodo(todo.id)}>
              ✖
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
