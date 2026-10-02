import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "../.project");
const read = async (name) =>
  JSON.parse(await readFile(path.join(root, name), "utf8"));
const records = async (name) =>
  Promise.all(
    (await readdir(path.join(root, name)))
      .filter((f) => f.endsWith(".json"))
      .map((f) => read(`${name}/${f}`)),
  );
const [
  nodes,
  tasks,
  changes,
  decisions,
  developers,
  milestones,
  architecture,
  manifest,
] = await Promise.all([
  records("components"),
  records("tasks"),
  records("changes"),
  records("decisions"),
  read("developers.json"),
  read("milestones.json"),
  read("architecture.json"),
  read("manifest.json"),
]);
const errors = [];
const check = (value, message) => {
  if (!value) errors.push(message);
};
const ids = (list) => new Set(list.map((r) => r.id));
const nodeIds = ids(nodes),
  taskIds = ids(tasks),
  changeIds = ids(changes),
  decisionIds = ids(decisions),
  userIds = ids(developers),
  milestoneIds = ids(milestones);
for (const [name, list] of Object.entries({
  nodes,
  tasks,
  changes,
  decisions,
  developers,
  milestones,
})) {
  check(ids(list).size === list.length, `Duplicate ${name} IDs`);
  for (const r of list)
    check(typeof r.id === "string" && r.id.length > 0, `Missing ${name} ID`);
}
const nodeTypes = [
  "system",
  "module",
  "service",
  "class",
  "function",
  "database",
  "external-service",
  "queue",
  "api",
];
for (const n of nodes) {
  check(nodeTypes.includes(n.type), `Invalid node type: ${n.id}`);
  check(
    typeof n.description === "string" && Array.isArray(n.responsibilities),
    `Incomplete component: ${n.id}`,
  );
  if (n.parentId) check(nodeIds.has(n.parentId), `Missing parent: ${n.id}`);
  if (n.systemId) check(nodeIds.has(n.systemId), `Missing system: ${n.id}`);
  if (n.decisionId)
    check(decisionIds.has(n.decisionId), `Missing decision: ${n.id}`);
  const seen = new Set([n.id]);
  let parent = n.parentId;
  while (parent) {
    check(!seen.has(parent), `Parent cycle: ${n.id}`);
    if (seen.has(parent)) break;
    seen.add(parent);
    parent = nodes.find((r) => r.id === parent)?.parentId;
  }
}
for (const t of tasks) {
  check(
    ["backlog", "ready", "in-progress", "review", "done"].includes(t.status),
    `Invalid task status: ${t.id}`,
  );
  check(
    typeof t.title === "string" && t.title.trim(),
    `Missing task title: ${t.id}`,
  );
  check(userIds.has(t.assigneeId), `Unknown owner: ${t.id}`);
  check(milestoneIds.has(t.milestoneId), `Unknown milestone: ${t.id}`);
  for (const id of t.componentIds)
    check(nodeIds.has(id), `Unknown component ${id}: ${t.id}`);
  for (const id of t.relatedChangeIds)
    check(changeIds.has(id), `Unknown change ${id}: ${t.id}`);
  check(
    Array.isArray(t.acceptanceCriteria) &&
      Array.isArray(t.resources) &&
      Array.isArray(t.assumptions),
    `Missing task plan: ${t.id}`,
  );
}
for (const c of changes) {
  check(userIds.has(c.authorId), `Unknown author: ${c.id}`);
  for (const id of c.componentIds)
    check(nodeIds.has(id), `Unknown component ${id}: ${c.id}`);
  for (const id of c.relatedTaskIds)
    check(taskIds.has(id), `Unknown task ${id}: ${c.id}`);
  check(
    c.evidence?.source && c.evidence?.revision,
    `Missing evidence: ${c.id}`,
  );
  check(
    ["recorded", "inferred", "confirmed"].includes(c.evidence?.status),
    `Invalid evidence status: ${c.id}`,
  );
}
for (const e of architecture.edges)
  check(
    nodeIds.has(e.source) && nodeIds.has(e.target),
    `Invalid edge: ${e.id}`,
  );
for (const f of architecture.flows)
  for (const id of f.nodeIds)
    check(nodeIds.has(id), `Unknown flow component ${id}: ${f.id}`);
check(manifest.schemaVersion === 1, "Unsupported knowledge schema");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Knowledge valid: ${nodes.length} components, ${tasks.length} tasks, ${changes.length} changes, ${architecture.flows.length} flows.`,
);
