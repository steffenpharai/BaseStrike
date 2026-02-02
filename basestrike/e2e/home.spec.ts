import { test, expect } from "@playwright/test";

test.describe("Home", () => {
  test("page loads and shows BaseRift title", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /BaseRift/i })).toBeVisible();
  });

  test("manifest is reachable", async ({ request }) => {
    const res = await request.get("/.well-known/farcaster.json");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("miniapp");
    expect(body.miniapp?.name).toBe("BaseRift");
  });
});

test.describe("UI navigation", () => {
  test("Play tab shows game and controls hint", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /BaseRift/i })).toBeVisible();
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await expect(page.locator(".game-container").first()).toBeVisible();
  });

  test("Play tab shows HUD elements (scorebar, health, weapon)", async ({ page }) => {
    await page.goto("/");
    await page.getByText(/Joystick: move/).first().waitFor({ state: "visible" });
    await page.locator(".game-container").first().waitFor({ state: "visible" });
    // HUD appears after game state; wait for scorebar (Round N) and health
    await expect(page.getByText(/Round \d+/).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Health/).first()).toBeVisible();
    await expect(page.getByText(/Rifle|Pistol|Shotgun/).first()).toBeVisible();
  });

  test("Play tab has no large Beta testers block", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    // Beta messaging removed from Play; only slim hint line
    await expect(page.getByText(/Live: Climb Ranks/).first()).toBeVisible();
    await expect(page.getByText(/0\/100 testers|First 100 get/)).not.toBeVisible();
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
    await expect(page.getByText(/stats and match history/i)).toBeVisible();
  });

  test("switching between Play, Ranked, Profile updates content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Ranked/i }).click();
    await expect(page.getByText(/Ranked Queue/i)).toBeVisible();
    await page.getByRole("button", { name: /Play/i }).click();
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/stats and match history/i)).toBeVisible();
  });
});
