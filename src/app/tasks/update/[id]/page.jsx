"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast, Toaster } from "react-hot-toast";

export default function UpdateTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "Low",
      status: "To Do",
      assignedUser: "",
      dueDate: "",
    },
  });

  const assignedUsers = ["Alice", "Bob", "Charlie", "David", "Eve"];

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get("http://localhost:5000/tasks");
        const task = res.data.find(t => t._id === id);
        if (task) {
          reset({
            title: task.title,
            description: task.description,
            priority: task.priority,
            status: task.status,
            assignedUser: task.assignedUser || "",
            dueDate: task.dueDate?.split("T")[0] || "",
          });
        } else {
          toast.error("Task not found");
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Failed to load task");
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, reset]);

 const onSubmit = async (data) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    await axios.patch(`http://localhost:5000/tasks/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Task updated successfully!");
    router.push("/dashboard");
  } catch (err) {
    console.log(err.response?.data || err.message);
    toast.error(err.response?.data?.error || "Failed to update task");
  }
};

  if (loading) return <p className="text-center mt-10">Loading task...</p>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4 text-center">Update Task</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <input {...register("title")} placeholder="Title" className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <textarea {...register("description")} placeholder="Description" rows={4} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        <select {...register("priority")} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <select {...register("status")} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
        <select {...register("assignedUser")} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">-- Assign to user --</option>
          {assignedUsers.map(user => (
            <option key={user} value={user}>{user}</option>
          ))}
        </select>
        <input type="date" {...register("dueDate")} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2 cursor-pointer">Update Task</button>
      </form>
    </div>
  );
}
