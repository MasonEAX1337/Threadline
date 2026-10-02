"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Box,
  Blocks,
  Braces,
  Code2,
  Database,
  Globe,
  Layers,
  ListFilter,
  Radio,
  Server,
  Workflow,
  Check,
  Circle,
  CircleDashed,
  CircleDot,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { useProject } from "./project-context";
import { cn } from "@/lib/utils";
import type {
  Developer,
  NodeType,
  TaskStatus,
  ChangeSignificance,
} from "@/types";
export const nodeIcons: Record<NodeType, LucideIcon> = {
  system: Layers,
  module: Blocks,
  service: Box,
  class: Braces,
  function: Code2,
  database: Database,
  "external-service": Globe,
  queue: ListFilter,
  api: Radio,
};
export const statusNames: Record<TaskStatus, string> = {
  backlog: "Backlog",
  ready: "Ready",
  "in-progress": "In progress",
  review: "Review",
  done: "Done",
};
export function Avatar({
  user,
  size = "normal",
}: {
  user?: Developer;
  size?: "small" | "normal" | "large";
}) {
  return (
    <span
      aria-label={user?.name}
      title={user?.name}
      className={cn("avatar", user?.color ?? "peach", size)}
    >
      {user?.initials ?? "MB"}
    </span>
  );
}
export function Status({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={cn("status-badge", status)}>
      {statusNames[status]}
    </Badge>
  );
}
export function StatusIcon({ status }: { status: TaskStatus }) {
  const Icon =
    status === "done"
      ? Check
      : status === "in-progress"
        ? CircleDot
        : status === "review"
          ? Clock3
          : status === "backlog"
            ? CircleDashed
            : Circle;
  return <Icon className={cn("status-icon", status)} />;
}
export function Significance({ value }: { value: ChangeSignificance }) {
  return (
    <Badge variant="secondary" className={cn("significance", value)}>
      {value === "architectural" ? "Architectural" : value}
    </Badge>
  );
}
export function ComponentChips({
  ids,
  max = 10,
}: {
  ids: string[];
  max?: number;
}) {
  const { data } = useProject();
  return (
    <div className="component-chips">
      {ids.slice(0, max).map((id) => (
        <Link key={id} href={`/codebase?node=${id}`} className="component-chip">
          {data.nodes.find((n) => n.id === id)?.name ?? id}
        </Link>
      ))}
      {ids.length > max && (
        <span className="component-chip">+{ids.length - max}</span>
      )}
    </div>
  );
}
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function SectionHeader({
  title,
  href,
  label = "View all",
  children,
}: {
  title: string;
  href?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {href ? (
        <Link className="text-link" href={href}>
          {label}
          <ArrowRight />
        </Link>
      ) : (
        children
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Empty className="empty-state">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Box />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action}
    </Empty>
  );
}
export function SourceButton({ path }: { path?: string }) {
  const { data } = useProject();
  return (
    <Button variant="outline" size="sm" asChild>
      <a
        target="_blank"
        rel="noreferrer"
        href={`${data.project.repositoryUrl}/blob/main/${path ?? "README.md"}`}
      >
        <Code2 data-icon="inline-start" />
        View source
        <ArrowUpRight data-icon="inline-end" />
      </a>
    </Button>
  );
}
export const navigation = [
  { href: "/", name: "Overview", icon: Layers },
  { href: "/activity", name: "Activity", icon: Workflow },
  { href: "/codebase", name: "Codebase", icon: Code2 },
  { href: "/architecture", name: "Architecture", icon: Server },
  { href: "/board", name: "Board", icon: Blocks },
  { href: "/team", name: "Team", icon: Globe },
];
