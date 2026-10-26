import { expect, test } from "@playwright/test";
async function ready(page: import("@playwright/test").Page, path = "/") {
  await page.goto(path);
  await expect(page.locator("[data-ready=true]")).toBeVisible();
}

test("overview derives its baseline counts and sprint progress from shared knowledge", async ({
  page,
}) => {
  await ready(page);
  const cells = page.locator(".snapshot-cell");
  await expect(cells).toHaveText([
    "8Contributors",
    "38Components",
    "8Active tasks",
    "6Changes this week",
  ]);
  await expect(
    page.getByRole("progressbar", { name: "Sprint progress" }),
  ).toHaveAttribute("aria-valuenow", "33");
  await expect(page.getByText("One overlap worth a look")).toBeVisible();
});

test("draft a waitlist task, record a reviewed agreement, and persist after reload", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Waitlist offers", exact: true })
    .click();
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await expect(
    page.getByText(
      "Potential overlap with Make returned items available immediately",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill("Fair waitlist offers");
  await page.getByRole("button", { name: "Create task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Fair waitlist offers" }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Status", { exact: true })).toHaveValue(
    "ready",
  );
  await dialog.getByLabel("Status", { exact: true }).selectOption("review");
  await dialog
    .getByLabel("Coordination note", { exact: true })
    .fill("Waitlist holds take precedence for 24 hours.");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    dialog.getByText(
      "Coordination: Waitlist holds take precedence for 24 hours.",
    ),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page).not.toHaveURL(/task=/);
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", { name: "BRW-50 Fair waitlist offers", exact: true })
    .click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue(
    "review",
  );
  await expect(
    page.getByText(
      "Coordination: Waitlist holds take precedence for 24 hours.",
    ),
  ).toBeVisible();
});

test("create and start records intent; editing a request invalidates a draft", async ({
  page,
}) => {
  await ready(page, "/board");
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Waitlist offers", exact: true })
    .click();
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Lending history", exact: true })
    .click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Download my lending history",
  );
  await page
    .getByRole("button", { name: "Create & start", exact: true })
    .click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue(
    "in-progress",
  );
  await expect(
    page.getByText("Starting is simulated. No agent has run or written code."),
  ).toBeVisible();
});

test("board status and milestone progress persist and update", async ({
  page,
}) => {
  await ready(page, "/board?task=BRW-44&keep=yes");
  await page.getByLabel("Status", { exact: true }).selectOption("done");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(page).toHaveURL(/keep=yes/);
  await expect(page).not.toHaveURL(/task=/);
  await page.reload();
  await expect(
    page
      .getByRole("region", { name: "Done column" })
      .getByRole("button", { name: "BRW-44 Download my lending history" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Milestones", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Neighborhood pilot" }),
  ).toBeVisible();
  await expect(page.getByText("5 of 12 tasks complete")).toBeVisible();
});

test("project previews, notifications and mock sign-out persist", async ({
  page,
}) => {
  await ready(page);
  if ((page.viewportSize()?.width ?? 1440) <= 760)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Choose project" }).click();
  await page.getByRole("menuitem", { name: /Gather/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Gather is ready for its first knowledge update",
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Gather is ready for its first knowledge update"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Explore Borrow" }).click();
  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByText("You're all caught up")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.reload();
  await expect(page.getByTestId("unread-dot")).toHaveCount(0);
  if ((page.viewportSize()?.width ?? 1440) <= 760)
    await page.getByRole("button", { name: "Open navigation" }).click();
  await page.locator(".profile-row").click();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
  await page.getByRole("button", { name: "Continue with GitHub" }).click();
  await expect(
    page.getByRole("heading", { name: "Borrow", exact: true }),
  ).toBeVisible();
});
