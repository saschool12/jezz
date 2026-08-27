import { test, expect } from "@playwright/test";
test("home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("JHONNY AI").first()).toBeVisible();
});
