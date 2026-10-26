import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh max-w-5xl flex-col items-start gap-10 px-[17px] py-[22px] md:px-7 md:py-9"
    >
      <Brand />
      <div className="flex max-w-xl flex-col items-start gap-4">
        <h1 className="page-title">This page isn&apos;t in the project</h1>
        <p className="page-description">
          The address may have changed or the page may not exist. Return to the
          project overview to continue.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Go to overview
          </Link>
        </Button>
      </div>
    </main>
  );
}
