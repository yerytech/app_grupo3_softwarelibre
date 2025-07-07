import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export interface Todo {
  id: string;
  titulo: string;
  completado: boolean;
}

export type FilterType = "all" | "active" | "completed";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (id: string, text: string) => void;
  isEditing: boolean;
  editingText: string;
  onEditTextChange: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

interface FilterButtonProps {
  filter: FilterType;
  currentFilter: FilterType;
  count: number;
  label: string;
  onClick: (filter: FilterType) => void;
}

interface EmptyStateProps {
  filter: FilterType;
}

interface LoadingSpinnerProps {
  message?: string;
}

const API_BASE = "https://monkey-gcc-marc-others.trycloudflare.com";

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onStartEdit,
  isEditing,
  editingText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSaveEdit();
    if (e.key === "Escape") onCancelEdit();
  };

  const handleDoubleClick = () => {
    if (!isEditing) onStartEdit(todo.id, todo.titulo);
  };

  return (
    <div className={`todo-item ${todo.completado ? "completed-todo" : ""}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completado}
          onChange={() => onToggle(todo.id)}
          className="checkbox"
        />
        {isEditing ? (
          <input
            type="text"
            value={editingText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={onSaveEdit}
            className="edit-input"
            autoFocus
          />
        ) : (
          <span
            className={`todo-text ${todo.completado ? "completed-text" : ""}`}
            onDoubleClick={handleDoubleClick}
          >
            {todo.titulo}
          </span>
        )}
      </div>
      <div className="todo-actions">
        {isEditing ? (
          <>
            <button
              onClick={onSaveEdit}
              className="save-button"
              title="Guardar"
            >
              ✅
            </button>
            <button
              onClick={onCancelEdit}
              className="cancel-button"
              title="Cancelar"
            >
              ❌
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(todo.id, todo.titulo)}
              className="edit-button"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="delete-button"
              title="Eliminar"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const FilterButton: React.FC<FilterButtonProps> = ({
  filter,
  currentFilter,
  count,
  label,
  onClick,
}) => {
  const isActive = filter === currentFilter;
  return (
    <button
      onClick={() => onClick(filter)}
      className={`filter-button ${isActive ? "active-filter" : ""}`}
    >
      {label} ({count})
    </button>
  );
};

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getMessage = (filter: FilterType) => {
    switch (filter) {
      case "active":
        return "No tienes tareas pendientes. ¡Buen trabajo!";
      case "completed":
        return "No tienes tareas completadas aún.";
      default:
        return "No tienes tareas aún. ¡Agrega una!";
    }
  };
  return (
    <div className="empty-state">
      <span className="empty-icon">📋</span>
      <p className="empty-text">{getMessage(filter)}</p>
    </div>
  );
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando tareas...",
}) => (
  <div className="loading">
    <div className="spinner"></div>
    <p>{message}</p>
  </div>
);

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error("Error al obtener tareas");
      const data = await res.json();
      console.log(data);

      setTodos(data);
    } catch (e) {
      setError(String(e));
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTodo = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const newTask = {
        titulo: inputValue.trim(),
        completado: false,
      };
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Error al agregar la tarea");
      const created: Todo = await res.json();
      setTodos((prev) => [...prev, created]);
      setInputValue("");
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    setIsLoading(true);
    setError(null);
    try {
      const updated = { ...todo, completado: !todo.completado };
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al actualizar la tarea");
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar la tarea");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = async () => {
    if (!editingText.trim() || !editingId) {
      setEditingId(null);
      setEditingText("");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const todo = todos.find((t) => t.id === editingId);
      if (!todo) throw new Error("Tarea no encontrada");
      const updated = { ...todo, titulo: editingText.trim() };
      const res = await fetch(`${API_BASE}/tasks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Error al editar la tarea");
      setTodos((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      setEditingId(null);
      setEditingText("");
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completado;
    if (filter === "completed") return todo.completado;
    return true;
  });

  const pendingCount = todos.filter((t) => !t.completado).length;
  const completedCount = todos.filter((t) => t.completado).length;

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addTodo();
  };

  return (
    <div className="container">
      <div className="todo-app">
        <header className="header">
          <h1 className="title">📝 Mi Lista de Tareas</h1>
          <p className="subtitle">
            Organiza tu día de manera eficiente. Grupo #3
          </p>
        </header>

        {error && (
          <div className="error-banner">
            <span className="error-text">⚠️ {error}</span>
            <button
              onClick={() => setError(null)}
              className="error-close-button"
            >
              ✕
            </button>
          </div>
        )}

        <div className="input-section">
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setInputValue(e.target.value)
              }
              onKeyDown={handleInputKeyDown}
              placeholder="¿Qué necesitas hacer hoy?"
              className="input"
              disabled={isLoading}
            />
            <button
              onClick={addTodo}
              disabled={isLoading}
              className={`add-button ${isLoading ? "disabled-button" : ""}`}
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        <div className="filter-section">
          <FilterButton
            filter="all"
            currentFilter={filter}
            count={todos.length}
            label="Todas"
            onClick={setFilter}
          />
          <FilterButton
            filter="active"
            currentFilter={filter}
            count={pendingCount}
            label="Pendientes"
            onClick={setFilter}
          />
          <FilterButton
            filter="completed"
            currentFilter={filter}
            count={completedCount}
            label="Completadas"
            onClick={setFilter}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : filteredTodos.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onStartEdit={startEdit}
                isEditing={editingId === todo.id}
                editingText={editingText}
                onEditTextChange={setEditingText}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
              />
            ))}
          </div>
        )}

        <footer className="footer">
          <p className="footer-text">
            💡 Tip: Haz doble clic en una tarea para editarla
          </p>
        </footer>
      </div>
    </div>
  );
};

export default TodoApp;
