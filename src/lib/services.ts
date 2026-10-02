import {
  project,
  projects,
  developers,
  milestones,
  decisions,
  notifications,
  overview,
  knowledge,
} from "@/mock/project";
import { changes } from "@/mock/activity";
import { nodes, edges } from "@/mock/components";
import { tasks } from "@/mock/board";
import { flows } from "@/mock/architecture";
import type { Snapshot, Task, Overlap, ArchitectureNode } from "@/types";
import { plannerConfig } from "@/mock/planner";
export const projectService = {
  async getSnapshot(): Promise<Snapshot> {
    return structuredClone({
      project,
      projects,
      developers,
      milestones,
      decisions,
      notifications,
      changes,
      nodes,
      edges,
      tasks,
      flows,
      overview,
      knowledge,
    });
  },
  async getProject() {
    return structuredClone(project);
  },
};
export const activityService = {
  async getChanges() {
    return structuredClone(changes);
  },
};
export const architectureService = {
  async getGraph() {
    return structuredClone({ nodes, edges });
  },
};
export const taskService = {
  async getTasks() {
    return structuredClone(tasks);
  },
};
export function findOverlaps(task: Task, activeTasks: Task[]): Overlap[] {
  return activeTasks
    .filter(
      (t) => t.id !== task.id && ["in-progress", "review"].includes(t.status),
    )
    .flatMap((other) => {
      const componentIds = task.componentIds.filter((id) =>
        other.componentIds.includes(id),
      );
      const sharedResources = task.resources.filter((path) =>
        other.resources.includes(path),
      );
      if (!componentIds.length && !sharedResources.length) return [];
      const contract = plannerConfig.conflicts.find((conflict) => {
        if (!componentIds.includes(conflict.componentId)) return false;
        const first = new RegExp(conflict.firstPattern, "i");
        const second = new RegExp(conflict.secondPattern, "i");
        return (
          (task.assumptions.some((a) => first.test(a)) &&
            other.assumptions.some((a) => second.test(a))) ||
          (task.assumptions.some((a) => second.test(a)) &&
            other.assumptions.some((a) => first.test(a)))
        );
      });
      return [
        {
          task: other,
          componentIds,
          sharedResources,
          level: contract
            ? "contract"
            : sharedResources.length
              ? "files"
              : "component",
          explanation: contract
            ? contract.explanation
            : sharedResources.length
              ? "Both tasks modify the same file. Coordinate the implementation order and review the shared contract."
              : "These tasks touch the same component. Check whether their interface and behavior assumptions agree.",
        },
      ];
    });
}
export const agentService = {
  async planTask(request: string, graph: ArchitectureNode[]): Promise<Task> {
    const rule = plannerConfig.rules.find((r) =>
      new RegExp(r.match, "i").test(request),
    );
    const identified = graph
      .filter(
        (n) =>
          n.type !== "system" &&
          request.toLowerCase().includes(n.name.toLowerCase()),
      )
      .map((n) => n.id);
    const componentIds = Array.from(
      new Set([...(rule?.components ?? []), ...identified]),
    );
    return {
      id: "draft",
      title:
        rule?.title ??
        request
          .trim()
          .replace(/[.!?]+$/g, "")
          .slice(0, 90),
      description: request.trim(),
      status: "ready",
      assigneeId: "mason",
      labels: rule?.labels ?? ["Feature"],
      componentIds,
      relatedChangeIds: [],
      milestoneId: "beta",
      acceptanceCriteria: rule?.criteria ?? [
        "Deliver the requested outcome described above",
        "Verify the changed behavior and record the results",
        "Update affected component knowledge and decisions",
      ],
      assumptions: rule?.assumptions ?? [],
      resources: componentIds
        .map((id) => graph.find((n) => n.id === id)?.path)
        .filter((p): p is string => !!p),
      agentCreated: true,
    };
  },
};
