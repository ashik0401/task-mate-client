import { createClient } from "@/lib/supabase/server";

export default async function handler(req, res) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return res.status(401).json({ error: "Unauthorized" });

  res.status(200).json({ message: "You are logged in!" });
}


