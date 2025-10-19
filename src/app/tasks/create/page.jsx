"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";

export default function Create() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(null);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "Low",
      status: "To Do",
      assignedUser: "",
      dueDate: "",
    }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  const onSubmit = async (data) => {
    if (!session) {
      toast.error("Please login first");
      return;
    }
    try {
      await axios.post("http://localhost:5000/tasks", data, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      toast.success("Task created successfully!");
      router.push("/tasks");
    } catch (err) {
      console.log(err.response?.data || err.message);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4 text-center">Create New Task</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Title"
          {...register("title", { required: true })}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <textarea
          placeholder="Description"
          {...register("description")}
          rows={4}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
        <select
          {...register("priority")}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select
          {...register("status")}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <select
          {...register("assignedUser", { required: true })}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">-- Assign to user --</option>
          <option value="Alice">Alice</option>
          <option value="Bob">Bob</option>
          <option value="Charlie">Charlie</option>
          <option value="David">David</option>
          <option value="Eve">Eve</option>
        </select>
        <input
          type="date"
          {...register("dueDate", { required: true })}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all cursor-pointer"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}
