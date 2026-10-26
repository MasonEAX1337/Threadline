"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Search,
  GitBranch,
  GitCommitHorizontal,
  FileCode,
  Sparkles,
} from "lucide-react";
import { useProject } from "@/components/project-context";
import {
  PageHeading,
  Avatar,
  Panel,
  ComponentChips,
  ExternalLink,
  EmptyState,
  StatusIcon,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Change } from "@/types";
const tabs = [
  "All",
  "Important",
  "Architecture",
  "Features",
  "Fixes",
  "Refactors",
  "Team",
];
export function FlowText({ text }: { text: string }) {
  return (
    <div className="flow-text">
      {text.split("\n").map((line, i) => (
        <div key={i}>
          {line.split(" → ").map((piece, j) => (
            <span key={`${j}-${piece}`}>
              {j > 0 && <ArrowRight size={13} />}
              <code>{piece}</code>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
export function Activity() {
  const { seed, go } = useProject(),
    params = useSearchParams();
  const [tab, setTab] = useState("All"),
    [query, setQuery] = useState(""),
    [author, setAuthor] = useState(""),
    [component, setComponent] = useState(params.get("component") ?? ""),
    [time, setTime] = useState("week"),
    [branch, setBranch] = useState("");
  function clear() {
    setTab("All");
    setQuery("");
    setAuthor("");
    setComponent("");
    setTime("week");
    setBranch("");
    if (params.has("component")) go("/activity");
  }
  const changes = seed.changes.filter((c) => {
    const typeMap: Record<string, string> = {
      Features: "feature",
      Fixes: "fix",
      Refactors: "refactor",
    };
    return (
      (tab !== "Important" ||
        ["important", "architectural"].includes(c.significance)) &&
      (tab !== "Architecture" || c.significance === "architectural") &&
      (!typeMap[tab] || c.type === typeMap[tab]) &&
      (!author || c.authorId === author) &&
      (!component || c.componentIds.includes(component)) &&
      (!branch || c.branch === branch) &&
      (time !== "day" || c.timestamp >= "2026-09-29T18:40:00Z") &&
      `${c.title} ${c.summary} ${c.reason} ${c.componentIds.map((id) => seed.nodes.find((n) => n.id === id)?.name).join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  return (
    <>
      <PageHeading
        title="Activity"
        description="What changed, why it changed, and what it means for your system."
      />
      <div
        className="tabs activity-tabs"
        role="tablist"
        aria-label="Change categories"
      >
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="activity-filters">
        <div className="search-field">
          <Search size={16} />
          <Input
            placeholder="Search changes"
            aria-label="Search changes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter changes by author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        >
          <option value="">All authors</option>
          {seed.developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter changes by component"
          value={component}
          onChange={(e) => setComponent(e.target.value)}
        >
          <option value="">All components</option>
          {seed.nodes
            .filter(
              (n) =>
                ["system", "service"].includes(n.type) || n.id === component,
            )
            .map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
        </select>
        <select
          aria-label="Change time range"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        >
          <option value="week">This week</option>
          <option value="day">Last 24 hours</option>
        </select>
        <select
          aria-label="Change branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="">All branches</option>
          {[...new Set(seed.changes.map((c) => c.branch))].map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>
      <div className="feed-count">
        <span>
          {changes.length} {changes.length === 1 ? "update" : "updates"}
        </span>
        <span>Newest first</span>
      </div>
      {changes.length ? (
        <div className="timeline">
          {changes.map((c) => (
            <ChangeEntry key={c.id} change={c} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No changes match these filters"
          description="Try another search term, author, or component, or clear the filters to see every update."
          action={
            <Button variant="outline" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      )}
    </>
  );
}
function ChangeEntry({ change: c }: { change: Change }) {
  const { seed } = useProject();
  const author = seed.developers.find((d) => d.id === c.authorId)!;
  return (
    <article className="timeline-entry">
      <div className="avatar-rail">
        <Avatar person={author} />
        <span />
      </div>
      <div className="activity-body">
        <div className="change-meta">
          <Badge
            variant={
              ["architectural", "important"].includes(c.significance)
                ? "default"
                : "secondary"
            }
          >
            {c.significance.toUpperCase()}
          </Badge>
          <time>{c.relativeTime}</time>
        </div>
        <h2>
          <Link href={`/activity/${c.id}`}>
            {c.title}
            <ArrowUpRight size={16} />
          </Link>
        </h2>
        <div className="metadata">
          <span>{author.name}</span>
          <span>·</span>
          <GitCommitHorizontal size={13} />
          <ExternalLink
            href={`${seed.project.repositoryUrl}/commit/${c.commitSha}`}
          >
            <code>{c.commitSha}</code>
          </ExternalLink>
          <span>·</span>
          <span>PR #{c.pullRequestNumber}</span>
        </div>
        <p className="change-summary">{c.summary}</p>
        <div className="change-explanations">
          <section>
            <h3>Why</h3>
            <p>{c.reason}</p>
          </section>
          <section>
            <h3>What changed</h3>
            <p>{c.implementation}</p>
          </section>
        </div>
        {c.architectureAfter && (
          <div className="system-impact">
            <h3>System impact</h3>
            <FlowText text={c.architectureAfter} />
          </div>
        )}
        <footer>
          <ComponentChips ids={c.componentIds} />
          <Link href={`/activity/${c.id}`} className="text-link">
            View change
            <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
    </article>
  );
}
export function ChangeDetail({ id }: { id: string }) {
  const { seed, tasks, openTask, setDecisionId } = useProject();
  const c = seed.changes.find((c) => c.id === id);
  const [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState("");
  if (!c)
    return (
      <EmptyState
        title="Change not found"
        description="This change is not part of the recorded project knowledge."
        action={
          <Button asChild variant="outline">
            <Link href="/activity">Back to activity</Link>
          </Button>
        }
      />
    );
  const author = seed.developers.find((d) => d.id === c.authorId)!,
    edges = seed.edges.filter(
      (edge) =>
        c.componentIds.includes(edge.source) ||
        c.componentIds.includes(edge.target),
    );
  const selected =
    c.componentIds.find(
      (id) => seed.nodes.find((n) => n.id === id)?.type === "service",
    ) ?? c.componentIds[0];
  return (
    <>
      <Link className="back-link" href="/activity">
        <ArrowLeft size={15} />
        All activity
      </Link>
      <div className="change-detail-heading">
        <Badge>{c.significance.toUpperCase()}</Badge>
        <h1 className="page-title">{c.title}</h1>
        <p className="page-description">{c.summary}</p>
        <div className="detail-author">
          <Avatar person={author} />
          <strong>{author.name}</strong>
          <span>{c.relativeTime}</span>
          <Badge variant="secondary">
            <GitBranch size={12} />
            {c.branch}
          </Badge>
        </div>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <Panel title="Why this changed">
            <div className="panel-body">
              <p>{c.reason}</p>
              <div className="evidence">
                {c.evidence.source} · <code>{c.evidence.revision}</code> ·{" "}
                {c.evidence.status}
              </div>
            </div>
          </Panel>
          <Panel title="What changed">
            <div className="panel-body">
              <p>{c.implementation}</p>
              <div className="evidence">
                {c.evidence.source} · <code>{c.evidence.revision}</code> ·{" "}
                {c.evidence.status}
              </div>
            </div>
          </Panel>
          <Panel title="Architecture impact">
            <div className="panel-body">
              {c.architectureBefore && c.architectureAfter ? (
                <div className="architecture-comparison">
                  <div>
                    <h3>Before</h3>
                    <FlowText text={c.architectureBefore} />
                  </div>
                  <div>
                    <h3>After</h3>
                    <FlowText text={c.architectureAfter} />
                  </div>
                </div>
              ) : (
                <p>
                  System boundaries are preserved. Behavior is extended within
                  the affected components.
                </p>
              )}
              <Link className="text-link" href={`/codebase?node=${selected}`}>
                View in codebase
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </Panel>
          <Panel title="Files changed">
            <div className="panel-body">
              <p className="source-note">
                Source links reference Borrow’s illustrative repository.
              </p>
              {c.files.map((file) => (
                <div className="file-row" key={file}>
                  <FileCode size={15} />
                  <ExternalLink
                    href={`${seed.project.repositoryUrl}/blob/${c.commitSha}/${file}`}
                  >
                    <code>{file}</code>
                  </ExternalLink>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Dependency impact">
            <div className="panel-body">
              {edges.slice(0, 5).map((edge) => (
                <div className="dependency-row" key={edge.id}>
                  <div>
                    <Link href={`/codebase?node=${edge.source}`}>
                      {seed.nodes.find((n) => n.id === edge.source)?.name}
                    </Link>
                    <ArrowRight size={13} />
                    <Link href={`/codebase?node=${edge.target}`}>
                      {seed.nodes.find((n) => n.id === edge.target)?.name}
                    </Link>
                  </div>
                  <p>{edge.description}</p>
                  <small>{edge.type}</small>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="detail-context">
          <Panel title="Change context">
            <dl className="context-list">
              <dt>Commit</dt>
              <dd>
                <code>{c.commitSha}</code>
              </dd>
              <dt>Pull request</dt>
              <dd>#{c.pullRequestNumber}</dd>
              <dt>Branch</dt>
              <dd>{c.branch}</dd>
              <dt>Type</dt>
              <dd>{c.type}</dd>
              <dt>Recorded</dt>
              <dd>
                {new Date(c.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </dd>
            </dl>
            <div className="panel-body">
              <ExternalLink
                href={`${seed.project.repositoryUrl}/commit/${c.commitSha}`}
              >
                Open commit
              </ExternalLink>
            </div>
          </Panel>
          <Panel title="Affected components">
            <div className="panel-body">
              <ComponentChips ids={c.componentIds} />
            </div>
          </Panel>
          <Panel title="Related work">
            <div className="panel-body">
              {c.relatedTaskIds.map((id) => {
                const task = tasks.find((t) => t.id === id);
                return (
                  task && (
                    <button
                      className="related-task"
                      key={id}
                      onClick={() => openTask(id)}
                    >
                      <StatusIcon status={task.status} />
                      <span>
                        <code>{id}</code>
                        {task.title}
                      </span>
                      <ArrowUpRight size={13} />
                    </button>
                  )
                );
              })}
              {c.decisionId && (
                <button
                  className="decision-link"
                  onClick={() => setDecisionId(c.decisionId!)}
                >
                  <small>{c.decisionId.toUpperCase()}</small>
                  <strong>
                    {seed.decisions.find((d) => d.id === c.decisionId)?.title}
                  </strong>
                  <ArrowUpRight size={14} />
                </button>
              )}
            </div>
          </Panel>
          <Panel title="Ask about this change">
            <form
              className="panel-body"
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim()) return;
                setAnswer(
                  /why|reason|motivation/i.test(question)
                    ? c.reason
                    : /dependenc|impact|affected/i.test(question)
                      ? `${c.summary} ${edges
                          .slice(0, 3)
                          .map((e) => e.description + ".")
                          .join(" ")}`
                      : c.implementation,
                );
              }}
            >
              <Input
                aria-label="Question about this change"
                placeholder="Why was this changed?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button
                type="submit"
                variant="outline"
                disabled={!question.trim()}
              >
                <Sparkles data-icon="inline-start" />
                Ask AI Agent
              </Button>
              <p className="source-note">
                Prototype response based on recorded context.
              </p>
              {answer && (
                <p className="agent-answer" role="status">
                  {answer}
                </p>
              )}
            </form>
          </Panel>
        </aside>
      </div>
    </>
  );
}
