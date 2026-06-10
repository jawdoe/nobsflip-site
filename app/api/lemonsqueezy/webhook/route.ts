import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verifySignature(body: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac("sha256", secret).update(body).digest("hex");
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch { return false; }
}

async function setPremium(userId: string, isPremium: boolean, subscriptionId: string, status: string) {
  const supabase = getSupabaseAdmin();
  await supabase.from("profiles").upsert({
    id: userId,
    is_premium: isPremium,
    stripe_subscription_id: subscriptionId,  // reusing column for LS subscription ID
    subscription_status: status,
    premium_since: isPremium ? new Date().toISOString() : undefined,
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-signature") ?? "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  if (!verifySignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try { event = JSON.parse(body); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = event?.meta?.event_name as string;
  const userId = event?.meta?.custom_data?.user_id as string;
  const subscriptionId = String(event?.data?.id ?? "");
  const status = event?.data?.attributes?.status as string;

  if (!userId) return NextResponse.json({ received: true });

  try {
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
        await setPremium(userId, status === "active" || status === "on_trial", subscriptionId, status);
        break;
      case "subscription_cancelled":
      case "subscription_expired":
        await setPremium(userId, false, subscriptionId, status);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Handler failed" }, { status: 500 });
  }
}
