import { expect, test } from "@playwright/test";

test("blocked storage keeps the sample usable and task edits work in memory", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage unavailable", "SecurityError");
    };
  });
  await page.goto("/board?task=BRW-44");
  await page.getByLabel("Status", { exact: true }).selectOption("done");
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("done");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(
    page
      .getByRole("region", { name: "Done column" })
      .getByRole("button", { name: /BRW-44/ }),
  ).toBeVisible();
});

test("corrupt browser data recovers to intact sample tasks without overwriting valid unrelated settings", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "codebase:borrow:v1",
      JSON.stringify({
        tasks: [{ id: "BRW-50", title: "broken" }],
        selectedProject: "unknown",
      }),
    );
    localStorage.setItem(
      "codebase:settings",
      JSON.stringify({ source: "local", endpoint: "" }),
    );
  });
  await page.goto("/board");
  await expect(page.locator(".task-card")).toHaveCount(12);
  await page.goto("/settings");
  await expect(
    page.getByLabel("Knowledge source", { exact: true }),
  ).toHaveValue("local");
});

test("task component links dismiss details and preserve direct graph selection", async ({
  page,
}) => {
  await page.goto("/board?task=BRW-44&keep=yes");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "LoanHistoryService", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/codebase\?node=history-service/);
  await expect(
    page.getByRole("complementary", { name: "LoanHistoryService details" }),
  ).toBeVisible();
  await page.goto("/board?task=BRW-42");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Double bookings prevented/ })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/activity\/availability-check$/);
});

test("draft scope inspection hides the draft without losing its request", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Lending history", exact: true })
    .click();
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "LoanHistoryService", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("complementary", { name: "LoanHistoryService details" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Borrow", exact: true }).click();
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await expect(
    page.getByLabel("What should this accomplish?", { exact: true }),
  ).toHaveValue("Let members download their own lending history.");
});

test("notification dismissal and navigation persist individual read states", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Dismiss Waitlists are here", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Waitlists are here", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("dialog")
    .getByRole("button", {
      name: /Double bookings prevented Borrowing requests/,
    })
    .click();
  await expect(page).toHaveURL(/activity\/availability-check/);
  await page.reload();
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  await expect(page.locator(".notification-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(
    page.getByText("You're all caught up", { exact: true }),
  ).toBeVisible();
});

test("finishing active overlapping work removes the coordination alert and count", async ({
  page,
}) => {
  for (const id of ["BRW-43", "BRW-45"]) {
    await page.goto(`/board?task=${id}`);
    await page.getByLabel("Status", { exact: true }).selectOption("done");
  }
  await page.goto("/");
  await expect(
    page.getByText("One overlap worth a look", { exact: true }),
  ).toHaveCount(0);
  await page.goto("/board");
  await page.getByRole("button", { name: "0 tasks with overlap" }).click();
  await expect(
    page.getByText("No active overlaps found", { exact: true }),
  ).toBeVisible();
});

test("nested unknown paths recover and architecture child exploration enters the function scope", async ({
  page,
}) => {
  await page.goto("/activity/availability-check/unknown");
  await expect(
    page.getByRole("heading", {
      name: "This page isn't in the project",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/architecture?flow=return");
  await page
    .getByRole("button", { name: "Inspect ReturnService", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Explore functions", exact: true })
    .click();
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  await expect(
    page.getByRole("complementary", { name: "confirmReturn() details" }),
  ).toBeVisible();
});

test("owner and milestone edits update profiles and progress immediately and persist", async ({
  page,
}) => {
  await page.goto("/board?task=BRW-43");
  await page.getByLabel("Owner", { exact: true }).selectOption("jamie");
  await page.getByLabel("Milestone", { exact: true }).selectOption("v1");
  await page.reload();
  await expect(page.getByLabel("Owner", { exact: true })).toHaveValue("jamie");
  await expect(page.getByLabel("Milestone", { exact: true })).toHaveValue("v1");
  await page.goto("/team?member=jamie");
  await expect(
    page.getByRole("dialog").getByRole("button", { name: /BRW-43/ }),
  ).toBeVisible();
  await page.goto("/board?tab=milestones");
  await expect(
    page.getByText("4 of 11 tasks complete", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("0 of 1 tasks complete", { exact: true }),
  ).toBeVisible();
});
