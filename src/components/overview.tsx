"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckSquare2,
  Bell,
  Handshake,
  ListOrdered,
  RotateCcw,
  GitBranch,
  Link2,
  Sparkles,
  Users,
} from "lucide-react";
import { Github } from "./icons";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { findOverlaps } from "@/lib/services";
import { useProject } from "./project-context";
import {
  Avatar,
  ComponentChips,
  SectionHeader,
  Significance,
  Status,
  StatusIcon,
} from "./shared";
export function Overview({
  onDescribe,
  onTask,
  onOverlap,
  onRepository,
}: {
  onDescribe: () => void;
  onTask: (id: string) => void;
  onOverlap: () => void;
  onRepository: () => void;
}) {
  const { data, tasks } = useProject();
  const currentTasks = data.overview.currentTaskIds
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t) => !!t);
  const done = tasks.filter((t) => t.status === "done").length;
  const active = tasks.filter((t) => t.status !== "done").length;
  const firstOverlap = tasks
    .filter((t) => t.status === "in-progress")
    .flatMap((task) =>
      findOverlaps(task, tasks).map((overlap) => ({ task, overlap })),
    )[0];
  const pipelineIcons = {
    items: Box,
    borrowing: CheckSquare2,
    pickup: Handshake,
    returns: RotateCcw,
    waitlists: ListOrdered,
  };
  const steps = data.overview.pipeline.map((step) => ({
    ...step,
    icon: pipelineIcons[step.icon],
  }));
  const progress = Math.round((done / tasks.length) * 100);
  return (
    <div className="page-content overview-page">
      <div className="page-heading">
        <div>
          <div className="title-with-status">
            <h1>{data.project.name}</h1>
            <span>
              <i className="green-dot" />
              Active
            </span>
          </div>
          <p>{data.project.description}</p>
        </div>
        <div className="heading-actions">
          <Button variant="outline" size="lg" onClick={onRepository}>
            <Github data-icon="inline-start" />
            View repository
            <ArrowUpRight data-icon="inline-end" />
          </Button>
          <Button size="lg" onClick={onDescribe}>
            <Sparkles data-icon="inline-start" />
            Describe work
          </Button>
        </div>
      </div>
      <section className="snapshot" aria-label="Project snapshot">
        {[
          { icon: Users, value: data.developers.length, label: "Contributors" },
          { icon: Box, value: data.nodes.length, label: "Components" },
          { icon: CheckSquare2, value: active, label: "Active tasks" },
          {
            icon: GitBranch,
            value: data.changes.length,
            label: "Changes this week",
          },
        ].map((m) => (
          <div className="snapshot-item" key={m.label}>
            <m.icon />
            <div>
              <strong>{m.value}</strong>
              <span>{m.label}</span>
            </div>
          </div>
        ))}
      </section>
      <div className="overview-grid">
        <section className="panel important-changes">
          <SectionHeader title="Recent important changes" href="/activity" />
          <div className="change-list">
            {data.changes.slice(0, 3).map((change, i) => {
              const user = data.developers.find(
                (u) => u.id === change.authorId,
              );
              const Icon =
                i === 0 ? CheckSquare2 : i === 1 ? ListOrdered : Bell;
              return (
                <article className="overview-change" key={change.id}>
                  <span
                    className={`change-icon ${i === 0 ? "peach" : i === 1 ? "blue" : "green"}`}
                  >
                    <Icon />
                  </span>
                  <div className="change-content">
                    {i === 0 && <Significance value={change.significance} />}
                    <Link
                      className="change-title"
                      href={`/activity/${change.id}`}
                    >
                      {change.title}
                    </Link>
                    <div className="change-meta">
                      by {user?.name}
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
                    <ArrowRight />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
        <section className="panel sprint-panel">
          <SectionHeader title="This sprint">
            <Link href="/board" className="sprint-label">
              <span>
                Sprint 06 <Chevron />
              </span>
              <small>Sep 28 – Oct 11</small>
            </Link>
          </SectionHeader>
          <div className="sprint-progress">
            <div className="progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>
            <strong>{progress}%</strong>
          </div>
          <div className="sprint-tasks">
            {currentTasks.map((task) => (
              <button
                className="sprint-task"
                key={task.id}
                onClick={() => onTask(task.id)}
              >
                <StatusIcon status={task.status} />
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.description}</small>
                </div>
                <Status status={task.status} />
                <ArrowRight />
              </button>
            ))}
          </div>
          <div className="sprint-stats">
            <div>
              <i className="green-dot" />
              <strong>{done}</strong>
              <span>completed</span>
            </div>
            <div>
              <i className="blue-dot" />
              <strong>
                {tasks.filter((t) => t.status === "in-progress").length}
              </strong>
              <span>in progress</span>
            </div>
            <div>
              <i className="gray-dot" />
              <strong>
                {
                  tasks.filter(
                    (t) => t.status === "backlog" || t.status === "ready",
                  ).length
                }
              </strong>
              <span>remaining</span>
            </div>
          </div>
          <Link className="sprint-footer text-link" href="/board">
            Open sprint board
            <ArrowRight />
          </Link>
        </section>
        <section className="panel architecture-preview">
          <SectionHeader
            title="How borrowing works"
            href="/architecture"
            label="View architecture"
          />
          <p className="panel-subtitle">{data.overview.pipelineDescription}</p>
          <div className="pipeline-preview">
            {steps.map((step, i) => (
              <div className="pipeline-item" key={step.name}>
                <Link
                  href={`/codebase?node=${step.id}`}
                  className="pipeline-node"
                >
                  <step.icon />
                  <strong>{step.name}</strong>
                  <span>{step.line1}</span>
                  <code>{step.line2}</code>
                </Link>
                {i < steps.length - 1 && (
                  <ArrowRight className="pipeline-arrow" />
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="panel team-activity">
          <SectionHeader title="Team activity" href="/team" />
          {data.overview.teamActivity.map((item) => {
            const change = data.changes.find((c) => c.id === item.changeId)!;
            const user = data.developers.find((u) => u.id === change.authorId);
            return (
              <Link
                key={change.id}
                href={`/activity/${change.id}`}
                className="team-activity-row"
              >
                <Avatar user={user} />
                <div>
                  <p>
                    <strong>{user?.name}</strong> {item.action}
                  </p>
                  <code>{item.detail}</code>
                </div>
                <small>{item.time}</small>
              </Link>
            );
          })}
        </section>
      </div>
      {firstOverlap && (
        <Alert className="coordination-banner">
          <Link2 />
          <AlertTitle>One overlap worth a look</AlertTitle>
          <AlertDescription>
            {firstOverlap.task.title} and{" "}
            {firstOverlap.overlap.task.title.toLowerCase()} both touch{" "}
            {data.nodes.find(
              (n) => n.id === firstOverlap.overlap.componentIds[0],
            )?.name ?? "shared source files"}
            .
          </AlertDescription>
          <button className="text-link" onClick={onOverlap}>
            Review overlap
            <ArrowRight />
          </button>
        </Alert>
      )}
    </div>
  );
}
function Chevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}
