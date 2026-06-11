import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NoBSFlips — eBay Flip Scanner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0d0b16",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -200,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Brand pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(147,51,234,0.15)",
            border: "1px solid rgba(167,139,250,0.3)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 28,
          }}
        >
          <span style={{ color: "#c4b5fd", fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            NoBSFlips / eBay Flip Scanner
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 32 }}>
          <span style={{ color: "#ffffff", fontSize: 80, fontWeight: 900, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            Scan It.
          </span>
          <span style={{ color: "#c4b5fd", fontSize: 80, fontWeight: 900, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
            Know Instantly.
          </span>
        </div>

        {/* Subtext */}
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 24, lineHeight: 1.5, maxWidth: 620, margin: 0 }}>
          Point ya phone at a barcode at the op shop. Get a fair dinkum answer on whether it's worth flogging on eBay.
        </p>

        {/* Verdict pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 48 }}>
          <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 16, padding: "10px 24px" }}>
            <span style={{ color: "#4ade80", fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>YES — Buy It</span>
          </div>
          <div style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.3)", borderRadius: 16, padding: "10px 24px" }}>
            <span style={{ color: "#facc15", fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>MAYBE</span>
          </div>
          <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, padding: "10px 24px" }}>
            <span style={{ color: "#f87171", fontSize: 20, fontWeight: 900, textTransform: "uppercase" }}>HELL NO</span>
          </div>
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 48, right: 80 }}>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18, fontWeight: 900, letterSpacing: "0.1em" }}>nobsflipin.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
