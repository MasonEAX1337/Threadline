import { test, expect } from "@playwright/test";

test("agent request becomes a coordinated, persistent task", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByLabel("What should this accomplish?")
    .fill(
      "When an item is returned, offer it to the next person on the waitlist for 24 hours.",
    );
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(
      "Potential overlap with Make returned items available immediately",
    ),
  ).toBeVisible();
  await expect(
    dialog.getByText(
      /One task holds a returned item for the next person waiting/,
    ),
  ).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Fair waitlist offers");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Fair waitlist offers" }),
  ).toBeVisible();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("ready");
  await page.getByLabel("Status", { exact: true }).selectOption("review");
  await page
    .getByLabel("Coordination note")
    .fill("Give the next person waiting first choice for 24 hours.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText(
      "Coordination: Give the next person waiting first choice for 24 hours.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page.reload();
  await page
    .getByRole("button")
    .filter({ hasText: "Fair waitlist offers" })
    .click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue(
    "review",
  );
});

test("create and start records authorized implementation intent", async ({
  page,
}) => {
  await page.goto("/board");
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByLabel("What should this accomplish?")
    .fill("Let members download their own lending history.");
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await page
    .getByRole("button", { name: "Create & start", exact: true })
    .click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue(
    "in-progress",
  );
});

test("systems drill into modules, services, functions, and decisions", async ({
  page,
}) => {
  await page.goto("/codebase");
  await expect(page.locator(".graph-node")).toHaveCount(8);
  await page.locator(".graph-node").filter({ hasText: "Borrowing" }).dblclick();
  await expect(page.locator(".graph-node")).toHaveCount(2);
  await page
    .locator(".graph-node")
    .filter({ hasText: "Loan lifecycle" })
    .dblclick();
  await expect(
    page.locator(".graph-node").filter({ hasText: "LoanService" }),
  ).toBeVisible();
  await page.locator(".graph-node").filter({ hasText: "LoanService" }).click();
  await expect(
    page.locator(".node-inspector").getByText("Check item availability"),
  ).toBeVisible();
  await page
    .locator(".node-inspector")
    .getByRole("button", {
      name: "Keep availability checks in one place",
    })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Alternatives considered"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Explore functions" }).click();
  await expect(
    page.locator(".graph-node").filter({ hasText: "requestLoan()" }),
  ).toBeVisible();
});

test("global search follows knowledge links and activity filters", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  await page.keyboard.press("Control+k");
  await page
    .getByRole("textbox", { name: "Search project", exact: true })
    .fill("LoanService");
  await page
    .getByRole("dialog")
    .getByRole("button")
    .filter({ hasText: "LoanService" })
    .first()
    .click();
  await expect(page.locator(".node-inspector h2")).toHaveText("LoanService");
  await page
    .locator(".node-inspector")
    .getByRole("link", { name: "View activity" })
    .click();
  await expect(page.getByLabel("Filter changes by component")).toHaveValue(
    "loan-service",
  );
  await expect(page.locator(".activity-entry")).toHaveCount(2);
  await page.getByLabel("Search changes").fill("unmatched-query-xyz");
  await expect(page.getByText("No changes match these filters")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".activity-entry")).toHaveCount(6);
});

test("notifications persist and mock sessions sign in and out", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open notifications" }).click();
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByText("You're all caught up")).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.locator(".notification-dot")).toHaveCount(0);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Continue with GitHub" }).click();
  await expect(
    page.getByRole("heading", { name: "Borrow", exact: true }),
  ).toBeVisible();
});

test("mobile pages fit and navigation remains accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    "/",
    "/codebase",
    "/architecture",
    "/board",
    "/team",
    "/activity",
    "/settings",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBeTruthy();
  }
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Board" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Project board" }),
  ).toBeVisible();
});

test("kanban drag and drop persists and architecture flows reveal guarantees", async ({
  page,
}) => {
  await page.goto("/board");
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const card = page
    .locator(".task-card")
    .filter({ hasText: "Download my lending history" });
  const done = page
    .locator(".kanban-column")
    .filter({ has: page.getByRole("heading", { name: "Done", exact: true }) });
  await card.dragTo(done);
  await expect(
    done
      .locator(".task-card")
      .filter({ hasText: "Download my lending history" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    done
      .locator(".task-card")
      .filter({ hasText: "Download my lending history" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Milestones", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Neighborhood pilot", exact: true }),
  ).toBeVisible();
  await page.goto("/architecture");
  await page.getByRole("button").filter({ hasText: "Return an item" }).click();
  await expect(
    page
      .locator(".flow-description")
      .getByText("An item stays unavailable until its return is confirmed"),
  ).toBeVisible();
  await page
    .locator(".graph-node")
    .filter({ hasText: "ReturnService" })
    .click();
  await expect(page.locator(".node-inspector h2")).toHaveText("ReturnService");
});

test("return planning detects the waitlist conflict in the other direction", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "codebase:harbor:v1",
      JSON.stringify({
        tasks: [
          {
            id: "HBR-43",
            title: "Old release task",
            componentIds: [],
            resources: [],
            acceptanceCriteria: [],
            assumptions: [],
          },
        ],
        selectedProject: "harbor",
      }),
    ),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Borrow", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Old release task")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByLabel("What should this accomplish?")
    .fill("Make returned items available to everyone immediately.");
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText(
      "Potential overlap with Offer returned items to the waitlist",
    ),
  ).toBeVisible();
  await expect(
    dialog.getByText(/Agree on who gets first choice/),
  ).toBeVisible();
});
