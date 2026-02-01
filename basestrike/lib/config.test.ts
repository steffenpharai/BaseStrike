import { describe, it, expect } from "vitest";
import { config } from "./config";

describe("config", () => {
  it("exports miniapp config with domain and urls", () => {
    expect(config.miniapp).toBeDefined();
    expect(config.miniapp.domain).toBeDefined();
    expect(config.miniapp.homeUrl).toBeDefined();
    expect(config.miniapp.webhookUrl).toContain("/api/webhook");
  });

  it("exports session and network config", () => {
    expect(config.session.secret).toBeDefined();
    expect(config.network.chainId).toBe(84532);
    expect(config.network.rpcUrl).toBeDefined();
  });

  it("exports isDev and isProduction", () => {
    expect(typeof config.isDev).toBe("boolean");
    expect(typeof config.isProduction).toBe("boolean");
    expect(config.isDev).not.toBe(config.isProduction);
  });
});
