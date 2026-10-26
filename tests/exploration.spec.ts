import { expect, test, type Page } from "@playwright/test";
async function ready(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("[data-ready=true]")).toBeVisible();
}

test("explore Borrowing through modules, decision memory, and function children", async ({
  page,
}) => {
  await ready(page, "/codebase");
  await expect(page.locator(".react-flow__node")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Inspect Borrowing", exact: true })
    .dblclick();
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Inspect Loan lifecycle", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Explore implementation", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect LoanService", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "LoanService details",
  });
  await expect(
    inspector.getByText("Check item availability", { exact: true }),
  ).toBeVisible();
  await inspector
    .getByRole("button", { name: /Keep availability checks in one place/ })
    .click();
  const decision = page.getByRole("dialog");
  await expect(
    decision.getByRole("heading", { name: "Alternatives considered" }),
  ).toBeVisible();
  await expect(
    decision.getByText("Check availability in each screen", { exact: true }),
  ).toBeVisible();
  await expect(
    decision.getByText("Let owners resolve double bookings manually", {
      exact: true,
    }),
  ).toBeVisible();
  await decision.getByRole("button", { name: "Close", exact: true }).click();
  await inspector
    .getByRole("button", { name: "Explore functions", exact: true })
    .click();
  await expect(page.locator(".react-flow__node")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Inspect requestLoan()", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Inspect requestLoan()", exact: true })
    .click();
  await expect(
    page.getByRole("complementary", { name: "requestLoan() details" }),
  ).toBeVisible();
});

test("global search focuses LoanService and its activity filter is cumulative", async ({
  page,
}) => {
  await ready(page, "/");
  await page.keyboard.press("Control+k");
  const search = page.getByRole("combobox", { name: "Search project" });
  await search.fill("LoanService");
  await search.press("Enter");
  await expect(page).toHaveURL(/codebase\?node=loan-service/);
  const inspector = page.getByRole("complementary", {
    name: "LoanService details",
  });
  await expect(inspector).toBeVisible();
  await inspector
    .getByRole("link", { name: "View activity", exact: true })
    .click();
  await expect(page).toHaveURL(/activity\?component=loan-service/);
  await expect(page.getByText("2 updates", { exact: true })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search changes" })
    .fill("no such recorded change 123");
  await expect(
    page.getByRole("heading", { name: "No changes match these filters" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.getByText("6 updates", { exact: true })).toBeVisible();
});

test("return flow preserves owner confirmation and shares the component inspector", async ({
  page,
}) => {
  await ready(page, "/architecture?flow=return");
  await expect(
    page.getByText("An item stays unavailable until its return is confirmed", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".react-flow__node")).toHaveCount(7);
  await page
    .getByRole("button", { name: "Inspect ReturnService", exact: true })
    .click();
  const inspector = page.getByRole("complementary", {
    name: "ReturnService details",
  });
  await expect(
    inspector.getByText("Require the owner to confirm a return", {
      exact: true,
    }),
  ).toBeVisible();
  await inspector.getByRole("button", { name: "Close inspector" }).click();
  await expect(
    page.getByText("An item stays unavailable until its return is confirmed", {
      exact: true,
    }),
  ).toBeVisible();
});

test("change details expose recorded rationale, decisions, source evidence, and prototype answers", async ({
  page,
}) => {
  await ready(page, "/activity/availability-check");
  await expect(
    page.getByRole("heading", {
      name: "Double bookings prevented",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "src/loans/loan.service.ts" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/example/borrow/blob/a83dcf2/src/loans/loan.service.ts",
  );
  const ask = page.getByRole("button", { name: "Ask AI Agent" });
  await expect(ask).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Question about this change" })
    .fill("Why was this changed?");
  await ask.click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Two neighbors could request the same drill" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Keep availability checks in one place/ })
    .click();
  await expect(
    page.getByRole("dialog").getByText("ADR-017", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/activity/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Change not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to activity" }).click();
  await expect(page.getByText("6 updates", { exact: true })).toBeVisible();
});

test("graph deep links enable functions and empty filters recover to eight systems", async ({
  page,
}) => {
  await ready(page, "/codebase?node=request-loan");
  await expect(
    page.getByRole("complementary", { name: "requestLoan() details" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Functions", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "All systems", exact: true }).click();
  await page.getByRole("button", { name: "Systems", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No components in this view" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset view" }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(8);
  await page
    .getByRole("textbox", { name: "Search components" })
    .fill("src/returns/return.service.ts");
  await page
    .locator(".component-suggestions")
    .getByRole("button", { name: /ReturnService/ })
    .click();
  await expect(
    page.getByRole("complementary", { name: "ReturnService details" }),
  ).toBeVisible();
});
