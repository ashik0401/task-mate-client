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
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const channel = supabase
        .channel("notifications-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
          (payload) => {
            const { action, title } = payload.new;
            const message = action === "CREATE" ? `🟢 "${title}" created`
              : action === "UPDATE" ? `🟡 "${title}" updated`
              : action === "DELETE" ? `🔴 "${title}" deleted` : "";
            setNotifications(prev => [{ id: Date.now(), message }, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        ).subscribe();

      return () => supabase.removeChannel(channel);
    };
    fetchUser();
  }, []);

  const toggleNotifications = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isOpen, toggleNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
