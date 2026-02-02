import { test, expect } from "@playwright/test";

/** Complete new onboarding (3 screens) and reach main app with Watch/Bet/Profile. */
async function completeOnboarding(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(
    page.getByText(/Moltbots play|Get started|Next/i).first()
  ).toBeVisible({ timeout: 5000 });
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

test.describe("Home", () => {
  test("page loads and shows BaseRift or onboarding", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/BaseRift|Moltbots play|Loading/i).or(
        page.getByRole("button", { name: /Next|Get started/i })
      ).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("onboarding shows and can be completed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Moltbots play|Get started|Next/i).first()).toBeVisible({ timeout: 5000 });
    const nextBtn = page.getByRole("button", { name: /^(Next|Get started)$/i });
    for (let i = 0; i < 3; i++) {
      await nextBtn.first().click();
      await page.waitForTimeout(400);
      if (await page.getByRole("button", { name: /Watch/i }).first().isVisible().catch(() => false)) break;
    }
    await expect(page.getByRole("button", { name: /Watch/i }).first()).toBeVisible({ timeout: 5000 });
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
  test("first screen shows Moltbots play and Next", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Moltbots play/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /^(Next|Get started)$/i }).first()).toBeVisible();
  });

  test("complete onboarding → main app with Watch tab", async ({ page }) => {
    await completeOnboarding(page);
    await expect(page.getByText(/Watch/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Watch/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Bet/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Profile/i })).toBeVisible();
  });
});

test.describe("UI navigation (Watch / Bet / Profile)", () => {
  test("Watch tab shows match list or empty state", async ({ page }) => {
    await completeOnboarding(page);
    await expect(page.getByText(/Watch/i).first()).toBeVisible();
    await expect(
      page.getByText(/Live|Upcoming|Finished|No matches yet|Loading matches/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("Bet tab shows bet content", async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole("button", { name: /Bet/i }).click();
    await expect(page.getByText(/Bet/i).first()).toBeVisible();
    await expect(
      page.getByText(/Pick ETH or SOL|Betting coming soon|No open or live/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("Profile tab shows profile content", async ({ page }) => {
    await completeOnboarding(page);
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/Profile/i).first()).toBeVisible();
    await expect(page.getByText(/stats and match history|Help us test/i).first()).toBeVisible();
  });

  test("switching between Watch, Bet, Profile updates content", async ({ page }) => {
    await completeOnboarding(page);
    await expect(page.getByText(/Watch/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Bet/i }).click();
    await expect(page.getByText(/Pick ETH or SOL|Betting/i).first()).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /Watch/i }).click();
    await expect(page.getByText(/Watch/i).first()).toBeVisible();
    await page.getByRole("button", { name: /Profile/i }).click();
    await expect(page.getByText(/Help us test|Profile/i).first()).toBeVisible();
  });

  test("Watch live match shows game canvas when available", async ({ page }) => {
    await completeOnboarding(page);
    await expect(page.getByText(/Watch/i).first()).toBeVisible();
    await expect(
      page.getByText(/Live|Upcoming|Finished|No matches yet|Loading/i).first()
    ).toBeVisible({ timeout: 10000 });
    const watchMatchBtn = page.getByRole("button", { name: /Watch match/ });
    const count = await watchMatchBtn.count();
    if (count > 0) {
      await watchMatchBtn.first().click();
      await expect(page.getByText(/Live:/i).first()).toBeVisible({ timeout: 5000 });
      await expect(page.locator(".game-container").first()).toBeVisible({ timeout: 20000 });
    }
  });
});

test.describe("API", () => {
  test("GET /api/matches returns matches array", async ({ request }) => {
    const res = await request.get("/api/matches");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("matches");
    expect(Array.isArray(body.matches)).toBe(true);
  });
});
