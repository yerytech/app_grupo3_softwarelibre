import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./todoApp.css"; // Importing the CSS file
import TodoApp from "./TodoApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TodoApp />
  </StrictMode>
);
