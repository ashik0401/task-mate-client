"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientInstance } from "../app/utils/supabase/client";

const supabase = createClientInstance();

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

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
    if (!session?.user) return;
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_events' },
        (payload) => {
          const title = payload.new?.task_title || payload.old?.task_title || "Task Updated";
          setNotifications(prev => [
            {
              action: payload.eventType,
              title,
              time: new Date().toLocaleTimeString()
            },
            ...prev
          ]);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session?.user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setDropdownOpen(false);
      router.push("/");
    }
  };

  const handleDashboardClick = () => {
    if (!session?.user) router.push("/auth/login");
    else router.push("/dashboard");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (notifications.length) setNotifications([]);
  };

  const userImage = session?.user?.user_metadata?.avatar_url || "https://i.ibb.co/bjMzB512/User-Profile-PNG-High-Quality-Image.png";

  return (
    <div className="shadow-sm">
      <div className="navbar lg:w-10/12 lg:mx-auto relative">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
              <li><Link href="/" className={pathname === "/" ? "underline font-bold" : ""}>Home</Link></li>
              <li><Link href="/tasks" className={pathname === "/tasks" ? "underline font-bold" : ""}>Tasks</Link></li>
              {session?.user && <li className="lg:hidden"><button onClick={handleDashboardClick} className="w-full text-left">Dashboard</button></li>}
            </ul>
          </div>
          <a className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">TaskMate</a>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/" className={pathname === "/" ? "underline font-bold" : ""}>Home</Link></li>
            <li><Link href="/tasks" className={pathname === "/tasks" ? "underline font-bold" : ""}>Tasks</Link></li>
          </ul>
        </div>

        <div className="navbar-end flex items-center space-x-4 pr-3" ref={dropdownRef}>
          <div className="relative">
            <button onClick={toggleNotifications} className="p-2 rounded-full bg-white border shadow hover:bg-gray-100 relative cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-3 border z-20 max-h-80 overflow-y-auto">
                <h2 className="text-sm font-semibold mb-2">Notifications</h2>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No notifications</p>
                ) : (
                  <ul>
                    {notifications.map((n, i) => (
                      <li key={i} className="border-b last:border-none py-1 text-sm">
                        <span className="font-medium">{n.action}</span> - {n.title}
                        <span className="text-xs text-gray-400 ml-2">{n.time}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {session !== undefined && (
            <button className="hidden lg:block btn btn-sm md:btn-md rounded bg-gradient-to-r from-green-400 to-blue-500 text-white" onClick={handleDashboardClick}>
              Dashboard
            </button>
          )}

          {session !== undefined && (session?.user ? (
            <div className="relative">
              <img
                src={userImage}
                alt="User Profile"
                className="w-10 h-10 rounded-full cursor-pointer border border-gray-300"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-200 text-sm">{session.user.email}</div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="btn rounded transition border-none btn-sm md:btn-md bg-blue-500 text-white hover:bg-blue-600">
              Login
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
