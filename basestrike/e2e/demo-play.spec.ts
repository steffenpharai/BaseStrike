/**
 * Demo: Open the app in a visible browser and play the game so you can watch.
 * Run: npx playwright test e2e/demo-play.spec.ts
 */
import { test } from "@playwright/test";

test("open and play game for viewing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: /BaseRift/i }).waitFor({ state: "visible" });
  await page.getByText(/WASD to move|Tap joystick to move/).first().waitFor({ state: "visible" });

  const gameArea = page.locator(".game-container").first();
  await gameArea.waitFor({ state: "visible" });
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

  await page.waitForTimeout(25000);
});
