import type { Metadata } from "next";
import { Suspense } from "react";
import { Application } from "@/components/application";
import { projectService } from "@/lib/services";
import "./globals.css";
export const metadata: Metadata = {
  title: "Threadline — Borrow",
  description:
    "Your team's shared understanding of the codebase. Explore architecture, understand changes, and coordinate agent-led work.",
};
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const snapshot = await projectService.getSnapshot();
  return (
    <html lang="en" className="dark">
      <body>
        <Suspense
          fallback={
            <div className="loading-screen">Loading project knowledge…</div>
          }
        >
          <Application snapshot={snapshot} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
