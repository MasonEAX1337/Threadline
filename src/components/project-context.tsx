"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Snapshot, Task, TaskStatus } from "@/types";
import { toast } from "sonner";
interface ProjectContextValue {
  data: Snapshot;
  tasks: Task[];
  hydrated: boolean;
  addTask: (task: Task, start: boolean) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  selectedProject: string;
  selectProject: (id: string) => void;
  dismissed: string[];
  dismissNotification: (id: string) => void;
  compact: boolean;
  setCompact: (value: boolean) => void;
  reset: () => void;
}
const ProjectContext = createContext<ProjectContextValue | null>(null);
export function ProjectProvider({
  snapshot,
  children,
}: {
  snapshot: Snapshot;
  children: ReactNode;
}) {
  const storageKey = `codebase:${snapshot.project.id}:v1`;
  const [tasks, setTasks] = useState(snapshot.tasks);
  const [selectedProject, selectProject] = useState(snapshot.project.id);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [compact, setCompact] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (
          Array.isArray(s.tasks) &&
          s.tasks.every(
            (t: Task) =>
              typeof t.id === "string" &&
              typeof t.title === "string" &&
              Array.isArray(t.componentIds) &&
              Array.isArray(t.resources) &&
              Array.isArray(t.acceptanceCriteria) &&
              Array.isArray(t.assumptions),
          )
        )
          setTasks(s.tasks);
        if (snapshot.projects.some((p) => p.id === s.selectedProject))
          selectProject(s.selectedProject);
        if (Array.isArray(s.dismissed)) setDismissed(s.dismissed);
        setCompact(!!s.compact);
      }
    } catch {
      /* Fall back to the intact sample when storage is unavailable. */
    }
    setHydrated(true);
  }, [snapshot, storageKey]);
  useEffect(() => {
    if (hydrated)
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ tasks, selectedProject, dismissed, compact }),
        );
      } catch {
        /* UI remains functional when browser persistence is disabled. */
      }
  }, [tasks, selectedProject, dismissed, compact, hydrated, storageKey]);
  const updateTask = useCallback(
    (id: string, patch: Partial<Task>) =>
      setTasks((current) =>
        current.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      ),
    [],
  );
  const addTask = (draft: Task, start: boolean) => {
    const id = `${snapshot.project.taskPrefix}-${Math.max(49, ...tasks.map((t) => Number(t.id.split("-")[1]) || 0)) + 1}`;
    const task = {
      ...draft,
      id,
      status: (start ? "in-progress" : "ready") as TaskStatus,
    };
    setTasks((current) => [task, ...current]);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          tasks: [task, ...tasks],
          selectedProject,
          dismissed,
          compact,
        }),
      );
    } catch {}
    toast.success(
      start ? `${id} created and started` : `${id} added to Ready`,
      { description: task.title },
    );
    return task;
  };
  const reset = () => {
    setTasks(structuredClone(snapshot.tasks));
    selectProject(snapshot.project.id);
    setDismissed([]);
    setCompact(false);
    toast.success("Sample project restored");
  };
  return (
    <ProjectContext.Provider
      value={{
        data: snapshot,
        tasks,
        hydrated,
        addTask,
        updateTask,
        selectedProject,
        selectProject,
        dismissed,
        dismissNotification: (id) =>
          setDismissed((current) => [...current, id]),
        compact,
        setCompact,
        reset,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
export function useProject() {
  const value = useContext(ProjectContext);
  if (!value) throw Error("Missing ProjectProvider");
  return value;
}
