import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("page loads and shows BaseStrike title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /BaseStrike/i })).toBeVisible();
  });

  test("manifest is reachable", async ({ request }) => {
    const res = await request.get("/api/manifest");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("miniapp");
    expect(body.miniapp?.name).toBe("BaseStrike");
  });
});

test.describe("UI navigation", () => {
  test("Play tab shows game and controls hint", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /BaseStrike/i })).toBeVisible();
    await expect(page.getByText(/WASD to move|Tap joystick to move/).first()).toBeVisible();
    await expect(page.locator(".game-container").first()).toBeVisible();
  });

  test("Ranked tab shows ranked content", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Ranked/i }).click();
    await expect(page.getByText(/Ranked Queue/i)).toBeVisible();
    await expect(page.getByText(/Stake 0.001 ETH/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Coming Soon/i })).toBeVisible();
  });

  test("Profile tab shows profile content", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/Profile/i).first()).toBeVisible();
    await expect(page.getByText(/Stats and match history/)).toBeVisible();
  });

  test("switching between Play, Ranked, Profile updates content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/WASD to move|Tap joystick to move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Ranked/i }).click();
    await expect(page.getByText(/Ranked Queue/i)).toBeVisible();
    await page.getByRole("button", { name: /Play/i }).click();
    await expect(page.getByText(/WASD to move|Tap joystick to move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/Stats and match history/)).toBeVisible();
  });
});
