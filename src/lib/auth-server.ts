import { createClient } from "@supabase/supabase-js";

export async function verifyUser(request: Request): Promise<{ role: "admin" | "member" | "guest" }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    return { role: "admin" }; // local dev bypass
  }

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return { role: "guest" };

    const token = authHeader.split(" ")[1];
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return { role: "guest" };

    const { data: profile } = await client
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    return { role: (profile?.role as any) || "member" };
  } catch {
    return { role: "guest" };
  }
}
