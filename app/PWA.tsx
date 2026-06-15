"use client";

import { useEffect, useState } from "react";

export default function PWA() {
  const [deferred, setDeferred] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    // Register the service worker (makes the app installable).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Already installed / running standalone? Don't nag.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    if (standalone) return;

    // Dismissed recently? Respect that for a week.
    try {
      const until = Number(localStorage.getItem("nbf_install_dismissed_until") || 0);
      if (until && Date.now() < until) return;
    } catch {}

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS) {
      setIos(true);
      setShow(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setShow(false));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  function dismiss() {
    setShow(false);
    try {
      // snooze for 7 days
      localStorage.setItem("nbf_install_dismissed_until", String(Date.now() + 7 * 86400000));
    } catch {}
  }

  return (
    <div className="fixed inset-x-3 bottom-24 z-[70] mx-auto max-w-md rounded-2xl border border-purple-400/40 bg-[#15101f]/95 p-4 shadow-[0_0_40px_rgba(147,51,234,0.25)] backdrop-blur-xl md:inset-x-auto md:bottom-6 md:right-6 md:left-auto">
      <div className="flex items-start gap-3">
        <img src="/icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">Chuck NoBSFlips on ya phone</p>
          {ios ? (
            <p className="mt-0.5 text-xs leading-5 text-white/55">
              Tap <span className="font-black text-white">Share</span> →{" "}
              <span className="font-black text-white">Add to Home Screen</span>. Works like a real app, no app store.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-5 text-white/55">
              Install it and it runs like a proper app — full screen, one tap from ya home screen.
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            {!ios && (
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
              {ios ? "Got it" : "Not now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
