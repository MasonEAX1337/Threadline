import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threadline — Borrow",
  description:
    "Your team's shared understanding of the codebase. Explore architecture, understand changes, and coordinate agent-led work.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
