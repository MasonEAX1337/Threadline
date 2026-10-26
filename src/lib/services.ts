import type { ArchitectureNode, Snapshot } from "@/types";
import {
  project,
  projects,
  developers,
  notifications,
  overview,
  knowledge,
} from "@/mock/project";
import { nodes } from "@/mock/components";
import { edges, flows } from "@/mock/architecture";
import { tasks, milestones } from "@/mock/board";
import { changes } from "@/mock/activity";
import { decisions } from "@/mock/decisions";
import { planTask } from "@/lib/planning";

// Repository adapter. Future GitHub/inference providers belong behind this boundary.
const snapshot: Snapshot = {
  project,
  projects,
  developers,
  notifications,
  overview,
  knowledge,
  nodes,
  edges,
  flows,
  tasks,
  milestones,
  changes,
  decisions,
};
const copy = <T>(value: T): T => structuredClone(value);
export const projectService = {
  async getSnapshot(): Promise<Snapshot> {
    return copy(snapshot);
  },
  async getProject() {
    return copy(project);
  },
};
export const activityService = {
  async getChanges() {
    return copy(changes);
  },
};
export const architectureService = {
  async getGraph() {
    return copy({ nodes, edges, flows });
  },
};
export const taskService = {
  async getTasks() {
    return copy(tasks);
  },
};
export const agentService = {
  async planTask(
    request: string,
    graph: ArchitectureNode[] | { nodes: ArchitectureNode[] },
  ) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return planTask(request, Array.isArray(graph) ? graph : graph.nodes);
  },
};
