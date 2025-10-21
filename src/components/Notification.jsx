"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientInstance } from "@/app/utils/supabase/client";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const supabase = createClientInstance();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          const title =
            payload.new?.task_title ||
            payload.old?.task_title ||
            "Untitled Task";

          let message = "";

          if (payload.eventType === "INSERT") {
            message = `🟢 ${title} — created`;
          } else if (payload.eventType === "UPDATE") {
            message = `🟡 ${title} — updated`;
          } else if (payload.eventType === "DELETE") {
            message = `🔴 ${title} — deleted`;
          }

          setNotifications((prev) => [{ id: Date.now(), message }, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const toggleNotifications = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        toggleNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
