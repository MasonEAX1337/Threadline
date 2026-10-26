import type { Metadata } from "next";
import { Suspense } from "react";
import { Application } from "@/components/application";
import { projectService } from "@/lib/services";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/inter-latin-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Threadline — Borrow",
  description:
    "Your team's shared understanding of the codebase. Explore architecture, understand changes, and coordinate agent-led work.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <TooltipProvider>
          <Suspense
            fallback={
              <p role="status" className="p-7 text-muted-foreground">
                Loading project knowledge…
              </p>
            }
          >
            <ProjectWorkspace>{children}</ProjectWorkspace>
          </Suspense>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}

async function ProjectWorkspace({ children }: { children: React.ReactNode }) {
  const seed = await projectService.getSnapshot();
  return <Application seed={seed}>{children}</Application>;
}
