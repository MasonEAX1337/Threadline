import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const groups = ["components", "tasks", "changes", "decisions"];
export const rootFiles = [
  "project",
  "projects",
  "developers",
  "milestones",
  "notifications",
  "overview",
  "planner",
  "architecture",
  "manifest",
];
export async function readKnowledge(root = path.resolve(".project")) {
  const data = {};
  for (const name of rootFiles) {
    try {
      data[name] = JSON.parse(
        await readFile(path.join(root, `${name}.json`), "utf8"),
      );
    } catch (error) {
      throw new Error(`${name}.json: ${error.message}`);
    }
  }
  data.files = {};
  for (const group of groups) {
    const names = (await readdir(path.join(root, group)))
      .filter((name) => name.endsWith(".json"))
      .sort();
    const records = await Promise.all(
      names.map(async (name) => {
        try {
          return {
            file: `${group}/${name}`,
            value: JSON.parse(
              await readFile(path.join(root, group, name), "utf8"),
            ),
          };
        } catch (error) {
          throw new Error(`${group}/${name}: ${error.message}`);
        }
      }),
    );
    const order = data.manifest.order?.[group] ?? [];
    records.sort((a, b) => {
      const ai = order.indexOf(a.value.id),
        bi = order.indexOf(b.value.id);
      return (
        (ai < 0 ? Infinity : ai) - (bi < 0 ? Infinity : bi) ||
        a.file.localeCompare(b.file, "en")
      );
    });
    data[group] = records.map((record) => record.value);
    data.files[group] = records.map((record) => record.file);
  }
  return data;
}

