import { NextRequest, NextResponse } from "next/server";
import { isPremium } from "@/lib/premium";

export const dynamic = "force-dynamic";

// Cheap, fast vision model. Override with ANTHROPIC_VISION_MODEL if you want
// a different one (e.g. a Sonnet for trickier items). Haiku keeps cost ~$0.003/scan.
const MODEL = process.env.ANTHROPIC_VISION_MODEL || "claude-haiku-4-5-20251001";

const SYSTEM_PROMPT =
  "You are a reselling assistant for an op-shop flipper. You are shown ONE photo of a single " +
  "second-hand item. Produce the best short eBay search query to find comparable SOLD listings for it. " +
  "Identify the item as SPECIFICALLY as you can: read every bit of visible text and prioritise the " +
  "distinguishing details — exact model or part number, book title and author, edition or version, " +
  "variant / scent / flavour name, size or capacity, colour, and year or era — not just the brand. " +
  "The query must pin down the exact product, not the general category. Only fall back to brand plus " +
  "product type if no more specific identifier is visible. Reply with ONLY the search query: 2 to 8 " +
  "words, no punctuation, no quotes, no commentary. If you genuinely cannot identify the item, reply " +
  "with the single word UNKNOWN.";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Photo scan isn't switched on yet — no ANTHROPIC_API_KEY set." },
      { status: 503 }
    );
  }

  let body: { image?: string; mediaType?: string; userId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { image, mediaType, userId } = body ?? {};
  if (!image) return NextResponse.json({ error: "No image supplied" }, { status: 400 });
  if (!userId) return NextResponse.json({ error: "Sign in to use photo scan" }, { status: 401 });

  // Premium gate — enforced server-side. Never trust the client's word for this.
  const premium = await isPremium(userId);
  if (!premium) {
    return NextResponse.json(
      { error: "Photo scan is a Premium feature", upgrade: true },
      { status: 403 }
    );
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 64,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: image,
                },
              },
              { type: "text", text: "What eBay search term best identifies this item?" },
            ],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Vision API error ${res.status}`, detail: detail.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string = (data?.content?.[0]?.text ?? "").trim();
    // Keep just the first line, strip stray quotes / trailing punctuation.
    const searchTerm = raw
      .split(/\r?\n/)[0]
      .replace(/^["'`]+|["'`.]+$/g, "")
      .trim();

    if (!searchTerm || /^unknown$/i.test(searchTerm)) {
      return NextResponse.json(
        { error: "Couldn't make out what that is — try a clearer photo with one item in frame." },
        { status: 422 }
      );
    }

    return NextResponse.json({ searchTerm });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Vision failed" },
      { status: 500 }
    );
  }
}
