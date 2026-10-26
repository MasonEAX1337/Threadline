import type { Snapshot, Task } from "@/types";
export const STORAGE_KEY = "codebase:borrow:v1";
export const SESSION_KEY = "codebase:session";
export const SETTINGS_KEY = "codebase:settings";
export interface LiveProject {
  tasks: Task[];
  selectedProject: string;
  dismissedNotificationIds: string[];
  compact: boolean;
}
export function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function safeWrite(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Storage may be unavailable; in-memory interactions still work. */
  }
}
export function initialProject(seed: Snapshot): LiveProject {
  return {
    tasks: structuredClone(seed.tasks),
    selectedProject: "borrow",
    dismissedNotificationIds: [],
    compact: false,
  };
}
export function isSavedTask(value: unknown, seed: Snapshot): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  const strings = [
    "id",
    "title",
    "description",
    "status",
    "assigneeId",
    "milestoneId",
  ];
  const arrays = [
    "componentIds",
    "resources",
    "acceptanceCriteria",
    "assumptions",
    "labels",
    "relatedChangeIds",
  ];
  return (
    strings.every((key) => typeof task[key] === "string") &&
    typeof task.id === "string" &&
    /^BRW-\d+$/.test(task.id) &&
    typeof task.title === "string" &&
    task.title.trim().length > 0 &&
    arrays.every(
      (key) =>
        Array.isArray(task[key]) &&
        (task[key] as unknown[]).every((v) => typeof v === "string"),
    ) &&
    ["backlog", "ready", "in-progress", "review", "done"].includes(
      task.status as string,
    ) &&
    seed.developers.some((d) => d.id === task.assigneeId) &&
    seed.milestones.some((m) => m.id === task.milestoneId) &&
    (task.componentIds as string[]).every((id) =>
      seed.nodes.some((n) => n.id === id),
    ) &&
    (task.relatedChangeIds as string[]).every((id) =>
      seed.changes.some((c) => c.id === id),
    ) &&
    (task.dueDate === undefined || typeof task.dueDate === "string") &&
    (task.agentCreated === undefined || typeof task.agentCreated === "boolean")
  );
}
export function restoreProject(
  seed: Snapshot,
  raw: string | null,
): LiveProject {
  const fallback = initialProject(seed);
  if (!raw) return fallback;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return fallback;
    const data = parsed as Partial<LiveProject>;
    return {
      tasks:
        Array.isArray(data.tasks) &&
        data.tasks.every((t) => isSavedTask(t, seed)) &&
        new Set(data.tasks.map((t) => t.id)).size === data.tasks.length
          ? data.tasks
          : fallback.tasks,
      selectedProject: seed.projects.some((p) => p.id === data.selectedProject)
        ? data.selectedProject!
        : "borrow",
      dismissedNotificationIds: Array.isArray(data.dismissedNotificationIds)
        ? data.dismissedNotificationIds.filter(
            (id) =>
              typeof id === "string" &&
              seed.notifications.some((n) => n.id === id),
          )
        : [],
      compact: data.compact === true,
    };
  } catch {
    return fallback;
  }
}
