"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  FileCode2,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useProject } from "./project-context";
import {
  Avatar,
  ComponentChips,
  EmptyState,
  PageHeader,
  Significance,
  StatusIcon,
} from "./shared";
import type { Change } from "@/types";
const filters = [
  "All",
  "Important",
  "Architecture",
  "Features",
  "Fixes",
  "Refactors",
  "Team",
];
export function ActivityPage() {
  const { data } = useProject();
  const params = useSearchParams();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("all");
  const [component, setComponent] = useState(params.get("component") ?? "all");
  const [date, setDate] = useState("week");
  const [branch, setBranch] = useState("all");
  const visible = data.changes.filter((c) => {
    const text =
      `${c.title} ${c.summary} ${c.reason} ${c.componentIds.map((id) => data.nodes.find((n) => n.id === id)?.name).join(" ")}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (branch === "all" || c.branch === branch) &&
      (author === "all" || c.authorId === author) &&
      (component === "all" || c.componentIds.includes(component)) &&
      (date !== "day" || c.timestamp > "2026-09-29T18:40:00Z") &&
      (filter === "All" ||
        filter === "Team" ||
        (filter === "Important" &&
          ["architectural", "important"].includes(c.significance)) ||
        (filter === "Architecture" && c.significance === "architectural") ||
        (filter === "Features" && c.type === "feature") ||
        (filter === "Fixes" && c.type === "fix") ||
        (filter === "Refactors" && c.type === "refactor"))
    );
  });
  return (
    <div className="page-content activity-page">
      <PageHeader
        title="Activity"
        description="What changed, why it changed, and what it means for your system."
      />
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(v) => v && setFilter(v)}
        className="filter-tabs"
      >
        {filters.map((f) => (
          <ToggleGroupItem value={f} key={f}>
            {f}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="activity-toolbar">
        <label className="search-field">
          <Search />
          <input
            placeholder="Search changes…"
            aria-label="Search changes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter changes by author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        >
          <option value="all">All authors</option>
          {data.developers.map((u) => (
            <option value={u.id} key={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter changes by component"
          value={component}
          onChange={(e) => setComponent(e.target.value)}
        >
          <option value="all">All components</option>
          {data.nodes
            .filter((n) => n.type === "system" || n.type === "service")
            .map((n) => (
              <option value={n.id} key={n.id}>
                {n.name}
              </option>
            ))}
        </select>
        <select
          aria-label="Filter changes by date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        >
          <option value="week">This week</option>
          <option value="day">Last 24 hours</option>
        </select>
        <select
          aria-label="Filter changes by branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="all">All branches</option>
          {Array.from(new Set(data.changes.map((c) => c.branch))).map((b) => (
            <option value={b} key={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div className="activity-results-label">
        <span>{visible.length} updates</span>
        <span>Newest first</span>
      </div>
      {visible.length ? (
        visible.map((change) => (
          <ActivityEntry key={change.id} change={change} />
        ))
      ) : (
        <EmptyState
          title="No changes match these filters"
          description="Try another author, component, or search term."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setAuthor("all");
                setComponent("all");
                setFilter("All");
                setDate("week");
                setBranch("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      )}
    </div>
  );
}
function ActivityEntry({ change }: { change: Change }) {
  const { data } = useProject();
  const author = data.developers.find((u) => u.id === change.authorId);
  return (
    <article className="activity-entry">
      <div className="activity-entry-rail">
        <Avatar user={author} />
        <span />
      </div>
      <div className="activity-entry-body">
        <div className="activity-entry-top">
          <Significance value={change.significance} />
          <span>{change.relativeTime}</span>
        </div>
        <Link href={`/activity/${change.id}`} className="activity-entry-title">
          {change.title}
          <ArrowUpRight />
        </Link>
        <div className="change-meta">
          <strong>{author?.name}</strong>
          <span>·</span>
          <GitCommitHorizontal />
          <code>{change.commitSha}</code>
          <span>·</span>
          <GitPullRequest />#{change.pullRequestNumber}
        </div>
        <p className="activity-summary">{change.summary}</p>
        <div className="activity-explanation">
          <div>
            <h3>Why</h3>
            <p>{change.reason}</p>
          </div>
          <div>
            <h3>What changed</h3>
            <p>{change.implementation}</p>
          </div>
        </div>
        {change.architectureAfter && (
          <div className="activity-impact">
            <h3>System impact</h3>
            <FlowText text={change.architectureAfter} />
          </div>
        )}
        <div className="activity-entry-footer">
          <ComponentChips ids={change.componentIds} max={3} />
          <Link className="text-link" href={`/activity/${change.id}`}>
            View change
            <ArrowRight />
          </Link>
        </div>
      </div>
    </article>
  );
}
function FlowText({ text }: { text: string }) {
  return (
    <div className="flow-text">
      {text.split(" → ").map((part, i) => (
        <span key={i}>
          {i > 0 && <ArrowRight />}
          <code>{part}</code>
        </span>
      ))}
    </div>
  );
}
export function ChangeDetail({
  id,
  onTask,
}: {
  id: string;
  onTask: (id: string) => void;
}) {
  const { data, tasks } = useProject();
  const change = data.changes.find((c) => c.id === id);
  const [decision, setDecision] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  if (!change)
    return (
      <div className="page-content">
        <EmptyState
          title="Change not found"
          description="This update isn't in the sample project."
          action={
            <Button asChild>
              <Link href="/activity">Back to activity</Link>
            </Button>
          }
        />
      </div>
    );
  const author = data.developers.find((u) => u.id === change.authorId);
  const impact = data.edges.filter(
    (e) =>
      change.componentIds.includes(e.source) ||
      change.componentIds.includes(e.target),
  );
  const ask = () =>
    setAnswer(
      /why|reason|motivat/i.test(question)
        ? change.reason
        : /depend|impact|affect/i.test(question)
          ? `${change.summary} ${impact
              .slice(0, 3)
              .map((e) => e.description)
              .join(". ")}`
          : change.implementation,
    );
  return (
    <div className="page-content change-detail">
      <Link href="/activity" className="back-link">
        <ArrowLeft />
        All activity
      </Link>
      <div className="change-detail-heading">
        <Significance value={change.significance} />
        <h1>{change.title}</h1>
        <p>{change.summary}</p>
        <div className="change-author">
          <Avatar user={author} />
          <strong>{author?.name}</strong>
          <span>{change.relativeTime}</span>
          <Badge variant="outline">
            <GitBranch />
            main
          </Badge>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel prose-panel">
            <h2>Why this changed</h2>
            <p>{change.reason}</p>
            <h2>What changed</h2>
            <p>{change.implementation}</p>
            <div className="evidence-line">
              <ShieldCheck />
              Rationale recorded in {change.evidence.source}
              <code>{change.evidence.revision}</code>
            </div>
          </section>
          <section className="panel prose-panel">
            <h2>Architecture impact</h2>
            {change.architectureBefore ? (
              <>
                <h3 className="detail-label">Before</h3>
                <FlowText text={change.architectureBefore} />
                <h3 className="detail-label after-label">After</h3>
                <FlowText text={change.architectureAfter!} />
              </>
            ) : (
              <p>
                The existing system boundaries are preserved. This change
                extends behavior within the affected components.
              </p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/codebase?node=${change.componentIds.find((id) => data.nodes.find((n) => n.id === id)?.type === "service") ?? change.componentIds[0]}`}
              >
                <BoxIcon />
                View in codebase
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </section>
          <section className="panel prose-panel">
            <h2>Files changed</h2>
            <ul className="file-list">
              {change.files.map((file) => (
                <li key={file}>
                  <FileCode2 />
                  <code>{file}</code>
                  <a
                    href={`${data.project.repositoryUrl}/blob/${change.commitSha}/${file}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${file} in sample repository`}
                  >
                    <ArrowUpRight />
                  </a>
                </li>
              ))}
            </ul>
            <p className="small muted">
              Source links reference Borrow’s illustrative repository.
            </p>
          </section>
          <section className="panel prose-panel">
            <h2>Dependency impact</h2>
            {impact.slice(0, 5).map((e) => (
              <div className="dependency-row" key={e.id}>
                <Link href={`/codebase?node=${e.source}`}>
                  {data.nodes.find((n) => n.id === e.source)?.name}
                </Link>
                <ArrowRight />
                <Link href={`/codebase?node=${e.target}`}>
                  {data.nodes.find((n) => n.id === e.target)?.name}
                </Link>
                <p>{e.description}</p>
              </div>
            ))}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="panel prose-panel">
            <h2>Change context</h2>
            <dl className="context-list">
              <dt>Commit</dt>
              <dd>
                <GitCommitHorizontal />
                <code>{change.commitSha}</code>
              </dd>
              <dt>Pull request</dt>
              <dd>
                <GitPullRequest />#{change.pullRequestNumber}
              </dd>
              <dt>Branch</dt>
              <dd>
                <GitBranch />
                {change.branch}
              </dd>
              <dt>Type</dt>
              <dd className="capitalize">{change.type}</dd>
              <dt>Recorded</dt>
              <dd>September {new Date(change.timestamp).getUTCDate()}, 2026</dd>
            </dl>
            <Button variant="outline" asChild>
              <a
                href={`${data.project.repositoryUrl}/commit/${change.commitSha}`}
                target="_blank"
                rel="noreferrer"
              >
                Open commit
                <ArrowUpRight data-icon="inline-end" />
              </a>
            </Button>
          </section>
          <section className="panel prose-panel">
            <h2>Affected components</h2>
            <ComponentChips ids={change.componentIds} />
          </section>
          <section className="panel prose-panel">
            <h2>Related work</h2>
            {change.relatedTaskIds.map((tid) => {
              const task = tasks.find((t) => t.id === tid);
              return (
                task && (
                  <button
                    className="related-task"
                    key={tid}
                    onClick={() => onTask(tid)}
                  >
                    <StatusIcon status={task.status} />
                    <span>{task.title}</span>
                    <ArrowRight />
                  </button>
                )
              );
            })}
            {change.decisionId && (
              <button
                className="decision-link"
                onClick={() => setDecision(change.decisionId!)}
              >
                <BookOpen />
                <span>
                  {
                    data.decisions.find((d) => d.id === change.decisionId)
                      ?.title
                  }
                </span>
                <ArrowRight />
              </button>
            )}
          </section>
          <section className="panel prose-panel ask-panel">
            <h2>
              <Sparkles />
              Ask about this change
            </h2>
            <p className="small muted">
              Explore the recorded context with a prototype response.
            </p>
            <label className="sr-only" htmlFor="change-question">
              Question about this change
            </label>
            <input
              id="change-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Why was this introduced?"
              onKeyDown={(e) => e.key === "Enter" && question.trim() && ask()}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!question.trim()}
              onClick={ask}
            >
              Ask AI Agent
              <ArrowRight data-icon="inline-end" />
            </Button>
            {answer && (
              <p className="mock-answer" role="status">
                {answer}
              </p>
            )}
          </section>
        </aside>
      </div>
      <DecisionDialog
        id={decision}
        onOpenChange={(open) => !open && setDecision(null)}
      />
    </div>
  );
}
function BoxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v8" />
    </svg>
  );
}
export function DecisionDialog({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data } = useProject();
  const decision = data.decisions.find((d) => d.id === id);
  return (
    <Dialog open={!!decision} onOpenChange={onOpenChange}>
      <DialogContent className="decision-dialog">
        {decision && (
          <>
            <DialogHeader>
              <div className="task-detail-meta">
                <code>{decision.id.toUpperCase()}</code>
                <Badge variant="secondary">{decision.status}</Badge>
                <span className="muted small">{decision.date}</span>
              </div>
              <DialogTitle>{decision.title}</DialogTitle>
              <DialogDescription>
                Architectural decision recorded alongside implementation.
              </DialogDescription>
            </DialogHeader>
            <section>
              <h3 className="detail-label">Context</h3>
              <p>{decision.context}</p>
            </section>
            <section>
              <h3 className="detail-label">Decision</h3>
              <p>{decision.decision}</p>
            </section>
            <section>
              <h3 className="detail-label">Alternatives considered</h3>
              {decision.alternatives.map((a) => (
                <div className="alternative" key={a.name}>
                  <strong>{a.name}</strong>
                  <p>{a.reason}</p>
                </div>
              ))}
            </section>
            <ComponentChips ids={decision.componentIds} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
