import { afterEach, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@neondatabase/auth", () => ({
  createAuthClient: () => ({ getSession }),
}));
vi.mock("@neondatabase/auth/vanilla", () => ({
  BetterAuthVanillaAdapter: () => ({}),
}));
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

it("uses the Neon session JWT when requesting the cabinet", async () => {
  vi.stubEnv("NEXT_PUBLIC_NEON_AUTH_URL", "https://auth.example.test/auth");
  vi.stubEnv("NEXT_PUBLIC_ACCOUNT_API_URL", "https://api.example.test");
  getSession.mockResolvedValue({ data: { session: { token: "test-jwt" } } });
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ profile: null }));
  vi.stubGlobal("fetch", fetchMock);
  const { accountFetch } = await import("../src/services/account-client");
  await accountFetch("/me");
  expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/me", expect.objectContaining({
    headers: { Authorization: "Bearer test-jwt" }, method: "GET",
  }));
});

it("does not request private data without a session", async () => {
  vi.stubEnv("NEXT_PUBLIC_NEON_AUTH_URL", "https://auth.example.test/auth");
  vi.stubEnv("NEXT_PUBLIC_ACCOUNT_API_URL", "https://api.example.test");
  getSession.mockResolvedValue({ data: null });
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const { accountFetch } = await import("../src/services/account-client");
  await expect(accountFetch("/me")).rejects.toThrow("Войдите");
  expect(fetchMock).not.toHaveBeenCalled();
});
