"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleLoginButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) alert(error.message);
    setLoading(false);
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
