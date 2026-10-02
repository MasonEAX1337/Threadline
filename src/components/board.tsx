"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  GitBranch,
  GripVertical,
  Link2,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "./project-context";
import {
  Avatar,
  ComponentChips,
  EmptyState,
  PageHeader,
  Status,
  StatusIcon,
  statusNames,
} from "./shared";
import { agentService, findOverlaps } from "@/lib/services";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types";
import { toast } from "sonner";
const columns: TaskStatus[] = [
  "backlog",
  "ready",
  "in-progress",
  "review",
  "done",
];
export function BoardPage({
  onDescribe,
  onTask,
  onOverlap,
}: {
  onDescribe: () => void;
  onTask: (id: string) => void;
  onOverlap: () => void;
}) {
  const { data, tasks, updateTask } = useProject();
  const params = useSearchParams();
  const [tab, setTab] = useState(
    params.get("tab") === "milestones" ? "milestones" : "board",
  );
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("all");
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const tabParam = params.get("tab");
  useEffect(() => {
    if (tabParam === "milestones") setTab("milestones");
  }, [tabParam]);
  const filtered = tasks.filter(
    (t) =>
      (owner === "all" || t.assigneeId === owner) &&
      `${t.title} ${t.description} ${t.id} ${t.labels.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const overlapCount = tasks.filter(
    (t) => t.status === "in-progress" && findOverlaps(t, tasks).length > 0,
  ).length;
  return (
    <div className="page-content board-page">
      <PageHeader
        title="Project board"
        description="Intent, implementation, and shared context—in one place."
      >
        <Button size="lg" onClick={onDescribe}>
          <Sparkles data-icon="inline-start" />
          Describe work
        </Button>
      </PageHeader>
      <div className="page-tabs-row">
        <ToggleGroup
          type="single"
          value={tab}
          onValueChange={(v) => v && setTab(v)}
          className="page-tabs"
        >
          <ToggleGroupItem value="board">Board</ToggleGroupItem>
          <ToggleGroupItem value="milestones">Milestones</ToggleGroupItem>
        </ToggleGroup>
        <span className="muted sprint-chip">
          <CalendarDays />
          Sprint 06 <span>Sep 28 – Oct 11</span>
        </span>
      </div>
      {tab === "board" ? (
        <>
          <div className="board-toolbar">
            <label className="search-field">
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks…"
                aria-label="Search tasks"
              />
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              aria-label="Filter tasks by owner"
            >
              <option value="all">All members</option>
              {data.developers.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <span className="toolbar-spacer" />
            <button className="overlap-link" onClick={onOverlap}>
              <Link2 />
              {overlapCount} {overlapCount === 1 ? "task" : "tasks"} with
              overlap
              <ArrowRight />
            </button>
          </div>
          <div className="kanban-board">
            {columns.map((status) => {
              const list = filtered.filter((t) => t.status === status);
              return (
                <section
                  className={cn(
                    "kanban-column",
                    dropTarget === status && "drop-active",
                  )}
                  key={status}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTarget(status);
                  }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain");
                    if (tasks.some((t) => t.id === id)) {
                      updateTask(id, { status });
                      toast.success(`${id} moved to ${statusNames[status]}`);
                    }
                    setDropTarget(null);
                  }}
                >
                  <div className="kanban-column-header">
                    <StatusIcon status={status} />
                    <h2>{statusNames[status]}</h2>
                    <span>{list.length}</span>
                  </div>
                  <div className="kanban-cards">
                    {list.map((task) => {
                      const overlaps =
                        status === "in-progress"
                          ? findOverlaps(task, tasks)
                          : [];
                      return (
                        <button
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", task.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          key={task.id}
                          className="task-card"
                          onClick={() => onTask(task.id)}
                        >
                          <div className="task-card-top">
                            <code>{task.id}</code>
                            <span title="Created by AI Agent">
                              <Sparkles />
                            </span>
                          </div>
                          <strong>{task.title}</strong>
                          <div className="task-card-labels">
                            {task.labels.slice(0, 2).map((label) => (
                              <Badge variant="secondary" key={label}>
                                {label}
                              </Badge>
                            ))}
                          </div>
                          {overlaps.length > 0 && (
                            <div className="task-overlap">
                              <Link2 />
                              {overlaps.some((o) => o.level === "contract")
                                ? "Contract overlap"
                                : "Shared component"}
                            </div>
                          )}
                          <div className="task-card-bottom">
                            <Avatar
                              size="small"
                              user={data.developers.find(
                                (u) => u.id === task.assigneeId,
                              )}
                            />
                            {task.dueDate && (
                              <span>
                                <CalendarDays />
                                {new Date(
                                  task.dueDate + "T12:00:00Z",
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  timeZone: "UTC",
                                })}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {list.length === 0 && (
                      <p className="column-empty">
                        {query || owner !== "all"
                          ? "No matching tasks"
                          : "No tasks yet"}
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
          <p className="board-hint">
            <GripVertical />
            Drag a task between columns, or change its status in task details.
          </p>
        </>
      ) : (
        <div className="milestone-grid">
          {data.milestones.map((m) => {
            const related = tasks.filter((t) => t.milestoneId === m.id);
            const completed = related.filter((t) => t.status === "done").length;
            const percent = related.length
              ? Math.round((completed / related.length) * 100)
              : 0;
            return (
              <section className="panel milestone" key={m.id}>
                <div className="milestone-heading">
                  <span className="change-icon peach">
                    <FlagIcon />
                  </span>
                  <div>
                    <h2>{m.title}</h2>
                    <p>{m.description}</p>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
                <div className="milestone-date">
                  <CalendarDays />
                  Due{" "}
                  {new Date(m.dueDate + "T12:00:00Z").toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", timeZone: "UTC" },
                  )}
                </div>
                <div className="milestone-progress">
                  <div className="progress-track">
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <strong>{percent}%</strong>
                </div>
                <p className="muted">
                  {completed} of {related.length} tasks complete
                </p>
                <h3 className="detail-label">Key deliverables</h3>
                <ul className="deliverables">
                  {m.deliverables.map((d) => (
                    <li key={d.title} className={cn(d.complete && "complete")}>
                      <span>
                        {d.complete ? (
                          <Check />
                        ) : (
                          <span className="empty-circle" />
                        )}
                      </span>
                      {d.title}
                    </li>
                  ))}
                </ul>
                <h3 className="detail-label">Linked tasks</h3>
                {related.slice(0, 4).map((t) => (
                  <button
                    className="related-task"
                    onClick={() => onTask(t.id)}
                    key={t.id}
                  >
                    <StatusIcon status={t.status} />
                    <span>{t.title}</span>
                    <ArrowRight />
                  </button>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V3m0 1c5-3 9 3 14 0v10c-5 3-9-3-14 0" />
    </svg>
  );
}
export function DescribeWork({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (task: Task) => void;
}) {
  const { data, tasks, addTask } = useProject();
  const [request, setRequest] = useState("");
  const [draft, setDraft] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const overlaps = draft
    ? findOverlaps(draft, tasks).sort(
        (a, b) =>
          (a.level === "contract" ? -1 : 1) - (b.level === "contract" ? -1 : 1),
      )
    : [];
  const generate = async () => {
    if (!request.trim()) return;
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setDraft(await agentService.planTask(request, data.nodes));
    } finally {
      setLoading(false);
    }
  };
  const create = (start: boolean) => {
    if (!draft?.title.trim()) return;
    const created = addTask(draft, start);
    onOpenChange(false);
    setDraft(null);
    setRequest("");
    onCreated(created);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="describe-dialog">
        <DialogHeader>
          <DialogTitle className="icon-title">
            <Sparkles />
            Describe work
          </DialogTitle>
          <DialogDescription>
            Describe the outcome. Your agent will turn it into a plan.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="work-request" className="detail-label">
              What should this accomplish?
            </FieldLabel>
            <textarea
              id="work-request"
              value={request}
              onChange={(e) => {
                setRequest(e.target.value);
                setDraft(null);
              }}
              placeholder={`e.g. ${data.overview.workSuggestions[0].request}`}
              rows={3}
            />
            {!draft && (
              <FieldDescription>
                Borrow’s prototype agent drafts scope, acceptance criteria, and
                coordination warnings.
              </FieldDescription>
            )}
          </Field>
        </FieldGroup>
        {!draft ? (
          <>
            <div className="request-suggestions">
              {data.overview.workSuggestions.map((s) => (
                <button key={s.label} onClick={() => setRequest(s.request)}>
                  {s.label}
                  <ArrowRight />
                </button>
              ))}
            </div>
            <div className="dialog-actions">
              <Button onClick={generate} disabled={!request.trim() || loading}>
                {loading ? (
                  <Loader2 data-icon="inline-start" className="spin" />
                ) : (
                  <Sparkles data-icon="inline-start" />
                )}
                {loading ? "Reading project context…" : "Draft task"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="draft-heading">
              <FileText />
              <h3>Proposed task</h3>
              <Badge variant="secondary">Agent draft</Badge>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="draft-title">Title</FieldLabel>
                <input
                  id="draft-title"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Acceptance criteria</FieldLabel>
                <ul className="acceptance-list">
                  {draft.acceptanceCriteria.map((c) => (
                    <li key={c}>
                      <Check />
                      {c}
                    </li>
                  ))}
                </ul>
              </Field>
              <Field>
                <FieldLabel>Scope · affected components</FieldLabel>
                {draft.componentIds.length ? (
                  <ComponentChips ids={draft.componentIds} />
                ) : (
                  <FieldDescription>
                    Scope needs discovery. The agent has not identified a
                    component from this request.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
            {overlaps.slice(0, 1).map((o) => (
              <Alert className="overlap-alert" key={o.task.id}>
                <Link2 />
                <AlertTitle>Potential overlap with {o.task.title}</AlertTitle>
                <AlertDescription>
                  {o.explanation}
                  <span className="overlap-owner">
                    <Avatar
                      size="small"
                      user={data.developers.find(
                        (u) => u.id === o.task.assigneeId,
                      )}
                    />
                    {
                      data.developers.find((u) => u.id === o.task.assigneeId)
                        ?.name
                    }
                    <Status status={o.task.status} />
                  </span>
                </AlertDescription>
              </Alert>
            ))}
            {overlaps.length > 1 && (
              <details className="additional-overlap">
                <summary>
                  {overlaps.length - 1} other active task touches this scope
                </summary>
                {overlaps.slice(1).map((o) => (
                  <p key={o.task.id}>
                    <strong>{o.task.title}</strong> · {o.explanation}
                  </p>
                ))}
              </details>
            )}
            <div className="draft-footer">
              <p>
                Creating a task records the plan. Starting also authorizes
                implementation.
              </p>
              <div>
                <Button
                  variant="outline"
                  disabled={!draft.title.trim()}
                  onClick={() => create(false)}
                >
                  Create task
                </Button>
                <Button
                  disabled={!draft.title.trim()}
                  onClick={() => create(true)}
                >
                  Create &amp; start
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
export function TaskDetails({
  id,
  onOpenChange,
}: {
  id: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, tasks, updateTask } = useProject();
  const task = tasks.find((t) => t.id === id);
  const [note, setNote] = useState("");
  useEffect(() => setNote(""), [id]);
  const overlaps = task ? findOverlaps(task, tasks) : [];
  return (
    <Dialog open={!!task} onOpenChange={onOpenChange}>
      <DialogContent
        className="task-dialog"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onOpenChange(false);
        }}
      >
        {task && (
          <>
            <DialogHeader>
              <div className="task-detail-meta">
                <code>{task.id}</code>
                <Badge variant="secondary">
                  <Sparkles />
                  Agent-created
                </Badge>
              </div>
              <DialogTitle>{task.title}</DialogTitle>
              <DialogDescription>{task.description}</DialogDescription>
            </DialogHeader>
            <div className="task-properties">
              <Field>
                <FieldLabel htmlFor="task-status">Status</FieldLabel>
                <select
                  id="task-status"
                  value={task.status}
                  onChange={(e) =>
                    updateTask(task.id, {
                      status: e.target.value as TaskStatus,
                    })
                  }
                >
                  {columns.map((s) => (
                    <option key={s} value={s}>
                      {statusNames[s]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="task-owner">Owner</FieldLabel>
                <select
                  id="task-owner"
                  value={task.assigneeId}
                  onChange={(e) =>
                    updateTask(task.id, { assigneeId: e.target.value })
                  }
                >
                  {data.developers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="task-milestone">Milestone</FieldLabel>
                <select
                  id="task-milestone"
                  value={task.milestoneId}
                  onChange={(e) =>
                    updateTask(task.id, { milestoneId: e.target.value })
                  }
                >
                  {data.milestones.map((m) => (
                    <option value={m.id} key={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <section>
              <h3 className="detail-label">Acceptance criteria</h3>
              <ul className="acceptance-list">
                {task.acceptanceCriteria.map((c) => (
                  <li key={c}>
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3 className="detail-label">Related components</h3>
              <ComponentChips ids={task.componentIds} />
            </section>
            {task.assumptions.length > 0 && (
              <section>
                <h3 className="detail-label">Implementation assumptions</h3>
                <ul className="plain-list">
                  {task.assumptions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </section>
            )}
            {overlaps.length > 0 && (
              <Alert className="overlap-alert">
                <Link2 />
                <AlertTitle>
                  Coordinate with {overlaps[0].task.title}
                </AlertTitle>
                <AlertDescription>{overlaps[0].explanation}</AlertDescription>
              </Alert>
            )}
            {task.relatedChangeIds.length > 0 && (
              <section>
                <h3 className="detail-label">Related changes</h3>
                {task.relatedChangeIds.map((cid) => {
                  const change = data.changes.find((c) => c.id === cid);
                  return (
                    change && (
                      <Link
                        key={cid}
                        href={`/activity/${cid}`}
                        className="related-task"
                      >
                        <GitBranch />
                        <span>{change.title}</span>
                        <code>#{change.pullRequestNumber}</code>
                        <ArrowRight />
                      </Link>
                    )
                  );
                })}
              </section>
            )}
            <Field>
              <FieldLabel htmlFor="coordination-note">
                Coordination note
              </FieldLabel>
              <div className="coordination-note">
                <input
                  id="coordination-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Record an agreed contract or implementation order…"
                />
                <Button
                  variant="outline"
                  disabled={!note.trim()}
                  onClick={() => {
                    updateTask(task.id, {
                      assumptions: [
                        ...task.assumptions,
                        `Coordination: ${note.trim()}`,
                      ],
                    });
                    setNote("");
                    toast.success("Coordination note saved");
                  }}
                >
                  Save
                </Button>
              </div>
            </Field>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
export function OverlapDialog({
  open,
  onOpenChange,
  onTask,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTask: (id: string) => void;
}) {
  const { data, tasks } = useProject();
  const seen = new Set<string>();
  const pairs = tasks
    .filter((t) => t.status === "in-progress")
    .flatMap((task) =>
      findOverlaps(task, tasks)
        .filter((o) => {
          const key = [task.id, o.task.id].sort().join(":");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((o) => ({ task, overlap: o })),
    );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overlap-dialog">
        <DialogHeader>
          <DialogTitle className="icon-title">
            <Link2 />
            Work overlaps
          </DialogTitle>
          <DialogDescription>
            Shared files, components, and assumptions worth coordinating before
            implementation.
          </DialogDescription>
        </DialogHeader>
        {pairs.length === 0 ? (
          <EmptyState
            title="No active overlaps found"
            description="Warnings appear when active tasks share implementation scope."
          />
        ) : (
          pairs.map(({ task, overlap: o }) => (
            <section className="overlap-pair" key={`${task.id}-${o.task.id}`}>
              <Badge variant="secondary" className="significance important">
                {o.level === "contract"
                  ? "Conflicting assumptions"
                  : o.level === "files"
                    ? "Shared files"
                    : "Shared component"}
              </Badge>
              <div className="overlap-task-pair">
                <button onClick={() => onTask(task.id)}>
                  <code>{task.id}</code>
                  <strong>{task.title}</strong>
                  <Avatar
                    size="small"
                    user={data.developers.find((u) => u.id === task.assigneeId)}
                  />
                </button>
                <Link2 />
                <button onClick={() => onTask(o.task.id)}>
                  <code>{o.task.id}</code>
                  <strong>{o.task.title}</strong>
                  <Avatar
                    size="small"
                    user={data.developers.find(
                      (u) => u.id === o.task.assigneeId,
                    )}
                  />
                </button>
              </div>
              <p>{o.explanation}</p>
              <ComponentChips ids={o.componentIds} />
              {o.sharedResources.length > 0 && (
                <div className="overlap-files">
                  {o.sharedResources.map((p) => (
                    <code key={p}>{p}</code>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
}
