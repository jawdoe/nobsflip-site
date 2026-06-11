import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isPremium } from "@/lib/premium";

const SCOPES = [
  "https://api.ebay.com/oauth/api_scope",
  "https://api.ebay.com/oauth/api_scope/sell.inventory",
  "https://api.ebay.com/oauth/api_scope/sell.account",
  "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
];

export async function GET(request: Request) {
  // Connecting an eBay account is a Premium feature - gate it server-side.
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?redirectTo=/profile", request.url));
  }
  if (!(await isPremium(user.id))) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const redirectUri = process.env.EBAY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing eBay environment variables" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
  });

  const authUrl = `https://auth.ebay.com/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
