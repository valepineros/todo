"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
  inserted_at: string;
}

export default function ToDoList() {
  const supabase = createClient();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos when component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("inserted_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTodos(data || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoComplete = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ is_complete: !currentStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_complete: !currentStatus } : todo,
        ),
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <p>Loading...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex justify-center items-center p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your ToDo List</h2>

      {todos.length === 0 ? (
        <p className="text-gray-500">No todos yet!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between p-3 bg-white rounded shadow"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={todo.is_complete}
                  onChange={() => toggleTodoComplete(todo.id, todo.is_complete)}
                  className="h-5 w-5 rounded border-gray-300"
                />
                <span
                  className={`${todo.is_complete ? "line-through text-gray-500" : ""}`}
                >
                  {todo.task}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(todo.inserted_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
