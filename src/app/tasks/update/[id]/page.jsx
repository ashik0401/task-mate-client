"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "react-hot-toast";
import { createClientInstance } from "@/app/utils/supabase/client";

export default function UpdateTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientInstance();
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const currentSession = data.session;
        setSession(currentSession);

        if (!currentSession) {
          toast.error("Please login first");
          setLoading(false);
          return;
        }

        const token = currentSession.access_token;

        const [usersRes, taskRes] = await Promise.all([
          axios.get("https://task-mate-server-kappa.vercel.app/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`https://task-mate-server-kappa.vercel.app/tasks/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersRes.data);
        const task = taskRes.data;
        reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          assignedUser: task.assignedUser,
          dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  const onSubmit = async (data) => {
    if (!session) {
      toast.error("Please login first");
      return;
    }
    try {
      await axios.patch(`https://task-mate-server-kappa.vercel.app/tasks/${id}`, data, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      toast.success("Task updated successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.log(err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to update task");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading task data...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4 text-center">Update Task</h2>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Title" {...register("title", { required: true })} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <textarea placeholder="Description" {...register("description")} rows={4} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
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
        <select {...register("assignedUser", { required: true })} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">-- Assign to user --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>{user.username}</option>
          ))}
        </select>
        <input type="date" {...register("dueDate", { required: true })} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-all cursor-pointer">Update Task</button>
      </form>
    </div>
  );
}
