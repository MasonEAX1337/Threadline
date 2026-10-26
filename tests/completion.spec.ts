import { expect, test, type Page } from "@playwright/test";
async function ready(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.locator("[data-ready=true]")).toBeVisible();
}

test("team expertise searches and profile deep links connect to live tasks and changes", async ({
  page,
}) => {
  await ready(page, "/team");
  await expect(page.locator(".person-card")).toHaveCount(8);
  await page
    .getByRole("textbox", { name: "Search people or areas" })
    .fill("nonexistent person");
  await expect(
    page.getByRole("heading", { name: "No teammates match" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search people or areas" })
    .fill("privacy");
  await expect(page.locator(".person-card")).toHaveCount(1);
  await page.getByRole("link", { name: "View profile" }).click();
  const profile = page.getByRole("dialog");
  await expect(
    profile.getByRole("heading", { name: "Priya Shah" }),
  ).toBeVisible();
  await profile
    .getByRole("link", { name: /Pickup details kept private/ })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: "Pickup details kept private",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/team?member=alex");
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: "Alex Rivera" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /BRW-43/ })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Offer returned items to the waitlist" }),
  ).toBeVisible();
});

test("settings persist local preferences without inference requests and reset requires confirmation", async ({
  page,
}) => {
  await ready(page, "/board?task=BRW-44");
  await page.getByLabel("Status", { exact: true }).selectOption("done");
  await page.goto("/settings");
  const remoteRequests: string[] = [];
  page.on("request", (r) => {
    if (!new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      remoteRequests.push(r.url());
  });
  await page
    .getByRole("switch", { name: "Compact information density" })
    .check();
  await page
    .getByLabel("Knowledge source", { exact: true })
    .selectOption("compatible");
  await page
    .getByLabel("Endpoint URL", { exact: true })
    .fill("https://inference.example.com/v1");
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Endpoint URL", { exact: true })
    .fill("https://inference.example.com/v1/custom");
  await expect(
    page.getByRole("button", { name: "Save preferences", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Compact information density" }),
  ).toBeChecked();
  await expect(page.getByLabel("Endpoint URL", { exact: true })).toHaveValue(
    "https://inference.example.com/v1/custom",
  );
  await page
    .getByRole("button", { name: "Reset sample data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel" })
    .click();
  await expect(
    page.getByRole("switch", { name: "Compact information density" }),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Reset sample data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset sample data", exact: true })
    .click();
  await expect(
    page.getByRole("switch", { name: "Compact information density" }),
  ).not.toBeChecked();
  await expect(page.getByLabel("Endpoint URL", { exact: true })).toHaveValue(
    "https://inference.example.com/v1/custom",
  );
  await page.goto("/board?task=BRW-44");
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("ready");
  expect(remoteRequests).toEqual([]);
});

test("search keyboard navigation wraps, Escape closes, and unmatched knowledge is honest", async ({
  page,
}) => {
  await ready(page);
  await page.keyboard.press("Control+k");
  let search = page.getByRole("combobox", { name: "Search project" });
  await expect(search).toBeFocused();
  await search.press("ArrowUp");
  await expect(search).toHaveAttribute("aria-activedescendant", "result-9");
  await search.press("ArrowDown");
  await expect(search).toHaveAttribute("aria-activedescendant", "result-0");
  await search.fill("unknown knowledge 1234");
  await expect(
    page.getByText("No matching knowledge", { exact: true }),
  ).toBeVisible();
  await search.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Control+k");
  search = page.getByRole("combobox", { name: "Search project" });
  await expect(search).toHaveValue("");
  await search.fill("BRW-44");
  await search.press("Enter");
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Download my lending history" }),
  ).toBeVisible();
  await page.waitForURL("**/board?task=BRW-44");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect(page).not.toHaveURL(/task=/);
  await page.goto("/search");
  await page
    .getByRole("combobox", { name: "Search project" })
    .fill("unknown knowledge 1234");
  await expect(
    page.getByRole("heading", { name: "No results found" }),
  ).toBeVisible();
});

test("reverse return contract is detected while unrelated plans do not fabricate scope", async ({
  page,
}) => {
  await ready(page);
  await page
    .getByRole("button", { name: "Describe work", exact: true })
    .click();
  const request = page.getByLabel("What should this accomplish?", {
    exact: true,
  });
  await request.fill("Make returned items available to everyone immediately.");
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await expect(
    page.getByText(
      "Potential overlap with Offer returned items to the waitlist",
      { exact: true },
    ),
  ).toBeVisible();
  await request.fill("Add a constellation animation to the welcome page.");
  await page.getByRole("button", { name: "Draft task", exact: true }).click();
  await expect(
    page.getByText(
      "Scope needs discovery. The agent has not identified a component from this request.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.locator(".overlap-warning")).toHaveCount(0);
});

test("email demo validates fields without sending or storing credentials", async ({
  page,
}) => {
  await ready(page, "/settings");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/login");
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.postData()) sent.push(r.postData()!);
  });
  await page
    .getByLabel("Email", { exact: true })
    .fill("demo-private@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("secret-demo-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  expect(sent.join(" ")).not.toMatch(/demo-private|secret-demo-password/);
  const storage = await page.evaluate(() =>
    JSON.stringify({ ...localStorage, ...sessionStorage }),
  );
  expect(storage).not.toMatch(/demo-private|secret-demo-password/);
});

test("every workspace screen fits the viewport and mobile navigation closes after routing", async ({
  page,
}) => {
  for (const [path, title] of [
    ["/", "Borrow"],
    ["/codebase", "Codebase"],
    ["/architecture", "Architecture"],
    ["/board", "Project board"],
    ["/team", "Team"],
    ["/activity", "Activity"],
    ["/settings", "Settings"],
  ]) {
    await ready(page, path);
    await expect(
      page.getByRole("heading", { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  if ((page.viewportSize()?.width ?? 1440) <= 760) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Codebase", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Codebase", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Close navigation", exact: true }),
    ).toHaveCount(0);
  }
});

test("native drag updates a task and persists the new column", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Touch devices use the tested status selector alternative.",
  );
  await ready(page, "/board");
  const card = page.getByRole("button", {
    name: "BRW-44 Download my lending history",
    exact: true,
  });
  const done = page.getByRole("region", { name: "Done column" });
  await card.dragTo(done);
  await expect(
    done.getByRole("button", {
      name: "BRW-44 Download my lending history",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    done.getByRole("button", {
      name: "BRW-44 Download my lending history",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/");
  await expect(page.locator(".snapshot-cell").nth(2)).toHaveText(
    "7Active tasks",
  );
});
