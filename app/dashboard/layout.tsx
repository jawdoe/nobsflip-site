import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — NoBSFlips",
  description: "Track every flip — what you paid, what it sold for, and how much you're actually making.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
