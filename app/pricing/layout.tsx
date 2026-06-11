import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — NoBSFlips",
  description: "Start free. Chuck in for premium when the flips are paying for it. No lock-in, no dramas.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
