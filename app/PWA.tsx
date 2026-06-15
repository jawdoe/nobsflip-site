"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "desktop";

export default function PWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const ua = navigator.userAgent;
    const isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (/Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document);
    const isAndroid = /android/i.test(ua);
    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "desktop");
    // In-app browsers (opened from a social app) usually can't install PWAs.
    setInApp(/FBAN|FBAV|Instagram|Line\/|TikTok|musical_ly|Snapchat|Twitter|Pinterest|FB_IAB/i.test(ua));

    // Capture Chrome's install event if it fires (enables one-tap install).
    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));

    // Manual trigger — a "Download to ya phone" button anywhere fires this.
    const manual = () => setShow(true);
    window.addEventListener("nbf:install", manual);

    // Auto-show, but only if not already installed and not snoozed.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    let snoozed = false;
    try {
      const until = Number(localStorage.getItem("nbf_install_dismissed_until") || 0);
      snoozed = !!(until && Date.now() < until);
    } catch {}
    if (!standalone && !snoozed) {
      timer = setTimeout(() => setShow(true), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("nbf:install", manual);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!show) return null;

  async function install() {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice;
      setDeferred(null);
      setShow(false);
    }
  }

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem("nbf_install_dismissed_until", String(Date.now() + 7 * 86400000));
    } catch {}
  }

  // What the banner says depends on what the browser will let us do.
  let instructions: React.ReactNode = null;
  const canOneTap = !!deferred && !inApp;
  if (!canOneTap) {
    if (inApp) {
      // Opened inside a social app's browser — they have to open it in a real browser first.
      instructions = (
        <>Open this in your browser first: tap the <span className="font-black text-white">⋯ menu</span> and choose <span className="font-black text-white">Open in browser</span>, then add it to your home screen.</>
      );
    } else if (platform === "ios") {
      instructions = (
        <>Tap <span className="font-black text-white">Share ⬆️</span> then <span className="font-black text-white">Add to Home Screen</span>.</>
      );
    } else {
      instructions = (
        <>Open your browser menu (<span className="font-black text-white">⋮ or ⋯</span>) and tap <span className="font-black text-white">Add to Home Screen</span> (or <span className="font-black text-white">Install app</span>).</>
      );
    }
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-[70] mx-auto max-w-md rounded-2xl border border-purple-400/40 bg-[#15101f]/95 p-4 shadow-[0_0_40px_rgba(147,51,234,0.3)] backdrop-blur-xl md:inset-x-auto md:bottom-6 md:right-6 md:left-auto">
      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">Get NoBSFlips on ya phone</p>
          <p className="mt-0.5 text-xs leading-5 text-white/55">
            {canOneTap
              ? "One tap and it runs like a proper app — full screen, straight off ya home screen."
              : instructions}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {canOneTap && (
              <button
                onClick={install}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:bg-purple-500"
              >
                Install
              </button>
            )}
            <button
              onClick={dismiss}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-white/40 transition hover:text-white"
            >
              {canOneTap ? "Not now" : "Got it"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
