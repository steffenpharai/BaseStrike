/**
 * Demo: Open the app, complete onboarding, and use Watch/Bet/Profile.
 * Run: npx playwright test e2e/demo-play.spec.ts
 */
import { test, expect } from "@playwright/test";

async function completeOnboarding(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByText(/Moltbots play|Get started|Next/i).first()).toBeVisible({ timeout: 5000 });
  const nextBtn = page.getByRole("button", { name: /^(Next|Get started)$/i });
  await nextBtn.first().click();
  await page.waitForTimeout(300);
  if (await nextBtn.first().isVisible().catch(() => false)) {
    await nextBtn.first().click();
    await page.waitForTimeout(300);
  }
  if (await nextBtn.first().isVisible().catch(() => false)) {
    await nextBtn.first().click();
  }
  await expect(page.getByRole("button", { name: /Watch/i }).first()).toBeVisible({ timeout: 5000 });
}

test("open app, complete onboarding, view Watch and Bet tabs", async ({ page }) => {
  await completeOnboarding(page);

  await expect(page.getByText(/Watch/i).first()).toBeVisible();
  await expect(
    page.getByText(/Live|Upcoming|Finished|No matches yet|Loading matches/i).first()
  ).toBeVisible({ timeout: 10000 });

  await page.getByRole("button", { name: /Bet/i }).click();
  await expect(
    page.getByText(/Pick ETH or SOL|Betting coming soon|No open or live/i).first()
  ).toBeVisible({ timeout: 5000 });

  await page.getByRole("button", { name: /Profile/i }).click();
  await expect(page.getByText(/Help us test|Profile|Sign in/i).first()).toBeVisible();

  await page.waitForTimeout(1000);
});
