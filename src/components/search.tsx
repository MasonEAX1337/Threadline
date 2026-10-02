"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Code2,
  GitBranch,
  Kanban,
  Search,
  Users,
  Workflow,
  CornerDownLeft,
  BookOpen,
  Compass,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useProject } from "./project-context";
import { EmptyState, PageHeader } from "./shared";
import { cn } from "@/lib/utils";
interface SearchResult {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
  taskId?: string;
}
const categories = [
  "Navigation",
  "Components",
  "Architecture",
  "Changes",
  "Tasks",
  "Team",
  "Decisions",
];
const icons = {
  Navigation: Compass,
  Components: Code2,
  Architecture: Workflow,
  Changes: GitBranch,
  Tasks: Kanban,
  Team: Users,
  Decisions: BookOpen,
};
function useResults(query: string) {
  const { data, tasks } = useProject();
  return useMemo<SearchResult[]>(() => {
    const q = query.toLowerCase().trim();
    const navigation = [
      {
        id: "nav-overview",
        category: "Navigation",
        title: "Go to Overview",
        description: "Project snapshot",
        href: "/",
      },
      {
        id: "nav-codebase",
        category: "Navigation",
        title: "Go to Codebase",
        description: "Explore systems and components",
        href: "/codebase",
      },
      {
        id: "nav-board",
        category: "Navigation",
        title: "Go to Board",
        description: "Current work and coordination",
        href: "/board",
      },
      {
        id: "nav-activity",
        category: "Navigation",
        title: "Open recent changes",
        description: "Development updates",
        href: "/activity",
      },
      {
        id: "nav-architecture",
        category: "Navigation",
        title: "Go to Architecture",
        description: "Follow system flows",
        href: "/architecture",
      },
    ];
    const all: SearchResult[] = [
      ...navigation,
      ...data.nodes.map((n) => ({
        id: n.id,
        category: "Components",
        title: n.name,
        description: n.path ?? n.description,
        href: `/codebase?node=${n.id}`,
      })),
      ...data.flows.map((f) => ({
        id: f.id,
        category: "Architecture",
        title: f.name,
        description: f.description,
        href: `/architecture?flow=${f.id}`,
      })),
      ...data.changes.map((c) => ({
        id: c.id,
        category: "Changes",
        title: c.title,
        description: `${c.relativeTime} · ${c.summary}`,
        href: `/activity/${c.id}`,
      })),
      ...tasks.map((t) => ({
        id: t.id,
        category: "Tasks",
        title: t.title,
        description: `${t.id} · ${t.status.replace("-", " ")} · ${t.description}`,
        href: `/board?task=${t.id}`,
        taskId: t.id,
      })),
      ...data.developers.map((u) => ({
        id: u.id,
        category: "Team",
        title: u.name,
        description: `${u.role} · ${u.primaryAreas.join(", ")}`,
        href: `/team?member=${u.id}`,
      })),
      ...data.decisions.map((d) => ({
        id: d.id,
        category: "Decisions",
        title: d.title,
        description: d.decision,
        href: `/codebase?node=${d.componentIds[0]}`,
      })),
    ];
    return q
      ? all
          .filter((r) =>
            `${r.title} ${r.description} ${r.id}`.toLowerCase().includes(q),
          )
          .slice(0, 35)
      : [
          ...navigation,
          ...all
            .filter((r) => r.category === "Components")
            .filter((r) => data.overview.suggestedComponentIds.includes(r.id)),
          ...all.filter((r) => r.category === "Changes").slice(0, 2),
        ];
  }, [query, data, tasks]);
}
export function SearchPalette({
  open,
  onOpenChange,
  onTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTask: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const results = useResults(query);
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);
  useEffect(() => {
    if (open)
      document
        .querySelector(".palette-results .search-result.active")
        ?.scrollIntoView({ block: "nearest" });
  }, [active, query, open]);
  const choose = (r: SearchResult) => {
    onOpenChange(false);
    router.push(r.href);
    if (r.taskId) onTask(r.taskId);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="search-dialog" showCloseButton={false}>
        <DialogTitle className="sr-only">Search project</DialogTitle>
        <DialogDescription className="sr-only">
          Search components, changes, tasks, flows, and teammates. Use arrow
          keys to select a result.
        </DialogDescription>
        <div className="palette-input">
          <Search />
          <input
            autoFocus
            aria-label="Search project"
            placeholder="Search project or jump to…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => (a + 1) % Math.max(1, results.length));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(
                  (a) => (a - 1 + results.length) % Math.max(1, results.length),
                );
              }
              if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                choose(results[active]);
              }
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-results">
          {results.length ? (
            categories.map((cat) => {
              const grouped = results.filter((r) => r.category === cat);
              const Icon = icons[cat as keyof typeof icons];
              return (
                grouped.length > 0 && (
                  <section key={cat}>
                    <h3>{cat}</h3>
                    {grouped.map((r) => (
                      <button
                        className={cn(
                          "search-result",
                          results.indexOf(r) === active && "active",
                        )}
                        key={`${cat}-${r.id}`}
                        onMouseEnter={() => setActive(results.indexOf(r))}
                        onClick={() => choose(r)}
                      >
                        <Icon />
                        <span>
                          <strong>{r.title}</strong>
                          <small>{r.description}</small>
                        </span>
                        <ArrowRight />
                      </button>
                    ))}
                  </section>
                )
              );
            })
          ) : (
            <EmptyState
              title="No matching knowledge"
              description="Try a component, teammate, or a different keyword."
            />
          )}
        </div>
        <footer className="palette-footer">
          <span>
            <CornerDownLeft />
            to open
          </span>
          <span>↑ ↓ to navigate</span>
          <span>Search across Borrow</span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
export function SearchPage({ onTask }: { onTask: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const results = useResults(query);
  const router = useRouter();
  return (
    <div className="page-content search-page">
      <PageHeader
        title="Search project"
        description="Find components, architectural flows, changes, tasks, and the people behind them."
      />
      <label className="search-field full-search">
        <Search />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search project knowledge…"
          aria-label="Search all project knowledge"
        />
        <kbd>⌘ K</kbd>
      </label>
      {results.length ? (
        categories.map((cat) => {
          const grouped = results.filter((r) => r.category === cat);
          const Icon = icons[cat as keyof typeof icons];
          return (
            grouped.length > 0 && (
              <section className="search-section" key={cat}>
                <h2>{cat}</h2>
                {grouped.map((r) => (
                  <button
                    className="search-result"
                    key={r.id}
                    onClick={() => {
                      router.push(r.href);
                      if (r.taskId) onTask(r.taskId);
                    }}
                  >
                    <Icon />
                    <span>
                      <strong>{r.title}</strong>
                      <small>{r.description}</small>
                    </span>
                    <ArrowRight />
                  </button>
                ))}
              </section>
            )
          );
        })
      ) : (
        <EmptyState
          title="No results found"
          description="Try a different term or search for a component by name."
        />
      )}
    </div>
  );
}
