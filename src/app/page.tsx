import { Brand } from "@/components/brand";

export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-[17px] py-[22px] md:px-7 md:py-9"
    >
      <Brand />
      <section className="flex max-w-xl flex-col gap-4">
        <h1 className="page-title">
          Shared context for teams that build with agents.
        </h1>
        <p className="page-description">
          Application foundation is ready. Borrow’s shared workspace is the next
          build stage.
        </p>
      </section>
    </main>
  );
}
