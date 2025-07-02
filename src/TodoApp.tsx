import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

export type FilterType = "all" | "active" | "completed";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onStartEdit: (id: number, text: string) => void;
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
    if (!isEditing) onStartEdit(todo.id, todo.text);
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed-todo" : ""}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
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
            className={`todo-text ${todo.completed ? "completed-text" : ""}`}
            onDoubleClick={handleDoubleClick}
          >
            {todo.text}
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
              onClick={() => onStartEdit(todo.id, todo.text)}
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [isLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("Error al cargar todos:", error);
        setError("Error al cargar las tareas guardadas");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos([...todos, newTodo]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="container">
      <div className="todo-app">
        <header className="header">
          <h1 className="title">📝 Mi Lista de Tareas</h1>
          <p className="subtitle">
            Organiza tu día de manera eficiente Gracias al grupo # 3
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
              onKeyDown={handleKeyPress}
              placeholder="¿Qué necesitas hacer hoy?"
              className="input"
              disabled={isLoading}
            />
            <button
              onClick={addTodo}
              className={`add-button ${isLoading ? "disabled-button" : ""}`}
              disabled={isLoading}
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
            count={todos.filter((t) => !t.completed).length}
            label="Pendientes"
            onClick={setFilter}
          />
          <FilterButton
            filter="completed"
            currentFilter={filter}
            count={todos.filter((t) => t.completed).length}
            label="Completadas"
            onClick={setFilter}
          />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="todo-list">
            {todos.filter((todo) => {
              if (filter === "active") return !todo.completed;
              if (filter === "completed") return todo.completed;
              return true;
            }).length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              todos
                .filter((todo) => {
                  if (filter === "active") return !todo.completed;
                  if (filter === "completed") return todo.completed;
                  return true;
                })
                .map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={(id) => {
                      // tu función updateToggle aquí
                      const updatedTodos = todos.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed } : t
                      );
                      setTodos(updatedTodos);
                    }}
                    onDelete={(id) => {
                      setTodos(todos.filter((t) => t.id !== id));
                    }}
                    onStartEdit={(id, text) => {
                      setEditingId(id);
                      setEditingText(text);
                    }}
                    isEditing={editingId === todo.id}
                    editingText={editingText}
                    onEditTextChange={setEditingText}
                    onSaveEdit={() => {
                      if (editingText.trim() && editingId !== null) {
                        const updatedTodos = todos.map((t) =>
                          t.id === editingId
                            ? { ...t, text: editingText.trim() }
                            : t
                        );
                        setTodos(updatedTodos);
                      }
                      setEditingId(null);
                      setEditingText("");
                    }}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setEditingText("");
                    }}
                  />
                ))
            )}
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
