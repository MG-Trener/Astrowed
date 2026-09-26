import { describe, it, expect, vi } from "vitest";
import {
  accountRole,
  profileSchema,
  safeReturnPath,
} from "../src/domain/account";
import { demoInput } from "../src/domain/bazi/engine";
import { accountHandler, readJson } from "../src/backend/account-api";
import { identify, requireStaff, ApiError } from "../src/backend/identity";

describe("account authorization boundary", () => {
  it("only grants staff to the two verified exact email addresses", () => {
    expect(accountRole("mihagavr@gmail.com", true)).toBe("admin");
    expect(accountRole("kievica1989@mail.ru", true)).toBe("expert");
    expect(accountRole("MIHAGAVR@gmail.com", true)).toBe("admin");
    expect(accountRole("mihagavr@gmail.com", false)).toBe("client");
    expect(accountRole("mihagavr+admin@gmail.com", true)).toBe("client");
    expect(accountRole("mihagavr@gmail.com.evil.test", true)).toBe("client");
  });
  it("rejects non-staff", () => {
    expect(() =>
      requireStaff({
        id: "a",
        email: "client@example.test",
        name: "Client",
        role: "client",
      }),
    ).toThrow(ApiError);
  });
  it("requires a signed identity before any database access", async () => {
    await expect(
      identify(new Request("https://api.example.test/me")),
    ).rejects.toMatchObject({ status: 401 });
    for (const path of [
      "/me",
      "/admin/stats",
      "/admin/profiles",
      "/requests",
      "/calculate",
    ]) {
      const r = await accountHandler(
        new Request(`https://api.example.test${path}`, {
          method: path === "/calculate" ? "POST" : "GET",
        }),
      );
      expect(r.status).toBe(401);
      expect(r.headers.get("cache-control")).toBe("no-store");
    }
  });
  it("rejects an untrusted cross-origin request", async () => {
    const r = await accountHandler(
      new Request("https://api.example.test/me", {
        headers: { Origin: "https://evil.example" },
      }),
    );
    expect(r.status).toBe(403);
    expect(r.headers.get("access-control-allow-origin")).toBeNull();
  });
  it("does not accept profile-injected role or owner fields", () => {
    const valid = {
      name: "Анна",
      phone: "+7 701 123 45 67",
      birth: demoInput,
      residence: null,
      privacyConsent: true,
      termsConsent: true,
      marketingConsent: false,
    };
    expect(profileSchema.safeParse(valid).success).toBe(true);
    for (const extra of [
      { role: "admin" },
      { userId: "victim" },
      { email: "mihagavr@gmail.com" },
    ])
      expect(profileSchema.safeParse({ ...valid, ...extra }).success).toBe(
        false,
      );
    expect(
      profileSchema.safeParse({ ...valid, privacyConsent: false }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({
        ...valid,
        birth: { ...demoInput, date: "1990-02-31" },
      }).success,
    ).toBe(false);
  });
  it("limits JSON input without relying on Content-Length", async () => {
    await expect(
      readJson(
        new Request("https://test/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "x".repeat(17000) }),
        }),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });
  it("rejects external callback paths", () => {
    expect(safeReturnPath("//evil.test")).toBe("/account/");
    expect(safeReturnPath("/\\evil.test")).toBe("/account/");
    expect(safeReturnPath("/calculator/")).toBe("/calculator/");
  });
});
