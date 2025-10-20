"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { createClientInstance } from "../utils/supabase/client";
import { FiFilter } from "react-icons/fi";

export default function TaskListPage() {
  const router = useRouter();
  const supabase = createClientInstance();
  const [session, setSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession || null); // null যদি লগইন না করে থাকে
        const config = { headers: currentSession ? { Authorization: `Bearer ${currentSession.access_token}` } : {} };
        const [tasksRes, usersRes] = await Promise.all([
          axios.get("https://task-mate-server-kappa.vercel.app/tasks", config),
          axios.get("https://task-mate-server-kappa.vercel.app/users", config)
        ]);
        setTasks(tasksRes.data);
        setFilteredTasks(tasksRes.data);
        setUsers(usersRes.data);
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let temp = [...tasks];
    if (statusFilter) temp = temp.filter(t => t.status === statusFilter);
    if (priorityFilter) temp = temp.filter(t => t.priority === priorityFilter);
    setFilteredTasks(temp);
  }, [statusFilter, priorityFilter, tasks]);

  const handleCreateClick = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    router.push("/tasks/create");
  };

  const getUsername = (id) => {
    const user = users.find(u => String(u._id) === String(id));
    return user ? user.username : "Unassigned";
  };

  return (
    <div className="lg:w-10/12 lg:mx-auto p-6">
      <div className="flex flex-wrap justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">All Tasks</h2>
        {session && (
          <button 
            onClick={handleCreateClick} 
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        )}
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap sm:flex-row gap-2 items-center">
          <div className="flex items-center gap-1">
            <FiFilter className="text-gray-600" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded px-3 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <FiFilter className="text-gray-600" />
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="border rounded px-3 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading tasks...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Title","Description","Priority","Status","Assigned User","Due Date"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{t.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{t.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{t.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{t.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{getUsername(t.assignedUser)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{t.dueDate?.split("T")[0] || ""}</td>
                </tr>
              ))}
              {filteredTasks.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-gray-500">No tasks found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
