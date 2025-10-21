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
      if (error) return;
      if (session) {
        localStorage.setItem("supabase_token", session.access_token);
        router.push("/tasks");
      }
    };
    handleCallback();
  }, []);

  return <div>Loading...</div>;
}
