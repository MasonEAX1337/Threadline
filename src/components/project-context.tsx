"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition,
  useCallback,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Snapshot, Task } from "@/types";
import {
  initialProject,
  restoreProject,
  safeRead,
  safeWrite,
  STORAGE_KEY,
  SESSION_KEY,
  type LiveProject,
} from "@/lib/storage";
import { nextTaskId } from "@/lib/planning";

type Context = LiveProject & {
  seed: Snapshot;
  hydrated: boolean;
  signedIn: boolean;
  describeOpen: boolean;
  setDescribeOpen: (value: boolean) => void;
  overlapOpen: boolean;
  setOverlapOpen: (value: boolean) => void;
  decisionId: string | null;
  setDecisionId: (id: string | null) => void;
  addTask: (task: Task) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  selectProject: (id: string) => void;
  dismissNotification: (id: string) => void;
  setCompact: (value: boolean) => void;
  reset: () => void;
  signIn: () => void;
  signOut: () => void;
  go: (href: string) => void;
  openTask: (id: string) => void;
  closeTask: () => void;
};
const ProjectContext = createContext<Context | null>(null);
export function ProjectProvider({
  seed,
  children,
}: {
  seed: Snapshot;
  children: React.ReactNode;
}) {
  const [live, setLive] = useState(() => initialProject(seed));
  const current = useRef(live);
  const [hydrated, setHydrated] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [describeOpen, setDescribeOpen] = useState(false);
  const [overlapOpen, setOverlapOpen] = useState(false);
  const [decisionId, setDecisionId] = useState<string | null>(null);
  const router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams();
  useEffect(() => {
    const restored = restoreProject(seed, safeRead(STORAGE_KEY));
    current.current = restored;
    startTransition(() => {
      setLive(restored);
      setSignedIn(safeRead(SESSION_KEY) !== "signed-out");
      setHydrated(true);
    });
    if (safeRead(SESSION_KEY) === null)
      safeWrite(
        SESSION_KEY,
        JSON.stringify({ id: "mason", name: "Mason Brooks", initials: "MB" }),
      );
  }, [seed]);
  const change = useCallback((update: (state: LiveProject) => LiveProject) => {
    const next = update(current.current);
    current.current = next;
    safeWrite(STORAGE_KEY, JSON.stringify(next));
    setLive(next);
  }, []);
  const go = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );
  const value: Context = {
    ...live,
    seed,
    hydrated,
    signedIn,
    describeOpen,
    setDescribeOpen,
    overlapOpen,
    setOverlapOpen,
    decisionId,
    setDecisionId,
    addTask(task) {
      const created = {
        ...structuredClone(task),
        id: nextTaskId(current.current.tasks),
      };
      change((s) => ({ ...s, tasks: [created, ...s.tasks] }));
      return created;
    },
    updateTask(id, patch) {
      change((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, id } : t)),
      }));
    },
    selectProject(id) {
      if (seed.projects.some((p) => p.id === id)) {
        change((s) => ({ ...s, selectedProject: id }));
        go("/");
      }
    },
    dismissNotification(id) {
      change((s) => ({
        ...s,
        dismissedNotificationIds: [
          ...new Set([...s.dismissedNotificationIds, id]),
        ],
      }));
    },
    setCompact(compact) {
      change((s) => ({ ...s, compact }));
    },
    reset() {
      change(() => initialProject(seed));
      go("/settings");
    },
    signIn() {
      safeWrite(
        SESSION_KEY,
        JSON.stringify({ id: "mason", name: "Mason Brooks", initials: "MB" }),
      );
      setSignedIn(true);
      change((s) => ({ ...s, selectedProject: "borrow" }));
      router.replace("/");
    },
    signOut() {
      safeWrite(SESSION_KEY, "signed-out");
      setSignedIn(false);
      setDescribeOpen(false);
      setOverlapOpen(false);
      setDecisionId(null);
      router.replace("/login");
    },
    go,
    openTask(id) {
      const next = new URLSearchParams(params);
      next.set("task", id);
      go(`${pathname}?${next}`);
    },
    closeTask() {
      const next = new URLSearchParams(params);
      next.delete("task");
      router.replace(`${pathname}${next.size ? "?" + next : ""}`, {
        scroll: false,
      });
    },
  };
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("ProjectProvider is required");
  return context;
}
