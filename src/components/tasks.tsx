"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Loader2, TriangleAlert, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus, Overlap } from "@/types";
import { agentService } from "@/lib/services";
import { findOverlaps, overlapPairs } from "@/lib/planning";
import { useProject } from "@/components/project-context";
import {
  Modal,
  Avatar,
  ComponentChips,
  Criteria,
  Select,
  statuses,
  statusLabels,
  StatusBadge,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

export function OverlapWarning({ overlap }: { overlap: Overlap }) {
  const { seed, openTask, setOverlapOpen } = useProject();
  const owner = seed.developers.find((d) => d.id === overlap.task.assigneeId)!;
  return (
    <div className="overlap-warning">
      <div className="warning-title">
        <TriangleAlert size={17} />
        <strong>Potential overlap with {overlap.task.title}</strong>
      </div>
      <div className="overlap-owner">
        <Avatar person={owner} />
        <span>{owner.name}</span>
        <StatusBadge status={overlap.task.status} />
      </div>
      <p>{overlap.explanation}</p>
      <ComponentChips ids={overlap.componentIds} />
      <button
        className="text-link"
        onClick={() => {
          setOverlapOpen(false);
          openTask(overlap.task.id);
        }}
      >
        View {overlap.task.id}
        <ArrowUpRight size={13} />
      </button>
    </div>
  );
}
export function DescribeWork() {
  const { seed, tasks, describeOpen, setDescribeOpen, addTask, go } =
    useProject();
  const [request, setRequest] = useState(""),
    [draft, setDraft] = useState<Task | null>(null),
    [loading, setLoading] = useState(false);
  const version = useRef(0);
  function edit(value: string) {
    version.current++;
    setRequest(value);
    setDraft(null);
    setLoading(false);
  }
  function close() {
    version.current++;
    setDescribeOpen(false);
    setRequest("");
    setDraft(null);
    setLoading(false);
  }
  async function generate() {
    const token = ++version.current;
    setLoading(true);
    const task = await agentService.planTask(request, seed.nodes);
    if (version.current === token) {
      setDraft(task);
      setLoading(false);
    }
  }
  function create(start: boolean) {
    if (!draft?.title.trim()) return;
    const task = addTask({
      ...draft,
      title: draft.title.trim(),
      status: start ? "in-progress" : "ready",
    });
    close();
    go(`/board?task=${task.id}`);
    toast.success(
      start
        ? `${task.id} created · Implementation intent recorded`
        : `${task.id} created and ready`,
      {
        description: start
          ? "Starting is simulated. No agent has run or written code."
          : "Your plan is saved in this browser.",
      },
    );
  }
  const overlaps = draft ? findOverlaps(draft, tasks) : [];
  return (
    <Modal
      open={describeOpen}
      onClose={close}
      title={
        <span className="icon-title">
          <Sparkles />
          Describe work
        </span>
      }
      description="Describe the outcome. Your agent will turn it into a plan."
      className="describe-dialog"
    >
      <Field>
        <FieldLabel htmlFor="request">What should this accomplish?</FieldLabel>
        <Textarea
          id="request"
          rows={3}
          value={request}
          onChange={(e) => edit(e.target.value)}
          placeholder={seed.overview.workSuggestions[0].request}
        />
        <FieldDescription>
          Borrow’s prototype agent drafts scope, acceptance criteria, and
          coordination warnings.
        </FieldDescription>
      </Field>
      <div className="suggestions">
        {seed.overview.workSuggestions.map((s) => (
          <Button
            key={s.label}
            variant="outline"
            size="sm"
            onClick={() => edit(s.request)}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <Button onClick={generate} disabled={!request.trim() || loading}>
        {loading ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Sparkles data-icon="inline-start" />
        )}
        {loading ? "Reading project context…" : "Draft task"}
      </Button>
      {draft && (
        <>
          <div className="draft-heading">
            <h3>Proposed task</h3>
            <Badge>
              <Sparkles />
              Agent draft
            </Badge>
          </div>
          <Field>
            <FieldLabel htmlFor="draft-title">Title</FieldLabel>
            <Input
              id="draft-title"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <div className="dialog-section">
            <h3>Acceptance criteria</h3>
            <Criteria items={draft.acceptanceCriteria} />
          </div>
          <div className="dialog-section">
            <h3>Scope · affected components</h3>
            {draft.componentIds.length ? (
              <ComponentChips ids={draft.componentIds} />
            ) : (
              <p>
                Scope needs discovery. The agent has not identified a component
                from this request.
              </p>
            )}
          </div>
          {overlaps[0] && <OverlapWarning overlap={overlaps[0]} />}{" "}
          {overlaps.length > 1 && (
            <details>
              <summary>
                {overlaps.length - 1} additional overlap
                {overlaps.length > 2 ? "s" : ""}
              </summary>
              <div className="stack">
                {overlaps.slice(1).map((o) => (
                  <OverlapWarning key={o.task.id} overlap={o} />
                ))}
              </div>
            </details>
          )}
          <footer className="draft-footer">
            <p>
              Creating a task records the plan. Starting also authorizes
              implementation.
            </p>
            <div>
              <Button
                variant="outline"
                onClick={() => create(false)}
                disabled={!draft.title.trim()}
              >
                Create task
              </Button>
              <Button
                onClick={() => create(true)}
                disabled={!draft.title.trim()}
              >
                <Sparkles data-icon="inline-start" />
                Create &amp; start
              </Button>
            </div>
          </footer>
        </>
      )}
    </Modal>
  );
}
export function TaskDialog() {
  const params = useSearchParams(),
    { tasks, closeTask } = useProject();
  const id = params.get("task");
  const task = tasks.find((t) => t.id === id);
  return (
    <Modal
      open={Boolean(id)}
      onClose={closeTask}
      title={task?.title ?? "Task not found"}
      description={
        task?.description ?? "This task is not in the current project."
      }
    >
      {task && <TaskContents key={task.id} task={task} />}
    </Modal>
  );
}
function TaskContents({ task }: { task: Task }) {
  const { seed, tasks, updateTask, closeTask } = useProject();
  const [note, setNote] = useState("");
  const overlap = findOverlaps(task, tasks)[0];
  return (
    <>
      <div className="metadata">
        <code>{task.id}</code>
        {task.agentCreated && (
          <Badge>
            <Sparkles />
            Agent-created
          </Badge>
        )}
      </div>
      <div className="task-properties">
        <Select
          label="Status"
          value={task.status}
          onChange={(status) =>
            updateTask(task.id, { status: status as TaskStatus })
          }
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </Select>
        <Select
          label="Owner"
          value={task.assigneeId}
          onChange={(assigneeId) => updateTask(task.id, { assigneeId })}
        >
          {seed.developers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select
          label="Milestone"
          value={task.milestoneId}
          onChange={(milestoneId) => updateTask(task.id, { milestoneId })}
        >
          {seed.milestones.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </Select>
      </div>
      <div className="dialog-section">
        <h3>Acceptance criteria</h3>
        <Criteria items={task.acceptanceCriteria} />
      </div>
      <div className="dialog-section">
        <h3>Related components</h3>
        <ComponentChips ids={task.componentIds} onNavigate={closeTask} />
      </div>
      {task.assumptions.length > 0 && (
        <div className="dialog-section">
          <h3>Implementation assumptions</h3>
          <ul className="assumptions">
            {task.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {overlap && <OverlapWarning overlap={overlap} />}{" "}
      {task.relatedChangeIds.length > 0 && (
        <div className="dialog-section">
          <h3>Related changes</h3>
          {task.relatedChangeIds.map((id) => {
            const c = seed.changes.find((c) => c.id === id);
            return (
              c && (
                <Link
                  className="linked-row"
                  key={id}
                  href={`/activity/${id}`}
                  onClick={closeTask}
                >
                  {c.title}
                  <span>
                    PR #{c.pullRequestNumber}
                    <ArrowUpRight size={13} />
                  </span>
                </Link>
              )
            );
          })}
        </div>
      )}
      <form
        className="note-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          updateTask(task.id, {
            assumptions: [...task.assumptions, `Coordination: ${note.trim()}`],
          });
          setNote("");
          toast.success("Coordination note saved");
        }}
      >
        <Field>
          <FieldLabel htmlFor="coordination-note">Coordination note</FieldLabel>
          <div className="input-row">
            <Input
              id="coordination-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record an agreed contract or implementation order…"
            />
            <Button type="submit" variant="outline" disabled={!note.trim()}>
              Save
            </Button>
          </div>
        </Field>
      </form>
    </>
  );
}
export function OverlapDialog() {
  const { tasks, seed, overlapOpen, setOverlapOpen, openTask } = useProject();
  const pairs = overlapPairs(tasks);
  return (
    <Modal
      open={overlapOpen}
      onClose={() => setOverlapOpen(false)}
      title="Work overlaps"
      description="Shared files, components, and assumptions worth coordinating before implementation."
    >
      {pairs.length === 0 ? (
        <div className="empty-state">
          <h3>No active overlaps found</h3>
          <p>
            Active tasks have no shared files, components, or conflicting
            assumptions to coordinate.
          </p>
        </div>
      ) : (
        pairs.map(({ first, overlap }) => (
          <div
            className="overlap-pair"
            key={[first.id, overlap.task.id].sort().join("-")}
          >
            <Badge>
              {overlap.level === "contract"
                ? "Conflicting assumptions"
                : overlap.level === "files"
                  ? "Shared files"
                  : "Shared component"}
            </Badge>
            <div className="pair-tasks">
              {[first, overlap.task].map((task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    setOverlapOpen(false);
                    openTask(task.id);
                  }}
                >
                  <Avatar
                    person={seed.developers.find(
                      (d) => d.id === task.assigneeId,
                    )!}
                  />
                  <span>
                    <code>{task.id}</code>
                    <strong>{task.title}</strong>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>
            <p>{overlap.explanation}</p>
            <ComponentChips
              ids={overlap.componentIds}
              onNavigate={() => setOverlapOpen(false)}
            />
            {overlap.sharedResources.map((path) => (
              <code className="path-line" key={path}>
                {path}
              </code>
            ))}
          </div>
        ))
      )}
    </Modal>
  );
}
