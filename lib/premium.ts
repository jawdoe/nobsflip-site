import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function isPremium(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .single();
    return data?.is_premium === true;
  } catch {
    return false;
  }
}
