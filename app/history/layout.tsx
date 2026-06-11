import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan History — NoBSFlips",
  description: "Every barcode ya've scanned — saved automatically so you can look back and track what's worth it.",
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
