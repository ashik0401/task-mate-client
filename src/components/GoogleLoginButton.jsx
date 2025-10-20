"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { createClientInstance } from "@/app/utils/supabase/client";


export default function GoogleLoginButton({ onError }) {
  const supabase = createClientInstance();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error && onError) onError(error.message);
      else if (error) alert(error.message);
    } catch (err) {
      if (onError) onError(err.message);
      else alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md bg-white py-3 text-black font-medium hover:bg-gray-100 transition cursor-pointer"
    >
      <FcGoogle className="text-xl" />
      {loading ? "Redirecting..." : "Sign in with Google"}
    </button>
  );
}
