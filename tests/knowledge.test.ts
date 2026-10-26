import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { projectService, taskService } from "../src/lib/services";
import {
  planTask,
  findOverlaps,
  overlapPairs,
  nextTaskId,
} from "../src/lib/planning";
// CLI modules are JavaScript intentionally: validation must run before compiling app types.
// @ts-expect-error Script module has runtime tests rather than a generated declaration.
import { readKnowledge, validateKnowledge } from "../scripts/knowledge.mjs";

test("seed records match the supplied specification exactly", async () => {
  const spec = await readFile("docs/product-spec.md", "utf8");
  const expected = JSON.parse(
    spec.split("```json\n").at(-1)!.split("\n```")[0],
  );
  for (const [file, record] of Object.entries(expected))
    assert.deepEqual(JSON.parse(await readFile(file, "utf8")), record, file);
  const snapshot = await projectService.getSnapshot();
  assert.deepEqual(
    [
      snapshot.developers.length,
      snapshot.nodes.length,
      snapshot.tasks.length,
      snapshot.changes.length,
    ],
    [8, 38, 12, 6],
  );
  assert.equal(snapshot.tasks.filter((t) => t.status !== "done").length, 8);
  assert.equal(
    Math.round(
      (snapshot.tasks.filter((t) => t.status === "done").length /
        snapshot.tasks.length) *
        100,
    ),
    33,
  );
});

test("services return isolated copies, including nested criteria", async () => {
  const a = await taskService.getTasks();
  a[0].acceptanceCriteria.push("mutation");
  a.pop();
  const b = await taskService.getTasks();
  assert.equal(b.length, 12);
  assert.ok(!b[0].acceptanceCriteria.includes("mutation"));
  const s = await projectService.getSnapshot();
  s.nodes[0].responsibilities.length = 0;
  assert.ok(
    (await projectService.getSnapshot()).nodes[0].responsibilities.length > 0,
  );
});

test("validator rejects broken references, cycles, types, and evidence with record IDs", async () => {
  const valid = await readKnowledge();
  validateKnowledge(valid);
  for (const [edit, expected] of [
    [
      (d: typeof valid) => {
        d.tasks[0].assigneeId = "missing";
      },
      /BRW-43.*developers reference missing/,
    ],
    [
      (d: typeof valid) => {
        d.tasks[0].status = "running";
      },
      /BRW-43.*invalid status/,
    ],
    [
      (d: typeof valid) => {
        d.components.find(
          (n: { id: string }) => n.id === "loan-service",
        ).parentId = "request-loan";
      },
      /loan-service.*cyclic parent/,
    ],
    [
      (d: typeof valid) => {
        d.changes[0].evidence.status = "invented";
      },
      /availability-check.*evidence status/,
    ],
    [
      (d: typeof valid) => {
        d.manifest.schemaVersion = 2;
      },
      /unsupported schemaVersion/,
    ],
    [
      (d: typeof valid) => {
        d.architecture.edges[0].target = "missing";
      },
      /edge-0.*reference missing/,
    ],
  ] as const) {
    const copy = structuredClone(valid);
    edit(copy);
    assert.throws(() => validateKnowledge(copy), expected);
  }
});

test("discovery keeps manifest order and appends unlisted files alphabetically", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "threadline-knowledge-"));
  try {
    await cp(".project", root, { recursive: true });
    const original = JSON.parse(
      await readFile(path.join(root, "tasks/BRW-49.json"), "utf8"),
    );
    for (const id of ["BRW-91", "BRW-90"])
      await writeFile(
        path.join(root, `tasks/${id}.json`),
        JSON.stringify({ ...original, id }),
      );
    const data = validateKnowledge(await readKnowledge(root));
    assert.equal(data.tasks[0].id, "BRW-43");
    assert.deepEqual(
      data.tasks.slice(-2).map((t: { id: string }) => t.id),
      ["BRW-90", "BRW-91"],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("planner precedence, explicit component union, and fallback are deterministic", async () => {
  const { nodes } = await projectService.getSnapshot();
  const draft = planTask(
    "When an item is returned, offer it to the waitlist. Include PhotoService.",
    nodes,
  );
  assert.equal(draft.title, "Offer returned items to the next person waiting");
  assert.deepEqual(draft.componentIds, [
    "loan-service",
    "waitlist-service",
    "return-service",
    "notification-service",
    "photo-service",
  ]);
  assert.ok(draft.resources.includes("src/photos/photo.service.ts"));
  const fallback = planTask("  Improve the welcome animation! ", nodes);
  assert.equal(fallback.title, "Improve the welcome animation");
  assert.deepEqual(fallback.componentIds, []);
  assert.equal(fallback.acceptanceCriteria.length, 3);
});

test("overlap evidence is symmetric, prioritizes contracts, and excludes done work", async () => {
  const { nodes, tasks } = await projectService.getSnapshot();
  const wait = planTask("Return an item to the next person waiting", nodes);
  assert.equal(findOverlaps(wait, tasks)[0].task.id, "BRW-42");
  assert.equal(findOverlaps(wait, tasks)[0].level, "contract");
  const immediate = planTask(
    "Make returned items available immediately",
    nodes,
  );
  assert.equal(findOverlaps(immediate, tasks)[0].task.id, "BRW-43");
  assert.equal(
    findOverlaps(planTask("Improve the welcome animation", nodes), tasks)
      .length,
    0,
  );
  assert.equal(
    findOverlaps(
      wait,
      tasks.map((t) => ({ ...t, status: "done" })),
    ).length,
    0,
  );
  const pairs = overlapPairs(tasks);
  assert.equal(
    new Set(pairs.map((p) => [p.first.id, p.overlap.task.id].sort().join("|")))
      .size,
    pairs.length,
  );
  assert.equal(pairs[0].overlap.level, "contract");
  assert.equal(nextTaskId(tasks), "BRW-50");
});
