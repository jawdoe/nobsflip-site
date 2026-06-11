"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function HeaderAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      if (!u) return;
      // Get initials from email
      setInitials(u.email?.[0]?.toUpperCase() ?? "?");
      // Get avatar from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", u.id)
        .single();
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) { setAvatarUrl(null); setInitials(null); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!initials) return null;

  return (
    <Link href="/profile" className="md:hidden">
      <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-purple-500/40 bg-purple-500/20 flex items-center justify-center transition hover:border-purple-400/70">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-black text-purple-300">{initials}</span>
        )}
      </div>
    </Link>
  );
}
