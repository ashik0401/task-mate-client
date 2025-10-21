"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientInstance } from "../app/utils/supabase/client";

const supabase = createClientInstance();

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    fetchUser();

    const channel = supabase
      .channel("meal_notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "meals" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
        setNewCount((count) => count + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const toggleNotifications = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) setNewCount(0);
  };

  const handleMealClick = (mealId) => {
    router.push(`/meal/${mealId}`);
    setNotificationOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-2xl font-bold text-gray-800">TaskMate</Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button onClick={toggleNotifications} className="relative">
                  <span className="material-icons text-2xl">notifications</span>
                  {newCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {newCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-2 z-50 max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-gray-500 text-center text-sm py-2">No new meals</p>
                    ) : (
                      notifications.map((meal) => (
                        <div
                          key={meal.id}
                          onClick={() => handleMealClick(meal.id)}
                          className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                        >
                          <p className="text-sm font-medium">{meal.title}</p>
                          <p className="text-xs text-gray-500">New meal added</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="flex items-center space-x-2">
                  <img
                    src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border"
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg p-2 z-50">
                    <p className="px-3 py-2 text-gray-700 text-sm truncate">
                      {user.email}
                    </p>
                    <hr />
                    <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-gray-100">
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="text-gray-700 hover:text-blue-500 font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
