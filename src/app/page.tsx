import { Box } from "lucide-react";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-6 py-10">
      <div className="flex items-center gap-3 text-2xl font-semibold">
        <Box
          aria-hidden="true"
          className="text-primary"
          size={29}
          strokeWidth={1.6}
        />
        Threadline
      </div>
      <section className="flex max-w-xl flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Shared context for teams that build with agents.
        </h1>
        <p className="text-muted-foreground">
          Application foundation is ready. Borrow’s shared workspace is the next
          build stage.
        </p>
      </section>
    </main>
  );
}
