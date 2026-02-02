import { test, expect } from "@playwright/test";

/**
 * Go through onboarding flow to reach the game (so tests can assert on game UI).
 * Loading (~2.5s) → Team → Inventory → Queue (2–10s + 5s countdown).
 */
async function goToGame(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.getByText(/BaseRift|Loading assets/).first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Choose your side/i)).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Ethereum|Secure the chain/i }).first().click();
  await expect(page.getByRole("heading", { name: "Loadout" })).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /Ready/i }).click();
  await expect(page.getByRole("heading", { name: /Queueing|Get ready/i })).toBeVisible({ timeout: 5000 });
  await expect(page.locator(".game-container").first()).toBeVisible({ timeout: 25000 });
}

test.describe("Home", () => {
  test("page loads and shows BaseRift or loading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/BaseRift/i).or(page.getByText(/Loading assets/i)).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("loading advances to team select", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/BaseRift|Loading assets/).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Choose your side/i)).toBeVisible({ timeout: 15000 });
  });

  test("manifest is reachable", async ({ request }) => {
    const res = await request.get("/.well-known/farcaster.json");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("miniapp");
    expect(body.miniapp?.name).toBe("BaseRift");
  });
});

test.describe("Onboarding flow", () => {
  test("team select shows ETH and SOL options", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Choose your side/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Ethereum|Secure the chain/i).first()).toBeVisible();
    await expect(page.getByText(/Solana|Outpace/i).first()).toBeVisible();
  });

  test("pick team → loadout → ready → queue → game", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Choose your side/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Ethereum|Secure the chain/i }).first().click();
    await expect(page.getByRole("heading", { name: "Loadout" })).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Ready/i }).click();
    await expect(page.getByRole("heading", { name: /Queueing|Get ready/i })).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".game-container").first()).toBeVisible({ timeout: 25000 });
  });
});

test.describe("UI navigation (in-game)", () => {
  test("after flow, Play tab shows game and controls hint", async ({ page }) => {
    await goToGame(page);
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await expect(page.locator(".game-container").first()).toBeVisible();
  });

  test("after flow, Play tab shows HUD elements", async ({ page }) => {
    await goToGame(page);
    await expect(page.getByText(/Round \d+/).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Health/).first()).toBeVisible();
    await expect(page.getByText(/Rifle|Pistol|Shotgun/).first()).toBeVisible();
  });

  test("after flow, Play tab has no large Beta testers block", async ({ page }) => {
    await goToGame(page);
    await expect(page.getByText(/Live: Climb Ranks/).first()).toBeVisible();
    await expect(page.getByText(/0\/100 testers|First 100 get/)).not.toBeVisible();
  });

  test("Ranked tab shows ranked content", async ({ page }) => {
    await goToGame(page);
    await page.getByRole("button", { name: /Ranked/i }).click();
    await expect(page.getByText(/Ranked Queue/i)).toBeVisible();
    await expect(page.getByText(/Stake 0.001 ETH/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Coming Soon/i })).toBeVisible();
  });

  test("Profile tab shows profile content", async ({ page }) => {
    await goToGame(page);
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/Profile/i).first()).toBeVisible();
    await expect(page.getByText(/stats and match history/i)).toBeVisible();
  });

  test("switching between Play, Ranked, Profile updates content", async ({ page }) => {
    await goToGame(page);
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Ranked/i }).click();
    await expect(page.getByText(/Ranked Queue/i)).toBeVisible();
    await page.getByRole("button", { name: /Play/i }).click();
    await expect(page.getByText(/Joystick: move/).first()).toBeVisible();
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/stats and match history/i)).toBeVisible();
  });
});
