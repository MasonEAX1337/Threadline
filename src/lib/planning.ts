import type { ArchitectureNode, Overlap, Task } from "@/types";
import { planner } from "@/mock/planner";

export function planTask(request: string, nodes: ArchitectureNode[]): Task {
  const description = request.trim();
  const rule = planner.rules.find((rule) =>
    new RegExp(rule.match, "i").test(description),
  );
  const named = nodes
    .filter(
      (node) =>
        node.type !== "system" &&
        description.toLowerCase().includes(node.name.toLowerCase()),
    )
    .map((node) => node.id);
  const componentIds = [...new Set([...(rule?.components ?? []), ...named])];
  return {
    id: "draft",
    title: rule?.title ?? description.replace(/[.!?]+$/, "").slice(0, 90),
    description,
    status: "ready",
    assigneeId: "mason",
    milestoneId: "beta",
    agentCreated: true,
    labels: [...(rule?.labels ?? ["Feature"])],
    componentIds,
    relatedChangeIds: [],
    acceptanceCriteria: [
      ...(rule?.criteria ?? [
        "Deliver the requested outcome described above.",
        "Verify the changed behavior and record the results.",
        "Update affected component knowledge and decisions.",
      ]),
    ],
    assumptions: [...(rule?.assumptions ?? [])],
    resources: [
      ...new Set(
        componentIds
          .map((id) => nodes.find((n) => n.id === id)?.path)
          .filter((path): path is string => Boolean(path)),
      ),
    ],
  };
}

export function findOverlaps(candidate: Task, tasks: Task[]): Overlap[] {
  return tasks
    .filter(
      (task) =>
        task.id !== candidate.id &&
        ["in-progress", "review"].includes(task.status),
    )
    .flatMap((task) => {
      const componentIds = candidate.componentIds.filter((id) =>
        task.componentIds.includes(id),
      );
      const sharedResources = candidate.resources.filter((path) =>
        task.resources.includes(path),
      );
      if (!componentIds.length && !sharedResources.length) return [];
      const first = candidate.assumptions.join("\n"),
        second = task.assumptions.join("\n");
      const conflict = planner.conflicts.find(
        (conflict) =>
          componentIds.includes(conflict.componentId) &&
          ((new RegExp(conflict.firstPattern, "i").test(first) &&
            new RegExp(conflict.secondPattern, "i").test(second)) ||
            (new RegExp(conflict.secondPattern, "i").test(first) &&
              new RegExp(conflict.firstPattern, "i").test(second))),
      );
      return [
        {
          task,
          componentIds,
          sharedResources,
          level: conflict
            ? "contract"
            : sharedResources.length
              ? "files"
              : "component",
          explanation:
            conflict?.explanation ??
            (sharedResources.length
              ? "Both tasks modify the same file. Coordinate the implementation order and review the shared contract."
              : "These tasks touch the same component. Check whether their interface and behavior assumptions agree."),
        } satisfies Overlap,
      ];
    })
    .sort(
      (a, b) =>
        ({ contract: 0, files: 1, component: 2 })[a.level] -
        { contract: 0, files: 1, component: 2 }[b.level],
    );
}

export function overlapPairs(
  tasks: Task[],
): { first: Task; overlap: Overlap }[] {
  const seen = new Set<string>();
  return tasks
    .filter((task) => task.status === "in-progress")
    .flatMap((first) =>
      findOverlaps(first, tasks).flatMap((overlap) => {
        const key = [first.id, overlap.task.id].sort().join("|");
        if (seen.has(key)) return [];
        seen.add(key);
        return [{ first, overlap }];
      }),
    )
    .sort(
      (a, b) =>
        Number(b.overlap.level === "contract") -
        Number(a.overlap.level === "contract"),
    );
}

export function nextTaskId(tasks: Task[]): string {
  return `BRW-${Math.max(49, ...tasks.map((task) => Number(/^BRW-(\d+)$/.exec(task.id)?.[1] ?? 0))) + 1}`;
}
