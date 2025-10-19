"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast, Toaster } from "react-hot-toast";
import { FiFilter } from "react-icons/fi";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) { 
          toast.error("You must be logged in"); 
          setLoading(false);
          return; 
        }

        const [tasksRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/tasks", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/users", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setTasks(tasksRes.data);
        setFilteredTasks(tasksRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.log(err);
        toast.error("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    let temp = [...tasks];
    if (priorityFilter) temp = temp.filter(task => task.priority === priorityFilter);
    setFilteredTasks(temp);
  }, [priorityFilter, tasks]);

  const handleDelete = async (taskId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("You must be logged in"); return; }

      await axios.delete(`http://localhost:5000/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.error || "Failed to delete task");
    }
  };

  const getUsername = (id) => users.find(u => String(u._id) === String(id))?.username || "Unassigned";

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <Toaster position="top-right" />
      <div className="flex flex-wrap sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left">My Tasks</h2>
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" />
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded px-3 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 text-sm sm:text-base">Loading tasks...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {["Title","Description","Priority","Status","Assigned User","Due Date","Actions"].map(h => (
                  <th key={h} className="px-3 sm:px-6 py-2 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <tr key={task._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{task.title}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{task.description}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{task.priority}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{task.status}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{getUsername(task.assignedUser)}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap text-sm sm:text-base">{task.dueDate?.split("T")[0] || ""}</td>
                  <td className="px-3 sm:px-6 py-2 whitespace-nowrap flex gap-2">
                    <button onClick={() => router.push(`/tasks/update/${task._id}`)} className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded hover:bg-yellow-500 cursor-pointer">Update</button>
                    <button onClick={() => handleDelete(task._id)} className="bg-red-500 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded hover:bg-red-600 cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-500 text-sm sm:text-base">No tasks found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
