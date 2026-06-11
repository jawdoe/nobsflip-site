"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

export default function ProfilePage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) { router.push("/login"); return; }
      setUser(u);
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_premium, display_name, avatar_url")
        .eq("id", u.id)
        .single();
      setIsPremium(profile?.is_premium === true);
      setDisplayName(profile?.display_name ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoading(false);
    });
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    setUploadError(null);
    setUploadDone(false);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setUploadError("Upload failed: " + error.message);
    } else {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      setUploadDone(true);
      setTimeout(() => setUploadDone(false), 3000);
    }
    setUploadingAvatar(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0d0b16]">
        <div className="text-sm text-white/30">Hang on...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b16] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_40%)]" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 py-8">
        <div className="mb-6">
          <div className="inline-flex rounded-full border border-purple-400/35 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-300">
            NoBSFlips / Profile
          </div>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight">Your Profile</h1>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative group"
            disabled={uploadingAvatar}
          >
            <div className="h-24 w-24 rounded-full border-2 border-purple-500/40 overflow-hidden bg-purple-500/10 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          {uploadError && <p className="text-xs text-red-400 text-center">No good — {uploadError}</p>}
          {uploadDone && <p className="text-xs text-green-400 text-center">On ya — pic updated ✓</p>}
          {!uploadError && !uploadDone && (
            <p className="text-xs text-white/30">{uploadingAvatar ? "Sending it up..." : "Tap to swap ya pic"}</p>
          )}
        </div>

        {/* Plan badge */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-white/40">Plan</p>
            <p className="mt-0.5 font-black text-white">{isPremium ? "Premium" : "Free"}</p>
          </div>
          {isPremium ? (
            <span className="rounded-full border border-purple-400/40 bg-purple-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-300">
              ✦ Active
            </span>
          ) : (
            <a href="/pricing" className="rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-purple-300 transition hover:bg-purple-500/20">
              Upgrade →
            </a>
          )}
        </div>

        {/* Form fields */}
        <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-white/40">Email</label>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
              {user?.email}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-white/40">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="What do ya mates call ya?"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={
              "w-full rounded-xl py-3 text-xs font-black uppercase tracking-[0.1em] transition " +
              (saved
                ? "border border-green-500/30 bg-green-500/10 text-green-400"
                : "border border-purple-400/30 bg-purple-500/15 text-purple-300 hover:bg-purple-500/25")
            }
          >
            {saved ? "Saved ✓" : saving ? "Saving..." : "Save It"}
          </button>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-white/10 py-3 text-xs font-black uppercase tracking-[0.1em] text-white/40 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
        >
          ChuckIt — Sign Out
        </button>
      </div>
    </main>
  );
}

