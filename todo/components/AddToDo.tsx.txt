"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AddToDo({ onAdd }: { onAdd?: () => void }) {
  const supabase = createClient();
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Please login to add todos");
      return;
    }

    if (task.length < 4) {
      setError("Task must be at least 4 characters long");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from("todos")
        .insert([{ task, user_id: user.id }]);

      if (error) throw error;

      setTask("");
      if (onAdd) onAdd();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add todo");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-gray-600">Please login to add todos</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding..." : "Add Todo"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
    </form>
  );
}
