import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scanner — NoBSFlips",
  description: "Point ya phone at a barcode. Get a straight answer on whether it's worth flipping.",
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
