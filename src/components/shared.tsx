"use client";
import Link from "next/link";
import {
  Circle,
  CircleDashed,
  CircleDot,
  CircleCheck,
  CircleEllipsis,
  ArrowUpRight,
  Check,
  Layers,
  Blocks,
  Box,
  Braces,
  Code2,
  Database,
  Globe,
  ListFilter,
  Radio,
  type LucideIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useProject } from "@/components/project-context";
import { cn } from "@/lib/utils";
import type { Developer, NodeType, TaskStatus } from "@/types";
export const statuses: TaskStatus[] = [
  "backlog",
  "ready",
  "in-progress",
  "review",
  "done",
];
export const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  ready: "Ready",
  "in-progress": "In progress",
  review: "Review",
  done: "Done",
};
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
export function StatusIcon({ status }: { status: TaskStatus }) {
  const Icon = {
    backlog: CircleDashed,
    ready: Circle,
    "in-progress": CircleDot,
    review: CircleEllipsis,
    done: CircleCheck,
  }[status];
  return (
    <Icon aria-hidden className={`status-icon status-${status}`} size={17} />
  );
}
export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`status-pill status-${status}`}>
      <StatusIcon status={status} />
      {statusLabels[status]}
    </span>
  );
}
export function Avatar({
  person,
  large = false,
  session = false,
}: {
  person: Developer;
  large?: boolean;
  session?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "avatar",
            `avatar-${person.color}`,
            large && "avatar-large",
            session && "avatar-session",
          )}
          role="img"
          aria-label={person.name}
        >
          {person.initials}
        </span>
      </TooltipTrigger>
      <TooltipContent>{person.name}</TooltipContent>
    </Tooltip>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      <header className="panel-header">
        <h2 className="section-title">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
export function ComponentChips({
  ids,
  onNavigate,
}: {
  ids: string[];
  onNavigate?: () => void;
}) {
  const { seed } = useProject();
  return (
    <div className="chips">
      {ids.map((id) => {
        const node = seed.nodes.find((n) => n.id === id);
        return node ? (
          <Link
            className="component-chip"
            key={id}
            href={`/codebase?node=${id}`}
            onClick={onNavigate}
          >
            <Box size={12} aria-hidden />
            {node.name}
          </Link>
        ) : null;
      })}
    </div>
  );
}
export function Criteria({ items }: { items: string[] }) {
  return (
    <ul className="criteria">
      {items.map((item, i) => (
        <li key={`${i}-${item}`}>
          <Check size={15} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
    >
      {children}
      <ArrowUpRight size={13} aria-hidden />
    </a>
  );
}
export function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
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
    <div className="empty-state">
      <Layers size={31} aria-hidden />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function UnknownPage() {
  return (
    <EmptyState
      title="This page isn't in the project"
      description="The address may have changed or the page may not exist. Return to the project overview to continue."
      action={
        <Button asChild variant="outline">
          <Link href="/">Go to overview</Link>
        </Button>
      }
    />
  );
}
export function DecisionDialog() {
  const { seed, decisionId, setDecisionId } = useProject();
  const d = seed.decisions.find((d) => d.id === decisionId);
  return (
    <Modal
      open={Boolean(d)}
      onClose={() => setDecisionId(null)}
      title={d?.title ?? "Decision"}
      description="Architectural decision recorded alongside implementation."
    >
      {d && (
        <>
          <div className="metadata">
            <code>{d.id.toUpperCase()}</code>
            <Badge>{d.status}</Badge>
            <span>{d.date}</span>
          </div>
          <div className="dialog-section">
            <h3>Context</h3>
            <p>{d.context}</p>
          </div>
          <div className="dialog-section">
            <h3>Decision</h3>
            <p>{d.decision}</p>
          </div>
          <div className="dialog-section">
            <h3>Alternatives considered</h3>
            {d.alternatives.map((a) => (
              <div className="alternative" key={a.name}>
                <strong>{a.name}</strong>
                <p>{a.reason}</p>
              </div>
            ))}
          </div>
          <ComponentChips
            ids={d.componentIds}
            onNavigate={() => setDecisionId(null)}
          />
        </>
      )}
    </Modal>
  );
}
