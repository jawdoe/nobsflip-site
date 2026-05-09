export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MediaPost = {
  id: string;
  title: string;
  slug: string;
  type: "video" | "short" | "update";
  platform: string;
  youtube_url: string | null;
  youtube_id: string | null;
  thumbnail_url: string | null;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  created_at: string;
  published_at: string | null;
};

function getYouTubeThumbnail(post: MediaPost) {
  if (post.thumbnail_url) return post.thumbnail_url;

  if (post.youtube_id) {
    return `https://img.youtube.com/vi/${post.youtube_id}/hqdefault.jpg`;
  }

  return null;
}

function Section({
  title,
  tone = "green",
  posts,
}: {
  title: string;
  tone?: "green" | "red" | "white";
  posts: MediaPost[];
}) {
  const titleClass =
    tone === "red"
      ? "text-red-400"
      : tone === "white"
        ? "text-white"
        : "text-[#8cff00]";

  return (
    <section className="mb-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className={`text-2xl font-black uppercase ${titleClass}`}>
          {title}
        </h2>

        <p className="text-sm font-bold text-white/45">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/35 p-6 text-sm text-white/50 backdrop-blur-sm">
          Nothing here yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const thumb = getYouTubeThumbnail(post);

            return (
              <article
                key={post.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#8cff00]/50"
              >
                <div className="relative aspect-video bg-black">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8cff00]/15 via-black/50 to-orange-500/20 text-sm font-black uppercase tracking-[0.2em] text-white/40">
                      No thumbnail
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {post.type === "short" && (
                      <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-white backdrop-blur">
                        Short
                      </span>
                    )}

                    {post.tags?.includes("win") && (
                      <span className="rounded-full bg-[#8cff00] px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-black">
                        Win
                      </span>
                    )}

                    {post.tags?.includes("fail") && (
                      <span className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-white">
                        Fail
                      </span>
                    )}

                    {post.featured && (
                      <span className="rounded-full border border-[#8cff00]/30 bg-[#8cff00]/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.15em] text-[#8cff00] backdrop-blur">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black uppercase leading-tight tracking-tight">
                    {post.title}
                  </h3>

                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-white/65">
                    {post.excerpt}
                  </p>

                  {post.tags?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-white/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <p className="text-xs text-white/40">
                      {(post.published_at || post.created_at) &&
                        new Date(
                          post.published_at || post.created_at
                        ).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                    </p>

                    {post.youtube_url ? (
                      <Link
                        href={post.youtube_url}
                        target="_blank"
                        className="rounded-lg bg-[#8cff00] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#a6ff32]"
                      >
                        Watch
                      </Link>
                    ) : (
                      <span className="text-xs text-white/35">No link</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default async function MediaPage() {
  const { data, error } = await supabase
    .from("media_posts")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  const posts: MediaPost[] = data ?? [];

  const shorts = posts.filter((post) => post.type === "short");
  const wins = posts.filter((post) => post.tags?.includes("win"));
  const fails = posts.filter((post) => post.tags?.includes("fail"));
  const videos = posts.filter((post) => post.type === "video");

  const stats = [
    { label: "Posts", value: posts.length },
    { label: "Shorts", value: shorts.length },
    { label: "Wins", value: wins.length },
    { label: "Fails", value: fails.length },
    { label: "Videos", value: videos.length },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-pub-bg.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a]/80 via-transparent to-black/20" />
      </div>

      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-8">
        <div className="max-w-4xl">
          <div className="inline-flex rounded-full border border-[#8cff00]/35 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#8cff00] backdrop-blur">
            NOBSFLIP / Videos
          </div>

          <h1 className="mt-6 text-5xl font-black uppercase leading-[0.95] tracking-tight md:text-7xl">
            Media.
            <span className="block text-[#8cff00] text-stroke-heavy">
              No BS Content.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
            Shorts for quick hits. Wins for what worked. Fails for what didn’t.
            Full videos for the full story.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-black/45 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-md"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-white/50">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-black text-[#8cff00]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-md">
            <p className="text-sm text-red-200">Failed to load media posts.</p>
          </div>
        )}

        {!error && (
          <div className="mt-12">
            <Section title="Shorts" posts={shorts} />
            <Section title="Wins" posts={wins} />
            <Section title="Fails" tone="red" posts={fails} />
            <Section title="Full Videos" tone="white" posts={videos} />
          </div>
        )}
      </section>
    </main>
  );
}