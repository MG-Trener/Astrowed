"use server";
import { login, logout, checkOrigin } from "@/services/auth";
import { redirect } from "next/navigation";
// Single-process guard for the private development workspace. Distributed
// throttling is required before exposing this sign-in endpoint publicly.
const attempts = new Map<string, { count: number; until: number }>();
export async function signIn(_prev: { error: string }, data: FormData) {
  try {
    await checkOrigin();
    const bucket = attempts.get("workspace");
    if (bucket && bucket.until > Date.now() && bucket.count >= 8)
      return { error: "Слишком много попыток. Повторите через 15 минут." };
    await login(String(data.get("password") ?? ""));
    attempts.delete("workspace");
  } catch (error) {
    const old = attempts.get("workspace");
    attempts.set("workspace", {
      count: old && old.until > Date.now() ? old.count + 1 : 1,
      until:
        old && old.until > Date.now() ? old.until : Date.now() + 15 * 60000,
    });
    return {
      error: error instanceof Error ? error.message : "Не удалось войти.",
    };
  }
  redirect("/clients");
}
export async function signOut() {
  await checkOrigin();
  await logout();
  redirect("/");
}
