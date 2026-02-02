/**
 * Demo: Open the app in a visible browser and play the game so you can watch.
 * Run: npx playwright test e2e/demo-play.spec.ts
 */
import { test, expect } from "@playwright/test";

async function goToGame(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByText(/Choose your side/i)).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Ethereum|Secure the chain/i }).first().click();
  await expect(page.getByRole("heading", { name: "Loadout" })).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /Ready/i }).click();
  await expect(page.locator(".game-container").first()).toBeVisible({ timeout: 25000 });
}

test("open and play game for viewing", async ({ page }) => {
  await goToGame(page);

  await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
  const gameArea = page.locator(".game-container").first();
  await expect(page.getByText(/Round \d+/).first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Health/).first()).toBeVisible();
  await expect(page.getByText(/Rifle|Pistol|Shotgun/).first()).toBeVisible();

  // Dismiss tutorial overlay if present (Move → Next, Shoot → Next, Capture → Got it)
  const tutorialNext = page.getByRole("button", { name: /Next|Got it/i });
  if (await tutorialNext.isVisible().catch(() => false)) {
    for (let i = 0; i < 3; i++) {
      await tutorialNext.click();
      await page.waitForTimeout(300);
      if (!(await tutorialNext.isVisible().catch(() => false))) break;
    }
  }

  await gameArea.click({ position: { x: 400, y: 300 } });

  const move = async (key: string, ms: number) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  };

  await move("w", 400);
  await move("a", 300);
  await move("s", 400);
  await move("d", 300);
  await page.mouse.click(500, 400);
  await page.waitForTimeout(200);
  await page.mouse.click(600, 350);
  await move("w", 600);
  await page.mouse.click(550, 380);

  await page.waitForTimeout(2000);
});
