"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FiFilter } from "react-icons/fi";

export default function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/tasks");
        const sortedTasks = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTasks(sortedTasks);
        setFilteredTasks(sortedTasks);
      } catch (err) {
        console.log(err);
      }
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    let tempTasks = [...tasks];
    if (statusFilter) {
      tempTasks = tempTasks.filter(task => task.status === statusFilter);
    }
    if (priorityFilter) {
      tempTasks = tempTasks.filter(task => task.priority === priorityFilter);
    }
    setFilteredTasks(tempTasks);
  }, [statusFilter, priorityFilter, tasks]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-wrap justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold">All Tasks</h2>
        <Link href="/tasks/create">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
            Create Task
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap sm:flex-row gap-2 items-center">
          <div className="flex items-center gap-1">
            <FiFilter className="text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <FiFilter className="text-gray-600" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border rounded px-3 py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Title","Description","Priority","Status","Assigned User","Due Date"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.priority}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.assignedUser || "Unassigned"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm sm:text-base">{task.dueDate}</td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500 text-sm sm:text-base">No tasks found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
