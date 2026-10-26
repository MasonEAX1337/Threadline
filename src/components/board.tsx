"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Search,
  Flag,
  Check,
  CalendarDays,
  TriangleAlert,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/components/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  PageHeading,
  StatusIcon,
  statuses,
  statusLabels,
} from "@/components/shared";
import { findOverlaps } from "@/lib/planning";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
export function Board() {
  const { seed, tasks, updateTask, openTask, setDescribeOpen, setOverlapOpen } =
    useProject();
  const params = useSearchParams();
  const milestones = params.get("tab") === "milestones";
  const [query, setQuery] = useState(""),
    [owner, setOwner] = useState(""),
    [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const overlaps = tasks.filter(
    (t) => t.status === "in-progress" && findOverlaps(t, tasks).length > 0,
  ).length;
  const filtered = tasks.filter(
    (t) =>
      (!owner || t.assigneeId === owner) &&
      `${t.title} ${t.description} ${t.id} ${t.labels.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Project board"
        description="Intent, implementation, and shared context—in one place."
        actions={
          <Button size="lg" onClick={() => setDescribeOpen(true)}>
            <Sparkles data-icon="inline-start" />
            Describe work
          </Button>
        }
      />
      <div className="board-tabs">
        <div className="tabs" role="tablist" aria-label="Board view">
          <Link
            role="tab"
            aria-selected={!milestones}
            className={!milestones ? "selected" : ""}
            href="/board"
          >
            Board
          </Link>
          <Link
            role="tab"
            aria-selected={milestones}
            className={milestones ? "selected" : ""}
            href="/board?tab=milestones"
          >
            Milestones
          </Link>
        </div>
        <span>
          Sprint 06 <span className="muted-text">Sep 28 – Oct 11</span>
        </span>
      </div>
      {milestones ? (
        <div className="milestones">
          {seed.milestones.map((m) => {
            const assigned = tasks.filter((t) => t.milestoneId === m.id),
              done = assigned.filter((t) => t.status === "done").length,
              progress = assigned.length
                ? Math.round((done / assigned.length) * 100)
                : 0;
            return (
              <section className="panel milestone" key={m.id}>
                <div className="milestone-heading">
                  <Flag size={22} />
                  <div>
                    <h2>{m.title}</h2>
                    <p>{m.description}</p>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
                <p className="metadata">
                  <CalendarDays size={14} />
                  Due{" "}
                  {new Date(m.dueDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </p>
                <div className="progress-caption">
                  <span>
                    {done} of {assigned.length} tasks complete
                  </span>
                  <strong>{progress}%</strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <ul className="deliverables">
                  {m.deliverables.map((d) => (
                    <li key={d.title}>
                      <span className={d.complete ? "complete" : ""}>
                        {d.complete && <Check size={12} />}
                      </span>
                      {d.title}
                    </li>
                  ))}
                </ul>
                <div>
                  {assigned.slice(0, 4).map((t) => (
                    <button
                      className="linked-row"
                      key={t.id}
                      onClick={() => openTask(t.id)}
                    >
                      <StatusIcon status={t.status} />
                      <code>{t.id}</code>
                      <span>{t.title}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <>
          <div className="board-toolbar">
            <div className="search-field">
              <Search size={16} />
              <Input
                aria-label="Search tasks"
                placeholder="Search tasks"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter task owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            >
              <option value="">All members</option>
              {seed.developers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              className="overlap-link"
              onClick={() => setOverlapOpen(true)}
            >
              <TriangleAlert size={15} />
              {overlaps} {overlaps === 1 ? "task" : "tasks"} with overlap
            </button>
          </div>
          <div className="kanban">
            {statuses.map((status) => (
              <section
                key={status}
                className={cn(
                  "kanban-column",
                  dropTarget === status && "drop-target",
                )}
                aria-label={`${statusLabels[status]} column`}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(status);
                }}
                onDragLeave={(event) => {
                  if (
                    !event.currentTarget.contains(event.relatedTarget as Node)
                  )
                    setDropTarget(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const id = event.dataTransfer.getData("text/plain");
                  const task = tasks.find((t) => t.id === id);
                  if (task && task.status !== status) {
                    updateTask(id, { status });
                    toast.success(`${id} moved to ${statusLabels[status]}`);
                  }
                  setDropTarget(null);
                }}
              >
                <header>
                  <StatusIcon status={status} />
                  <h2>{statusLabels[status]}</h2>
                  <span>
                    {filtered.filter((t) => t.status === status).length}
                  </span>
                </header>
                <div className="kanban-cards">
                  {filtered
                    .filter((t) => t.status === status)
                    .map((task) => {
                      const overlap = findOverlaps(task, tasks)[0],
                        active = ["in-progress", "review"].includes(
                          task.status,
                        );
                      return (
                        <button
                          className="task-card"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", task.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => setDropTarget(null)}
                          onClick={() => openTask(task.id)}
                          key={task.id}
                          aria-label={`${task.id} ${task.title}`}
                        >
                          <div className="card-id">
                            <code>{task.id}</code>
                            {task.agentCreated && <Sparkles size={13} />}
                          </div>
                          <h3>{task.title}</h3>
                          <div className="chips">
                            {task.labels.slice(0, 2).map((label) => (
                              <Badge key={label} variant="secondary">
                                {label}
                              </Badge>
                            ))}
                          </div>
                          {overlap && active && (
                            <span className="card-overlap">
                              <TriangleAlert size={12} />
                              {overlap.level === "contract"
                                ? "Contract overlap"
                                : "Shared component"}
                            </span>
                          )}
                          <footer>
                            <Avatar
                              person={seed.developers.find(
                                (d) => d.id === task.assigneeId,
                              )!}
                            />
                            {task.dueDate && (
                              <span>
                                <CalendarDays size={12} />
                                {new Date(
                                  task.dueDate + "T12:00:00",
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </footer>
                        </button>
                      );
                    })}
                  {!filtered.some((t) => t.status === status) && (
                    <p className="column-empty">
                      {query || owner ? "No matching tasks" : "No tasks yet"}
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
          <p className="board-hint">
            Drag a task between columns, or change its status in task details.
          </p>
        </>
      )}
    </>
  );
}
