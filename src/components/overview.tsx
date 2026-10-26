"use client";
import { Github } from "@/components/github-icon";
import Link from "next/link";
import {
  Users,
  Layers,
  GitCommitHorizontal,
  Kanban,
  ArrowUpRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ListFilter,
  Bell,
  Box,
  Calendar,
  RotateCcw,
  Handshake,
  TriangleAlert,
} from "lucide-react";
import { useProject } from "@/components/project-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  ComponentChips,
  Panel,
  StatusIcon,
  StatusBadge,
} from "@/components/shared";
import { overlapPairs } from "@/lib/planning";
export function Overview({ openRepository }: { openRepository: () => void }) {
  const { seed, tasks, openTask, setDescribeOpen, setOverlapOpen } =
    useProject();
  const done = tasks.filter((t) => t.status === "done").length,
    progress = Math.round((done / tasks.length) * 100);
  const pairs = overlapPairs(tasks),
    overlap =
      pairs.find((pair) => pair.overlap.level === "contract") ?? pairs[0];
  const icons = {
    items: Box,
    borrowing: Calendar,
    pickup: Handshake,
    returns: RotateCcw,
    waitlists: ListFilter,
  };
  return (
    <>
      <div className="page-heading overview-heading">
        <div>
          <div className="title-line">
            <h1 className="page-title">Borrow</h1>
            <span className="active-label">
              <i />
              Active
            </span>
          </div>
          <p className="page-description">{seed.project.description}</p>
        </div>
        <div className="page-actions">
          <Button variant="outline" size="lg" onClick={openRepository}>
            <Github data-icon="inline-start" />
            View repository
            <ArrowUpRight data-icon="inline-end" />
          </Button>
          <Button size="lg" onClick={() => setDescribeOpen(true)}>
            <Sparkles data-icon="inline-start" />
            Describe work
          </Button>
        </div>
      </div>
      <div className="snapshot-strip">
        {[
          [Users, seed.developers.length, "Contributors"],
          [Layers, seed.nodes.length, "Components"],
          [
            Kanban,
            tasks.filter((t) => t.status !== "done").length,
            "Active tasks",
          ],
          [GitCommitHorizontal, seed.changes.length, "Changes this week"],
        ].map(([Icon, value, label]) => {
          const I = Icon as typeof Users;
          return (
            <div className="snapshot-cell" key={String(label)}>
              <I size={21} aria-hidden />
              <div>
                <strong>{String(value)}</strong>
                <span>{String(label)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="overview-grid">
        <Panel
          title="Recent important changes"
          className="important-panel"
          action={
            <Link className="text-link" href="/activity">
              View all
              <ArrowUpRight size={13} />
            </Link>
          }
        >
          <div className="overview-changes">
            {seed.changes.slice(0, 3).map((change, i) => {
              const author = seed.developers.find(
                (d) => d.id === change.authorId,
              )!;
              const Icon = [ShieldCheck, ListFilter, Bell][i];
              return (
                <article className="overview-change" key={change.id}>
                  <div className={`change-tile tile-${i}`}>
                    <Icon size={19} />
                  </div>
                  <div className="change-main">
                    <div className="row-heading">
                      <Link href={`/activity/${change.id}`}>
                        {change.title}
                      </Link>
                      {i === 0 && <Badge>ARCHITECTURAL</Badge>}
                    </div>
                    <div className="metadata">
                      {author.name}
                      <span>·</span>
                      {change.relativeTime}
                    </div>
                    <p>{change.summary}</p>
                    <ComponentChips ids={change.componentIds.slice(0, 2)} />
                  </div>
                  <Link
                    className="row-arrow"
                    aria-label={`View ${change.title}`}
                    href={`/activity/${change.id}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </Panel>
        <Panel
          title="This sprint"
          className="sprint-panel"
          action={
            <Link href="/board" className="sprint-link">
              Sprint 06 <span>Sep 28 – Oct 11</span>
            </Link>
          }
        >
          <div className="sprint-body">
            <div className="progress-caption">
              <span>Sprint progress</span>
              <strong>{progress}%</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Sprint progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div style={{ width: `${progress}%` }} />
            </div>
            <div className="sprint-tasks">
              {seed.overview.currentTaskIds
                .map((id) => tasks.find((t) => t.id === id))
                .filter((t) => Boolean(t))
                .map(
                  (task) =>
                    task && (
                      <button
                        className="sprint-task"
                        onClick={() => openTask(task.id)}
                        key={task.id}
                      >
                        <StatusIcon status={task.status} />
                        <div>
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                          <StatusBadge status={task.status} />
                        </div>
                        <ArrowUpRight size={14} />
                      </button>
                    ),
                )}
            </div>
            <div className="sprint-stats">
              <span>
                <i className="dot green" />
                {done} completed
              </span>
              <span>
                <i className="dot peach" />
                {tasks.filter((t) => t.status === "in-progress").length} in
                progress
              </span>
              <span>
                <i className="dot muted" />
                {
                  tasks.filter((t) => ["backlog", "ready"].includes(t.status))
                    .length
                }{" "}
                remaining
              </span>
            </div>
          </div>
          <Link href="/board" className="panel-footer">
            Open sprint board
            <ArrowRight size={15} />
          </Link>
        </Panel>
        <Panel
          title="How borrowing works"
          className="pipeline-panel"
          action={
            <Link href="/architecture" className="text-link">
              View architecture
              <ArrowUpRight size={13} />
            </Link>
          }
        >
          <p className="panel-subtitle">{seed.overview.pipelineDescription}</p>
          <div className="pipeline">
            {seed.overview.pipeline.map((step, i) => {
              const Icon = icons[step.icon];
              return (
                <div className="pipeline-step" key={step.name}>
                  <Link href={`/codebase?node=${step.id}`}>
                    <Icon size={18} />
                    <strong>{step.name}</strong>
                    <span>{step.line1}</span>
                    <small>{step.line2}</small>
                  </Link>
                  {i < 4 && <ArrowRight className="pipeline-arrow" size={13} />}
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Team activity" className="team-activity-panel">
          <div className="team-activity">
            {seed.overview.teamActivity.map((item) => {
              const change = seed.changes.find((c) => c.id === item.changeId)!;
              const author = seed.developers.find(
                (d) => d.id === change.authorId,
              )!;
              return (
                <Link href={`/activity/${change.id}`} key={item.changeId}>
                  <Avatar person={author} />
                  <div>
                    <p>
                      <strong>{author.name.split(" ")[0]}</strong> {item.action}
                    </p>
                    <span>{item.detail}</span>
                  </div>
                  <time>{item.time}</time>
                </Link>
              );
            })}
          </div>
        </Panel>
      </div>
      {overlap && (
        <div className="coordination-banner">
          <TriangleAlert size={20} />
          <div>
            <strong>One overlap worth a look</strong>
            <p>
              {overlap.first.id} {overlap.first.title} and{" "}
              {overlap.overlap.task.id} {overlap.overlap.task.title} both touch{" "}
              {seed.nodes.find((n) => n.id === overlap.overlap.componentIds[0])
                ?.name ?? "the same file"}
              .
            </p>
          </div>
          <Button variant="outline" onClick={() => setOverlapOpen(true)}>
            Review overlap
            <ArrowUpRight data-icon="inline-end" />
          </Button>
        </div>
      )}
    </>
  );
}
