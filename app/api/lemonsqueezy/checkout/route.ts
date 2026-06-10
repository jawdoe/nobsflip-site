import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://nobsflipin.com";

    if (!apiKey || !storeId || !variantId) {
      return NextResponse.json({ error: "Lemon Squeezy not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/vnd.api+json",
        "Accept": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: email ?? undefined,
              custom: { user_id: userId },
            },
            product_options: {
              redirect_url: `${siteUrl}/upgrade-success`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: storeId } },
            variant: { data: { type: "variants", id: variantId } },
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Lemon Squeezy error: ${err.slice(0, 200)}` }, { status: 500 });
    }

    const data = await res.json();
    const url = data?.data?.attributes?.url;
    if (!url) return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
