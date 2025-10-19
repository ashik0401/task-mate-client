"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [session, setSession] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();

    const { subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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
    if (!session?.user) {
      router.push("/auth/login");
    } else {
      router.push("/dashboard");
    }
  };

  const userImage = session?.user?.user_metadata?.avatar_url || "https://i.ibb.co/bjMzB512/User-Profile-PNG-High-Quality-Image.png";

  return (
    
      <div className="navbar md:px-20 shadow-sm relative ">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={-1} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow">
            <li>
              <Link href="/" className={pathname === "/" ? "underline font-bold" : ""}>Home</Link>
            </li>
            <li>
              <Link href="/tasks" className={pathname === "/tasks" ? "underline font-bold" : ""}>Tasks</Link>
            </li>
          </ul>
        </div>
        <a className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
  TaskMate
</a>

      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/" className={pathname === "/" ? "underline font-bold" : ""}>Home</Link>
          </li>
          <li>
            <Link href="/tasks" className={pathname === "/tasks" ? "underline font-bold" : ""}>Tasks</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-end flex items-center space-x-4" ref={dropdownRef}>
        <button
          onClick={handleDashboardClick}
          className="btn btn-sm md:btn-md rounded bg-gradient-to-r from-green-400 to-blue-500 text-white"
        >
          Dashboard
        </button>

        {session?.user ? (
          <div className="relative">
            <img
              src={userImage}
              alt="User Profile"
              className="w-10 h-10 rounded-full cursor-pointer border border-gray-300"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white  shadow-lg rounded-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-200  text-sm  ">
                  {session.user.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="btn rounded  transition border-none btn-sm md:btn-md bg-blue-500 text-white hover:bg-blue-600">
            Login
          </Link>
        )}
      </div>
    </div>
    
  );
}
