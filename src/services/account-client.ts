"use client";
import {
  createAuthClient,
  type VanillaBetterAuthClient,
} from "@neondatabase/auth";
import { BetterAuthVanillaAdapter } from "@neondatabase/auth/vanilla";
export const accountConfigured = Boolean(
  process.env.NEXT_PUBLIC_NEON_AUTH_URL &&
  process.env.NEXT_PUBLIC_ACCOUNT_API_URL,
);
let instance: VanillaBetterAuthClient | undefined;
export function memberAuth() {
  if (!process.env.NEXT_PUBLIC_NEON_AUTH_URL)
    throw new Error(
      "Регистрация готовится к запуску. Пожалуйста, зайдите позже.",
    );
  instance ??= createAuthClient(process.env.NEXT_PUBLIC_NEON_AUTH_URL, {
    adapter: BetterAuthVanillaAdapter({
      fetchOptions: { credentials: "include" },
    }),
  });
  return instance;
}
export async function accountFetch<T>(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  if (!accountConfigured) throw new Error("Кабинет готовится к запуску.");
  // Neon injects the JWT into getSession().session.token. Its token()
  // endpoint can return the cached session shape in this SDK version.
  const { data: credentials } = await memberAuth().getSession();
  const token = credentials?.session?.token;
  if (!token) throw new Error("Войдите в кабинет, чтобы продолжить.");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ACCOUNT_API_URL!.replace(/\/$/, "")}${path}`,
    {
      method: body === undefined ? "GET" : method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    },
  );
  const value = await response.json();
  if (!response.ok)
    throw new Error(value.error || "Не удалось выполнить запрос.");
  return value;
}
