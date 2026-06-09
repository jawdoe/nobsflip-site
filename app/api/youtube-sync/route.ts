import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const CHANNEL_HANDLE = "NoBSFlips";

type YouTubePlaylistItem = {
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    resourceId: {
      videoId: string;
    };
    thumbnails?: {
      maxres?: { url: string };
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
};

function makeSlug(title: string, videoId: string) {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)}-${videoId}`;
}

function getBestThumbnail(item: YouTubePlaylistItem) {
  return (
    item.snippet.thumbnails?.maxres?.url ||
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    null
  );
}

async function getUploadsPlaylistId(apiKey: string) {
  if (process.env.YOUTUBE_UPLOADS_PLAYLIST_ID) {
    return process.env.YOUTUBE_UPLOADS_PLAYLIST_ID;
  }

  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("forHandle", CHANNEL_HANDLE);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(`YouTube channel lookup failed: ${JSON.stringify(json)}`);
  }

  const uploadsPlaylistId =
    json.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error("Could not find YouTube uploads playlist ID.");
  }

  return uploadsPlaylistId;
}

export async function GET(request: Request) {
  const secret = request.headers.get("x-youtube-sync-secret");
  const expectedSecret = process.env.YOUTUBE_SYNC_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing YOUTUBE_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const uploadsPlaylistId = await getUploadsPlaylistId(apiKey);

    const url = new URL(`${YOUTUBE_API_BASE}/playlistItems`);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "25");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(`YouTube playlist fetch failed: ${JSON.stringify(json)}`);
    }

    const items = (json.items ?? []) as YouTubePlaylistItem[];

    let inserted = 0;
    let skipped = 0;

    for (const item of items) {
      const videoId = item.snippet.resourceId.videoId;

      if (!videoId) {
        skipped += 1;
        continue;
      }

      const { data: existing } = await supabaseAdmin
        .from("media_posts")
        .select("id")
        .eq("youtube_id", videoId)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      const title = item.snippet.title;
      const description = item.snippet.description || "";

      const { error } = await supabaseAdmin.from("media_posts").insert({
        title,
        slug: makeSlug(title, videoId),
        type: "video",
        platform: "youtube",
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        youtube_id: videoId,
        thumbnail_url: getBestThumbnail(item),
        excerpt: description.slice(0, 220),
        content: description,
        tags: [],
        published: true,
        featured: false,
        published_at: item.snippet.publishedAt,
      });

      if (error) {
        throw new Error(`Supabase insert failed: ${error.message}`);
      }

      inserted += 1;
    }

    return NextResponse.json({
      success: true,
      channelHandle: CHANNEL_HANDLE,
      uploadsPlaylistId,
      found: items.length,
      inserted,
      skipped,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown YouTube sync error",
      },
      { status: 500 }
    );
  }
}