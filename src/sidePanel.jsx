import React from "react";
import { createRoot } from "react-dom/client";
import TodoList from "./components/TodoList";
import StickyNotes from "./components/StickyNotes";
import "./sidePanel.css";

function SidePanelApp() {
  return (
    <div className="container">
      <TodoList />
      <StickyNotes />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<SidePanelApp />);
