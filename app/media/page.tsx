export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
  if (post.youtube_id) return `https://img.youtube.com/vi/${post.youtube_id}/hqdefault.jpg`;
  return null;
}

function getPostDate(post: MediaPost) {
  return new Date(post.published_at || post.created_at).toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function FloatingBackButton() {
  return (
    <Link
      href="/"
      aria-label="Back to home"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-purple-300/30 bg-purple-600 text-white shadow-[0_0_28px_rgba(147,51,234,0.55)] transition hover:scale-105 hover:bg-purple-500 active:scale-95 md:bottom-8 md:right-8"
    >
      <ArrowLeft className="h-6 w-6" />
    </Link>
  );
}

function FeaturedVideo({ post }: { post: MediaPost }) {
  const thumb = getYouTubeThumbnail(post);

  return (
    <section className="mt-10">
      <div className="mb-5 text-center md:text-left">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-purple-300">
          Featured latest upload
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
          Start here.
        </h2>
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-purple-400/20 bg-black/65 shadow-[0_24px_80px_rgba(147,51,234,0.18)] backdrop-blur-md md:grid md:grid-cols-[1.25fr_0.75fr]">
        <div className="relative aspect-video bg-black md:aspect-auto md:min-h-[360px]">
          {thumb ? (
            <img src={thumb} alt={post.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[260px] items-center justify-center bg-gradient-to-br from-purple-500/20 via-black/70 to-[#8cff00]/10 text-sm font-black uppercase tracking-[0.16em] text-white/40">
              No thumbnail
            </div>
          )}

          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
              Latest
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 md:p-8">
          <div>
            <h3 className="text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl">
              {post.title}
            </h3>

            <p className="mt-4 text-base leading-7 text-white/70">
              {post.excerpt}
            </p>

            {post.tags?.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
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
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
            <p className="text-xs text-white/40">{getPostDate(post)}</p>

            {post.youtube_url ? (
              <Link
                href={post.youtube_url}
                target="_blank"
                className="rounded-xl bg-[#8cff00] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#a6ff32] active:scale-95"
              >
                Watch
              </Link>
            ) : (
              <span className="text-xs text-white/35">No link</span>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}

function Section({
  id,
  title,
  tone = "green",
  posts,
}: {
  id: string;
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
    <section id={id} className="mb-14 scroll-mt-8 md:mb-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className={`text-2xl font-black uppercase md:text-3xl ${titleClass}`}>
          {title}
        </h2>

        <p className="text-sm font-bold text-white/45">
          {posts.length} post{posts.length === 1 ? "" : "s"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/45 p-6 text-sm text-white/50 backdrop-blur-sm">
          Nothing here yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const thumb = getYouTubeThumbnail(post);

            return (
              <article
                key={post.id}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-black/60 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-md transition md:hover:-translate-y-1 md:hover:border-[#8cff00]/50"
              >
                <div className="relative aspect-video bg-black">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-300 md:group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#8cff00]/15 via-black/50 to-orange-500/20 text-sm font-black uppercase tracking-[0.16em] text-white/40">
                      No thumbnail
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {post.type === "short" && <Badge>Short</Badge>}
                    {post.tags?.includes("win") && <Badge green>Win</Badge>}
                    {post.tags?.includes("fail") && <Badge red>Fail</Badge>}
                    {post.featured && <Badge outline>Featured</Badge>}
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <h3 className="text-2xl font-black uppercase leading-tight tracking-tight md:text-xl xl:text-2xl">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-base leading-7 text-white/70 md:min-h-[72px] md:text-sm md:leading-6">
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
                    <p className="text-xs text-white/40">{getPostDate(post)}</p>

                    {post.youtube_url ? (
                      <Link
                        href={post.youtube_url}
                        target="_blank"
                        className="rounded-xl bg-[#8cff00] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#a6ff32] active:scale-95"
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

function Badge({
  children,
  green = false,
  red = false,
  outline = false,
}: {
  children: React.ReactNode;
  green?: boolean;
  red?: boolean;
  outline?: boolean;
}) {
  let className =
    "rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] backdrop-blur";

  if (green) className += " bg-[#8cff00] text-black";
  else if (red) className += " bg-red-500 text-white";
  else if (outline)
    className += " border border-[#8cff00]/30 bg-[#8cff00]/15 text-[#8cff00]";
  else className += " border border-white/10 bg-black/60 text-white";

  return <span className={className}>{children}</span>;
}

function SectionJump({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-center text-sm font-black uppercase text-white/80 backdrop-blur-md transition hover:border-purple-400/40 hover:bg-purple-500/10 hover:text-white active:scale-95"
    >
      {label}
    </Link>
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

  const featuredVideo = videos[0] ?? null;
  const remainingVideos = featuredVideo
    ? videos.filter((post) => post.id !== featuredVideo.id)
    : videos;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/outback-pub-bg.png')] bg-cover bg-center bg-no-repeat opacity-55" />
        <div className="absolute inset-0 bg-black/70 md:bg-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/65 to-black/30" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[720px] px-4 pb-32 pt-8 sm:px-6 md:max-w-7xl md:px-8 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[720px] text-center md:mx-0 md:max-w-4xl md:text-left">
          <div className="inline-flex rounded-full border border-[#8cff00]/35 bg-black/45 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#8cff00] backdrop-blur md:tracking-[0.28em]">
            NOBSFLIP / Videos
          </div>

          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-tight md:mt-6 md:text-7xl">
            Media.
            <span className="block text-[#8cff00]">No BS Content.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-[560px] text-base leading-7 text-white/75 md:mx-0 md:mt-6 md:max-w-2xl md:text-lg">
            Shorts for quick hits. Wins for what worked. Fails for what didn’t.
            Full videos for the full story.
          </p>
        </div>

        {featuredVideo && <FeaturedVideo post={featuredVideo} />}

        <div className="mt-7 grid grid-cols-2 gap-3 md:mt-10 md:max-w-[720px] lg:grid-cols-4">
          <SectionJump href="#shorts" label="Shorts" />
          <SectionJump href="#wins" label="Wins" />
          <SectionJump href="#fails" label="Fails" />
          <SectionJump href="#full-videos" label="Full Videos" />
        </div>

        {error && (
          <div className="mt-10 rounded-3xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-md">
            <p className="text-sm text-red-200">Failed to load media posts.</p>
          </div>
        )}

        {!error && (
          <div className="mt-10 md:mt-12">
            <Section id="shorts" title="Shorts" posts={shorts} />
            <Section id="wins" title="Wins" posts={wins} />
            <Section id="fails" title="Fails" tone="red" posts={fails} />
            <Section
              id="full-videos"
              title="Full Videos"
              tone="white"
              posts={remainingVideos}
            />
          </div>
        )}
      </section>

      <FloatingBackButton />
    </main>
  );
}