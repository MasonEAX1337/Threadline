"use client";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRight,
  House,
  Box,
  Workflow,
  GitCommitHorizontal,
  Kanban,
  Users,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProject } from "@/components/project-context";
import { Modal, PageHeading, EmptyState } from "@/components/shared";
import type { Snapshot, Task } from "@/types";
interface Result {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
}
export function searchKnowledge(
  seed: Snapshot,
  tasks: Task[],
  query: string,
): Result[] {
  const nav: Result[] = [
    ["Overview", "/", "Your project at a glance"],
    ["Codebase", "/codebase", "Components and dependencies"],
    ["Board", "/board", "Tasks and milestones"],
    ["recent changes", "/activity", "What changed and why"],
    ["Architecture", "/architecture", "How your system works"],
  ].map(([name, href, subtitle], i) => ({
    id: `nav-${i}`,
    group: "Navigation",
    title: i === 3 ? "Open recent changes" : `Go to ${name}`,
    subtitle,
    href,
    icon: House,
  }));
  const components = seed.nodes.map((n) => ({
    id: n.id,
    group: "Components",
    title: n.name,
    subtitle: n.description,
    href: `/codebase?node=${n.id}`,
    icon: Box,
  }));
  const changes = seed.changes.map((c) => ({
    id: c.id,
    group: "Changes",
    title: c.title,
    subtitle: c.summary,
    href: `/activity/${c.id}`,
    icon: GitCommitHorizontal,
  }));
  if (!query.trim())
    return [
      ...nav,
      ...seed.overview.suggestedComponentIds.flatMap((id) =>
        components.filter((c) => c.id === id),
      ),
      ...changes.slice(0, 2),
    ];
  const results: Result[] = [
    ...nav,
    ...components,
    ...seed.flows.map((f) => ({
      id: f.id,
      group: "Architecture",
      title: f.name,
      subtitle: f.description,
      href: `/architecture?flow=${f.id}`,
      icon: Workflow,
    })),
    ...changes,
    ...tasks.map((t) => ({
      id: t.id,
      group: "Tasks",
      title: t.title,
      subtitle: `${t.id} · ${t.description}`,
      href: `/board?task=${t.id}`,
      icon: Kanban,
    })),
    ...seed.developers.map((d) => ({
      id: d.id,
      group: "Team",
      title: d.name,
      subtitle: `${d.role} · ${d.primaryAreas.join(", ")}`,
      href: `/team?member=${d.id}`,
      icon: Users,
    })),
    ...seed.decisions.map((d) => ({
      id: d.id,
      group: "Decisions",
      title: d.title,
      subtitle: `${d.id.toUpperCase()} · ${d.context}`,
      href: `/codebase?node=${d.componentIds[0]}`,
      icon: BookOpen,
    })),
  ];
  return results
    .filter((r) =>
      `${r.title} ${r.subtitle} ${r.id}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .slice(0, 35);
}
function SearchResults({
  onOpen,
  fullPage = false,
}: {
  onOpen?: () => void;
  fullPage?: boolean;
}) {
  const { seed, tasks, go } = useProject();
  const [query, setQuery] = useState(""),
    [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const results = searchKnowledge(seed, tasks, query);
  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  function open(result: Result) {
    onOpen?.();
    go(result.href);
  }
  return (
    <div className="search-content">
      <div className="global-search-input">
        <Search size={20} />
        <Input
          autoFocus
          aria-label="Search project"
          placeholder="Search project or jump to…"
          role="combobox"
          aria-controls="knowledge-results"
          aria-expanded={results.length > 0}
          aria-autocomplete="list"
          aria-activedescendant={
            results[active] ? `result-${active}` : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (["ArrowDown", "ArrowUp"].includes(e.key)) {
              e.preventDefault();
              if (results.length)
                setActive(
                  (i) =>
                    (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                    results.length,
                );
            }
            if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              open(results[active]);
            }
          }}
        />
      </div>
      <div
        id="knowledge-results"
        role="listbox"
        aria-label="Knowledge results"
        className="search-results"
        ref={list}
      >
        {results.length === 0 ? (
          <EmptyState
            title={fullPage ? "No results found" : "No matching knowledge"}
            description="Try a component, task, person, or architectural decision."
          />
        ) : (
          results.map((result, i) => {
            const Icon = result.icon;
            return (
              <div key={`${result.group}-${result.id}`}>
                {i === 0 || results[i - 1].group !== result.group ? (
                  <div className="result-group">{result.group}</div>
                ) : null}
                <button
                  id={`result-${i}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  className={
                    i === active ? "search-result selected" : "search-result"
                  }
                  onMouseEnter={() => setActive(i)}
                  onClick={() => open(result)}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{result.title}</strong>
                    <small>{result.subtitle}</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <footer className="search-footer">
        <span>
          <kbd>↵</kbd> Enter to open
        </span>
        <span>↑ ↓ to navigate</span>
        <span>Search across Borrow</span>
      </footer>
    </div>
  );
}
export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Search project"
      description="Search shared knowledge or jump to another view."
      className="search-dialog"
    >
      {open && <SearchResults onOpen={onClose} />}
    </Modal>
  );
}
export function SearchPage() {
  return (
    <>
      <PageHeading
        title="Search project"
        description="Find components, changes, tasks, people, and decisions."
      />
      <section className="panel full-search">
        <SearchResults fullPage />
      </section>
    </>
  );
}
