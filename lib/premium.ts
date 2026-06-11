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

// Free tier: scans allowed per user per day. Premium = unlimited.
// Change this one value to adjust the free allowance everywhere.
export const FREE_DAILY_SCAN_LIMIT = 10;

export type ScanQuota = {
  allowed: boolean;
  premium: boolean;
  used?: number;
  limit?: number;
  remaining?: number;
};

// Atomically checks + increments the user's daily scan count via the
// `consume_scan` Postgres function. Premium users are never counted.
// Fails open (allows the scan) if the DB call errors, so a transient
// hiccup never blocks a legitimate user.
export async function consumeScan(userId: string): Promise<ScanQuota> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.rpc("consume_scan", {
      p_user: userId,
      p_cap: FREE_DAILY_SCAN_LIMIT,
    });
    if (error || !data) {
      console.error("consume_scan error:", error);
      return { allowed: true, premium: false };
    }
    return data as ScanQuota;
  } catch (e) {
    console.error("consume_scan exception:", e);
    return { allowed: true, premium: false };
  }
}
