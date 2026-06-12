import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Returns the LemonSqueezy customer portal URL for the signed-in user's
// subscription. The portal is where they update their card or cancel.
export async function POST() {
  const auth = await createSupabaseServerClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  // LS subscription id is stored in stripe_subscription_id (reused column).
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const subId = profile?.stripe_subscription_id;
  if (!subId) return NextResponse.json({ error: "No active subscription found" }, { status: 404 });

  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Billing not configured" }, { status: 500 });

  const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subId}`, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    return NextResponse.json({ error: `Lemon Squeezy error: ${t.slice(0, 200)}` }, { status: 500 });
  }
  const data = await res.json();
  const url = data?.data?.attributes?.urls?.customer_portal;
  if (!url) return NextResponse.json({ error: "No portal URL returned" }, { status: 500 });
  return NextResponse.json({ url });
}
