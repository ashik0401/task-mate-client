"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { createClientInstance } from "../app/utils/supabase/client";

const supabase = createClientInstance();
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setTasks(data);
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel("tasks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.new?.user_id === session.user.id) return;

          let message = "";
          let type = "";

          switch (payload.eventType) {
            case "INSERT":
              setTasks(prev => [payload.new, ...prev]);
              message = `🎯 Created task: "${payload.new?.task_title || "Untitled"}"`;
              type = "CREATE";
              break;
            case "UPDATE":
              setTasks(prev => prev.map(task => task.id === payload.new.id ? payload.new : task));
              message = `✏️ Updated task: "${payload.new?.task_title || "Untitled"}"`;
              type = "UPDATE";
              break;
            case "DELETE":
              setTasks(prev => prev.filter(task => task.id !== payload.old.id));
              message = `🗑️ Deleted task: "${payload.old?.task_title || "Untitled"}"`;
              type = "DELETE";
              break;
          }

          setNotification({ message, type, id: Date.now() });
          setTimeout(() => setNotification(null), 5000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [session?.user]);

  return (
    <NotificationContext.Provider value={{ notification, setNotification, tasks }}>
      {children}
      {notification && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-xl z-50" style={{ animation: "fade-in-right 0.3s ease-out forwards" }}>
          <div className="flex items-center gap-3">
            <div className="text-lg">
              {notification.type === "CREATE" && "🎯"}
              {notification.type === "UPDATE" && "✏️"}
              {notification.type === "DELETE" && "🗑️"}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{notification.message}</p>
              <p className="text-xs opacity-90 mt-1">Just now</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-white hover:bg-white/20 rounded-full w-6 h-6 flex items-center justify-center transition-colors">✕</button>
          </div>
          <div className="w-full bg-white/30 h-1 mt-2 rounded-full">
            <div className="bg-white h-1 rounded-full" style={{ animation: "progress 5s linear forwards" }}></div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
