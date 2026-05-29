import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function getBasicAuthHeader() {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing eBay credentials");
  }

  const encoded = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  return `Basic ${encoded}`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  const redirectUri = process.env.EBAY_REDIRECT_URI;

  if (!redirectUri) {
    return NextResponse.json(
      { error: "Missing redirect URI" },
      { status: 500 }
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: getBasicAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  const tokenData = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error: "Failed to get eBay tokens",
        details: tokenData,
      },
      { status: response.status }
    );
  }

  const now = Date.now();

  const accessTokenExpiresAt = new Date(
    now + tokenData.expires_in * 1000
  ).toISOString();

  const refreshTokenExpiresAt = tokenData.refresh_token_expires_in
    ? new Date(
        now + tokenData.refresh_token_expires_in * 1000
      ).toISOString()
    : null;

  const { error } = await supabase
    .from("ebay_oauth_tokens")
    .insert({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      access_token_expires_at: accessTokenExpiresAt,
      refresh_token_expires_at: refreshTokenExpiresAt,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to save tokens",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "eBay OAuth connected successfully",
  });
}