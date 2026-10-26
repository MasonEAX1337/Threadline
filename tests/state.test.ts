import assert from "node:assert/strict";
import { test } from "node:test";
import { projectService } from "../src/lib/services";
import { restoreProject, initialProject } from "../src/lib/storage";
import { defaultTypes, visibleNodes, nodePosition } from "../src/lib/graph";
import { nextTaskId } from "../src/lib/planning";

test("corrupt persisted tasks fall back to isolated seed records without importing another project", async () => {
  const seed = await projectService.getSnapshot();
  for (const invalid of [
    "{broken",
    JSON.stringify({
      tasks: [{ id: "BRW-50", title: "Missing arrays" }],
      selectedProject: "unknown",
    }),
    JSON.stringify({ tasks: [{ ...seed.tasks[0], assigneeId: "stranger" }] }),
  ]) {
    const state = restoreProject(seed, invalid);
    assert.equal(state.tasks.length, 12);
    assert.equal(state.selectedProject, "borrow");
    state.tasks[0].assumptions.push("local");
    assert.equal(seed.tasks[0].assumptions.length, 1);
  }
  const valid = initialProject(seed);
  valid.tasks[0].status = "done";
  valid.selectedProject = "gather";
  valid.compact = true;
  assert.deepEqual(restoreProject(seed, JSON.stringify(valid)), valid);
  assert.equal(
    nextTaskId([...seed.tasks, { ...seed.tasks[0], id: "BRW-100" }]),
    "BRW-101",
  );
});

test("graph scope follows complete ancestry and preserves the specified layout", async () => {
  const { nodes } = await projectService.getSnapshot();
  assert.equal(
    visibleNodes(nodes, "architecture", null, defaultTypes).length,
    8,
  );
  assert.deepEqual(
    visibleNodes(nodes, "modules", "borrowing", defaultTypes).map((n) => n.id),
    ["loan-lifecycle", "pickup-planning"],
  );
  assert.deepEqual(
    visibleNodes(nodes, "implementation", "loan-lifecycle", defaultTypes).map(
      (n) => n.id,
    ),
    ["loan-service", "availability-policy", "api"],
  );
  assert.deepEqual(
    visibleNodes(nodes, "implementation", "loan-service", [
      ...defaultTypes,
      "function",
    ]).map((n) => n.id),
    ["request-loan"],
  );
  assert.equal(
    visibleNodes(nodes, "implementation", "borrowing", defaultTypes).some(
      (n) => n.id === "return-service",
    ),
    false,
  );
  assert.deepEqual(
    nodePosition(
      nodes.find((n) => n.id === "history")!,
      7,
      "architecture",
    ),
    { x: 0, y: 190 },
  );
});
