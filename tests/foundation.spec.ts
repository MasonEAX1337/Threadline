import { expect, test } from "@playwright/test";

// These are foundation checks. Stateful Borrow workflows belong to their feature stages.
test("loads the production app and local variable font without runtime errors", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  const fontRequests: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    if (request.resourceType() === "font") fontRequests.push(request.url());
  });

  await page.goto("/");
  await expect(page).toHaveTitle("Threadline — Borrow");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Shared context for teams that build with agents.",
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Your team's shared understanding of the codebase. Explore architecture, understand changes, and coordinate agent-led work.",
  );
  await page.evaluate(() => document.fonts.ready);
  const font = await page.evaluate(() => ({
    family: getComputedStyle(document.body).fontFamily,
    loaded: [...document.fonts].some(
      (entry) => entry.status === "loaded" && entry.weight === "100 900",
    ),
  }));
  expect(font.family.toLowerCase()).toContain("inter");
  expect(font.loaded).toBe(true);
  expect(fontRequests.length).toBeGreaterThan(0);
  expect(fontRequests.every((url) => new URL(url).origin === baseURL)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test("keeps the foundation readable without horizontal document overflow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  const geometry = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    background: getComputedStyle(document.documentElement).backgroundColor,
  }));
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.background).toBe("rgb(17, 18, 20)");
});

test("provides a visible keyboard skip link into the main landmark", async ({
  page,
  browserName,
}) => {
  await page.goto("/");
  // WebKit uses Option+Tab to include links in sequential keyboard navigation.
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await expect(skipLink).toHaveCSS("outline-width", "2px");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("returns a real 404 and recovers to the overview", async ({ page }) => {
  const response = await page.goto("/not-a-project-page");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This page isn't in the project" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Go to overview" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Shared context for teams that build with agents.",
  );
});
