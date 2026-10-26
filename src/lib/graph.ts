import type { ArchitectureNode, NodeType } from "@/types";
export type Depth = "architecture" | "modules" | "implementation";
export const defaultTypes: NodeType[] = [
  "system",
  "module",
  "service",
  "class",
  "database",
  "external-service",
  "queue",
  "api",
];
export const typeLabels: Record<NodeType, string> = {
  system: "Systems",
  module: "Modules",
  service: "Services",
  class: "Classes",
  function: "Functions",
  database: "Data stores",
  "external-service": "External",
  queue: "Queues",
  api: "APIs",
};
export function nodeDepth(node: ArchitectureNode): Depth {
  return node.type === "system"
    ? "architecture"
    : node.type === "module"
      ? "modules"
      : "implementation";
}
export function isDescendant(
  node: ArchitectureNode,
  scope: string,
  nodes: ArchitectureNode[],
): boolean {
  const seen = new Set<string>();
  let parent = node.parentId;
  while (parent && !seen.has(parent)) {
    if (parent === scope) return true;
    seen.add(parent);
    parent = nodes.find((n) => n.id === parent)?.parentId;
  }
  return node.systemId === scope;
}
export function visibleNodes(
  nodes: ArchitectureNode[],
  depth: Depth,
  scope: string | null,
  types: NodeType[],
) {
  return nodes.filter(
    (n) =>
      types.includes(n.type) &&
      nodeDepth(n) === depth &&
      (!scope || isDescendant(n, scope, nodes)),
  );
}
export function nodePosition(
  node: ArchitectureNode,
  index: number,
  depth: Depth,
) {
  if (depth === "architecture") {
    const positions: Record<string, [number, number]> = {
      items: [0, 0],
      borrowing: [285, 0],
      returns: [570, 0],
      history: [0, 190],
      messages: [285, 190],
      waitlists: [570, 190],
      photos: [0, 380],
      members: [285, 380],
    };
    const p = positions[node.id];
    if (p) return { x: p[0], y: p[1] };
  }
  return { x: (index % 3) * 285, y: Math.floor(index / 3) * 170 };
}
