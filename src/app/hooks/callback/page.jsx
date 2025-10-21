"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientInstance } from "@/app/utils/supabase/client";

export default function AuthCallback() {
  const supabase = createClientInstance();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (!error && session) {
        localStorage.setItem("supabase_token", session.access_token);
        router.push("/");
      }
    };
    handleCallback();
  }, []);

  return <div>Loading...</div>;
}
