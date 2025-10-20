"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClientInstance } from "../app/utils/supabase/client";

const supabase = createClientInstance();
const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel("global-task-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_events" },
        (payload) => {
          let message = "";
          let type = "";

          switch (payload.new.action) {
            case "CREATE":
              message = `${payload.new.performed_by} created: "${payload.new.task_title}"`;
              type = "CREATE";
              break;
            case "UPDATE":
              message = `${payload.new.performed_by} updated: "${payload.new.task_title}"`;
              type = "UPDATE";
              break;
            case "DELETE":
              message = `${payload.new.performed_by} deleted a task`;
              type = "DELETE";
              break;
          }

          setNotification({ message, type, id: Date.now() });
          window.dispatchEvent(new Event("refreshTasks"));
          setTimeout(() => setNotification(null), 5000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <NotificationContext.Provider value={{}}>
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