export function validateKnowledge(data) {
  const errors = [];
  const require = (condition, id, message) => {
    if (!condition) errors.push(`${id}: ${message}`);
  };
  const text = (value) => typeof value === "string" && value.trim().length > 0;
  function shape(record, fields, id) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      errors.push(`${id}: expected an object`);
      return;
    }
    for (const [field, type] of Object.entries(fields)) {
      const value = record[field];
      const valid =
        type === "text"
          ? text(value)
          : type === "texts"
            ? Array.isArray(value) && value.every(text)
            : type === "array"
              ? Array.isArray(value)
              : typeof value === type;
      require(valid, id, `${field} must be ${type}`);
    }
  }
  const schemas = {
    components: {
      id: "text",
      name: "text",
      type: "text",
      description: "text",
      responsibilities: "texts",
    },
    tasks: {
      id: "text",
      title: "text",
      description: "text",
      status: "text",
      assigneeId: "text",
      labels: "texts",
      componentIds: "texts",
      relatedChangeIds: "texts",
      milestoneId: "text",
      acceptanceCriteria: "texts",
      assumptions: "texts",
      resources: "texts",
    },
    changes: {
      id: "text",
      title: "text",
      summary: "text",
      reason: "text",
      implementation: "text",
      type: "text",
      significance: "text",
      authorId: "text",
      timestamp: "text",
      relativeTime: "text",
      commitSha: "text",
      pullRequestNumber: "number",
      branch: "text",
      componentIds: "texts",
      files: "texts",
      relatedTaskIds: "texts",
      evidence: "object",
    },
    decisions: {
      id: "text",
      title: "text",
      date: "text",
      context: "text",
      decision: "text",
      alternatives: "array",
      componentIds: "texts",
      status: "text",
    },
    projects: { id: "text", name: "text", description: "text" },
    developers: {
      id: "text",
      name: "text",
      username: "text",
      role: "text",
      primaryAreas: "texts",
      initials: "text",
      color: "text",
      changes: "number",
      bio: "text",
    },
    milestones: {
      id: "text",
      title: "text",
      description: "text",
      dueDate: "text",
      deliverables: "array",
    },
    notifications: {
      id: "text",
      title: "text",
      description: "text",
      time: "text",
      href: "text",
      type: "text",
    },
  };
  shape(
    data.project,
    {
      id: "text",
      name: "text",
      description: "text",
      repositoryUrl: "text",
      defaultBranch: "text",
      updatedAt: "text",
      componentCount: "number",
      taskPrefix: "text",
    },
    "project",
  );
  shape(
    data.manifest,
    {
      schemaVersion: "number",
      knowledgeRevision: "text",
      recordedAt: "text",
      order: "object",
    },
    "manifest",
  );
  shape(data.architecture, { flows: "array", edges: "array" }, "architecture");
  shape(data.planner, { rules: "array", conflicts: "array" }, "planner");
  shape(
    data.overview,
    {
      currentTaskIds: "texts",
      suggestedComponentIds: "texts",
      pipelineDescription: "text",
      pipeline: "array",
      workSuggestions: "array",
      teamActivity: "array",
    },
    "overview",
  );
  for (const [group, schema] of Object.entries(schemas)) {
    require(Array.isArray(data[group]), group, "expected an array of records");
    const ids = new Set();
    for (const record of data[group] ?? []) {
      shape(record, schema, `${group}/${record?.id ?? "missing ID"}`);
      require(!ids.has(record?.id), group, `duplicate ID ${record?.id}`);
      ids.add(record?.id);
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  const ids = Object.fromEntries(
    Object.keys(schemas).map((group) => [
      group,
      new Set(data[group].map((r) => r.id)),
    ]),
  );
  const ref = (group, id, source) =>
    require(ids[group].has(id), source, `unresolved ${group} reference ${id}`);
  const refs = (group, values, source) =>
    values.forEach((id) => ref(group, id, source));
  const oneOf = (value, values, source, field) =>
    require(values.includes(value), source, `invalid ${field}: ${value}`);
  const date = (value, id, field) =>
    require(Number.isFinite(
      Date.parse(value),
    ), id, `invalid ${field}: ${value}`);
  require(data.manifest.schemaVersion ===
    1, "manifest", "unsupported schemaVersion (expected 1)");
  date(data.manifest.recordedAt, "manifest", "recordedAt");
  date(data.project.updatedAt, "project", "updatedAt");
  require(data.project.componentCount ===
    data.components
      .length, "project", "componentCount must match discovered components");
  for (const group of groups) {
    const order = data.manifest.order[group];
    require(Array.isArray(order) &&
      order.every(text), "manifest", `order.${group} must be a string array`);
    if (Array.isArray(order)) {
      require(new Set(order).size ===
        order.length, "manifest", `duplicate order.${group} entries`);
      refs(group, order, "manifest");
    }
  }
  for (const node of data.components) {
    oneOf(
      node.type,
      [
        "system",
        "module",
        "service",
        "class",
        "function",
        "database",
        "external-service",
        "queue",
        "api",
      ],
      node.id,
      "node type",
    );
    for (const field of ["path", "parentId", "systemId", "decisionId"])
      if (node[field] !== undefined)
        require(text(
          node[field],
        ), node.id, `${field} must be a nonempty string`);
    if (node.guarantees !== undefined)
      shape(node, { guarantees: "texts" }, node.id);
    if (node.decisionId) ref("decisions", node.decisionId, node.id);
    if (node.parentId) ref("components", node.parentId, node.id);
    if (node.type === "system")
      require(!node.parentId &&
        !node.systemId, node.id, "systems must be roots");
    else {
      require(Boolean(
        node.parentId && node.systemId,
      ), node.id, "non-system nodes require parentId and systemId");
      ref("components", node.systemId, node.id);
      require(data.components.find((n) => n.id === node.systemId)?.type ===
        "system", node.id, "systemId must refer to a system");
    }
    const seen = new Set([node.id]);
    let ancestor = node;
    while (ancestor.parentId) {
      if (seen.has(ancestor.parentId)) {
        errors.push(`${node.id}: cyclic parent chain at ${ancestor.parentId}`);
        break;
      }
      seen.add(ancestor.parentId);
      const next = data.components.find((n) => n.id === ancestor.parentId);
      if (!next) break;
      ancestor = next;
    }
    if (node.type !== "system")
      require(ancestor.id ===
        node.systemId, node.id, "parent ancestry disagrees with systemId");
  }
  for (const task of data.tasks) {
    oneOf(
      task.status,
      ["backlog", "ready", "in-progress", "review", "done"],
      task.id,
      "status",
    );
    ref("developers", task.assigneeId, task.id);
    ref("milestones", task.milestoneId, task.id);
    refs("components", task.componentIds, task.id);
    refs("changes", task.relatedChangeIds, task.id);
    if (task.dueDate) date(task.dueDate, task.id, "dueDate");
    if (task.agentCreated !== undefined)
      require(typeof task.agentCreated ===
        "boolean", task.id, "agentCreated must be boolean");
  }
  for (const change of data.changes) {
    oneOf(
      change.type,
      ["feature", "fix", "refactor", "architecture", "maintenance"],
      change.id,
      "type",
    );
    oneOf(
      change.significance,
      ["minor", "normal", "important", "architectural"],
      change.id,
      "significance",
    );
    ref("developers", change.authorId, change.id);
    refs("components", change.componentIds, change.id);
    refs("tasks", change.relatedTaskIds, change.id);
    if (change.decisionId) ref("decisions", change.decisionId, change.id);
    date(change.timestamp, change.id, "timestamp");
    shape(
      change.evidence,
      { source: "text", revision: "text", status: "text" },
      change.id + " evidence",
    );
    oneOf(
      change.evidence?.status,
      ["recorded", "inferred", "confirmed"],
      change.id,
      "evidence status",
    );
    require(change.evidence?.revision ===
      change.commitSha, change.id, "evidence revision must match commitSha");
    require(Number.isInteger(change.pullRequestNumber) &&
      change.pullRequestNumber >
        0, change.id, "pullRequestNumber must be a positive integer");
  }
  for (const decision of data.decisions) {
    refs("components", decision.componentIds, decision.id);
    date(decision.date, decision.id, "date");
    decision.alternatives.forEach((a) =>
      shape(a, { name: "text", reason: "text" }, decision.id + " alternative"),
    );
  }
  const flowIds = new Set(),
    edgeIds = new Set();
  for (const flow of data.architecture.flows) {
    shape(
      flow,
      {
        id: "text",
        name: "text",
        description: "text",
        purpose: "text",
        entryPoint: "text",
        output: "text",
        guarantees: "texts",
        nodeIds: "texts",
      },
      `flow ${flow?.id}`,
    );
    require(!flowIds.has(flow.id), flow.id, "duplicate flow ID");
    flowIds.add(flow.id);
    if (Array.isArray(flow.nodeIds)) {
      refs("components", flow.nodeIds, flow.id);
      require(flow.nodeIds.length > 0, flow.id, "flow needs at least one node");
    }
  }
  for (const edge of data.architecture.edges) {
    shape(
      edge,
      {
        id: "text",
        source: "text",
        target: "text",
        type: "text",
        description: "text",
      },
      `edge ${edge?.id}`,
    );
    require(!edgeIds.has(edge.id), edge.id, "duplicate edge ID");
    edgeIds.add(edge.id);
    ref("components", edge.source, edge.id);
    ref("components", edge.target, edge.id);
    oneOf(
      edge.type,
      [
        "depends-on",
        "calls",
        "reads-from",
        "writes-to",
        "publishes-to",
        "consumes-from",
        "contains",
        "implements",
      ],
      edge.id,
      "relationship type",
    );
  }
  for (const m of data.milestones) {
    date(m.dueDate, m.id, "dueDate");
    m.deliverables.forEach((d) =>
      shape(d, { title: "text", complete: "boolean" }, m.id + " deliverable"),
    );
  }
  for (const n of data.notifications) {
    oneOf(
      n.type,
      ["architecture", "change", "milestone"],
      n.id,
      "notification type",
    );
    const url = new URL(n.href, "https://threadline.invalid");
    require(n.href.startsWith("/") &&
      !n.href.startsWith("//"), n.id, "href must be an internal path");
    if (url.pathname.startsWith("/activity/"))
      ref("changes", url.pathname.split("/")[2], n.id);
  }
  refs("tasks", data.overview.currentTaskIds, "overview");
  refs("components", data.overview.suggestedComponentIds, "overview");
  data.overview.pipeline.forEach((p) => {
    shape(
      p,
      { id: "text", name: "text", icon: "text", line1: "text", line2: "text" },
      "overview pipeline",
    );
    ref("components", p.id, "overview");
    oneOf(
      p.icon,
      ["items", "borrowing", "pickup", "returns", "waitlists"],
      "overview",
      "pipeline icon",
    );
  });
  data.overview.teamActivity.forEach((a) => {
    shape(
      a,
      { changeId: "text", action: "text", detail: "text", time: "text" },
      "overview activity",
    );
    ref("changes", a.changeId, "overview");
  });
  data.overview.workSuggestions.forEach((s) =>
    shape(s, { label: "text", request: "text" }, "overview suggestion"),
  );
  for (const rule of data.planner.rules) {
    shape(
      rule,
      {
        match: "text",
        components: "texts",
        title: "text",
        labels: "texts",
        criteria: "texts",
        assumptions: "texts",
      },
      `planner ${rule.match}`,
    );
    if (Array.isArray(rule.components))
      refs("components", rule.components, "planner");
    try {
      new RegExp(rule.match, "i");
    } catch {
      errors.push(`planner: invalid regex ${rule.match}`);
    }
  }
  for (const conflict of data.planner.conflicts) {
    shape(
      conflict,
      {
        componentId: "text",
        firstPattern: "text",
        secondPattern: "text",
        explanation: "text",
      },
      "planner conflict",
    );
    ref("components", conflict.componentId, "planner conflict");
    for (const key of ["firstPattern", "secondPattern"])
      try {
        new RegExp(conflict[key], "i");
      } catch {
        errors.push(`planner conflict: invalid ${key}`);
      }
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return data;
}
