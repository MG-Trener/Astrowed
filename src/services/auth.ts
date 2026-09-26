import "server-only";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual, createHash } from "node:crypto";
const cookieName = "astrowed-session";
export const workspaceConfigured = () =>
  !!process.env.WORKSPACE_PASSWORD &&
  !!process.env.SESSION_SECRET &&
  process.env.SESSION_SECRET.length >= 32;
export async function isAuthenticated() {
  if (!workspaceConfigured()) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.SESSION_SECRET),
      { issuer: "astrowed", audience: "consultant" },
    );
    return true;
  } catch {
    return false;
  }
}
export async function requireAuth() {
  if (!(await isAuthenticated()))
    throw new Error(
      "Войдите в кабинет консультанта для доступа к сохранённым данным.",
    );
}
export async function checkOrigin() {
  const h = await headers();
  const origin = h.get("origin"),
    host = h.get("host");
  if (!origin || new URL(origin).host !== host)
    throw new Error("Запрос с другого сайта отклонён.");
}
export async function login(password: string) {
  if (!workspaceConfigured())
    throw new Error(
      "Для включения кабинета настройте WORKSPACE_PASSWORD и SESSION_SECRET в ENV.",
    );
  const hash = (v: string) => createHash("sha256").update(v).digest();
  if (!timingSafeEqual(hash(password), hash(process.env.WORKSPACE_PASSWORD!)))
    throw new Error("Неверный пароль.");
  const token = await new SignJWT({ role: "consultant" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("astrowed")
    .setAudience("consultant")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 3600,
    path: "/",
  });
}
export async function logout() {
  (await cookies()).delete(cookieName);
}
