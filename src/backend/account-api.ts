import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { DateTime } from "luxon";
import {
  memberProfiles,
  memberConsents,
  memberRequests,
  calculationEvents,
} from "../data/schema";
import {
  profileSchema,
  consentVersion,
  type AccountUser,
} from "../domain/account";
import { accountDb, pool } from "./database";
import { identify, ApiError, requireStaff } from "./identity";
import { calculateNew, birthSchema } from "../domain/bazi/engine";
import { calculateQimen } from "../domain/qimen/engine";
import { calculateGua } from "../domain/feng-shui/gua";
import { calculateLocalMonth } from "../domain/calendar/hours";

const calculationSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bazi"), input: birthSchema }),
  z.object({ kind: z.literal("gua"), input: birthSchema }),
  z.object({
    kind: z.literal("qimen"),
    input: birthSchema,
    options: z.object({
      system: z.enum(["chaibu", "manual"]),
      ju: z.number().int().min(1).max(9),
      dun: z.enum(["yang", "yin"]),
    }),
  }),
  z.object({
    kind: z.literal("calendar"),
    year: z.number().int().min(1901).max(2099),
    month: z.number().int().min(1).max(12),
    clock: z.object({
      city: z.string().max(120),
      timezone: z
        .string()
        .max(80)
        .refine((v) => DateTime.now().setZone(v).isValid),
      longitude: z.number().min(-180).max(180),
      timeMode: z.enum(["civil", "mean-solar"]),
      dayBoundary: z.enum(["midnight", "zi"]),
    }),
  }),
]);
export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Ожидается JSON.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Пустой запрос.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      throw new ApiError(413, "Слишком большой запрос.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "Некорректный запрос.");
  }
}
async function profile(user: AccountUser) {
  return (
    (
      await accountDb()
        .select()
        .from(memberProfiles)
        .where(eq(memberProfiles.userId, user.id))
    )[0] ?? null
  );
}
async function acceptedProfile(user: AccountUser) {
  const p = await profile(user);
  if (
    !p?.privacyConsent ||
    !p.termsConsent ||
    p.consentVersion !== consentVersion
  )
    throw new ApiError(
      403,
      "Сначала сохраните контакты и согласия в кабинете.",
    );
  return p;
}
function telegramText(
  p: NonNullable<Awaited<ReturnType<typeof profile>>>,
  message: string,
  id: string,
) {
  const b = p.birth;
  return [
    "Заявка на консультацию · Astrowed",
    `Номер: ${id}`,
    `Имя: ${p.name}`,
    `Телефон: ${p.phone}`,
    `Почта: ${p.email}`,
    b
      ? `Пол: ${b.gender === "female" ? "женский" : "мужской"}\nРождение: ${b.date}, ${b.unknownTime ? "время неизвестно" : b.time}\nГород рождения: ${b.city}\nЧасовой пояс: ${b.timezone}\nКоординаты: ${b.latitude}, ${b.longitude}`
      : "Анкета рождения не заполнена",
    p.residence ? `Город проживания: ${p.residence.city}` : "",
    "Нужна консультация.",
    message,
  ]
    .filter(Boolean)
    .join("\n");
}
export async function accountHandler(request: Request): Promise<Response> {
  const origin = request.headers.get("origin");
  const allowed = (
    process.env.ACCOUNT_ALLOWED_ORIGINS || "https://astrowed.amratlas.kz"
  )
    .split(",")
    .map((x) => x.trim());
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    Vary: "Origin",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS";
  }
  const json = (data: unknown, status = 200) =>
    Response.json(data, { status, headers });
  if (origin && !allowed.includes(origin))
    return json({ error: "Источник запроса не разрешён." }, 403);
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  const path =
    new URL(request.url).pathname
      .replace(/^\/api\/account/, "")
      .replace(/\/$/, "") || "/";
  if (path === "/health" && request.method === "GET") return json({ ok: true });
  try {
    const user = await identify(request);
    const db = accountDb();
    if (path === "/me" && request.method === "GET")
      return json({ user, profile: await profile(user) });
    if (path === "/profile" && request.method === "PUT") {
      const data = profileSchema.parse(await readJson(request));
      const values = {
        ...data,
        birth: data.birth ? { ...data.birth, name: data.name } : null,
        userId: user.id,
        email: user.email,
        consentVersion,
        updatedAt: new Date(),
      };
      const p = await db.transaction(async (tx) => {
        const [saved] = await tx
          .insert(memberProfiles)
          .values(values)
          .onConflictDoUpdate({ target: memberProfiles.userId, set: values })
          .returning();
        await tx
          .insert(memberConsents)
          .values({
            userId: user.id,
            version: consentVersion,
            privacy: true,
            terms: true,
            marketing: data.marketingConsent,
          });
        return saved;
      });
      return json({ profile: p });
    }
    if (path === "/calculate" && request.method === "POST") {
      await acceptedProfile(user);
      const body = calculationSchema.parse(await readJson(request));
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(calculationEvents)
        .where(
          and(
            eq(calculationEvents.userId, user.id),
            gte(calculationEvents.createdAt, new Date(Date.now() - 60000)),
          ),
        );
      if (count >= 30)
        throw new ApiError(
          429,
          "Слишком много расчётов. Повторите через минуту.",
        );
      let result: unknown;
      if (body.kind === "bazi") result = calculateNew(body.input);
      else if (body.kind === "gua") result = calculateGua(body.input);
      else if (body.kind === "qimen")
        result = calculateQimen(body.input, body.options);
      else result = calculateLocalMonth(body.year, body.month, body.clock);
      await db
        .insert(calculationEvents)
        .values({ userId: user.id, kind: body.kind });
      return json(result);
    }
    if (path === "/events/compass" && request.method === "POST") {
      await acceptedProfile(user);
      await db.transaction(async tx => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);
        const [recent] = await tx.select({ id: calculationEvents.id }).from(calculationEvents).where(and(eq(calculationEvents.userId, user.id), eq(calculationEvents.kind, "compass"), gte(calculationEvents.createdAt, new Date(Date.now() - 60000)))).limit(1);
        if (!recent) await tx.insert(calculationEvents).values({ userId: user.id, kind: "compass" });
      });
      return json({ ok: true });
    }
    if (path === "/requests" && request.method === "GET")
      return json({
        requests: await db
          .select({
            id: memberRequests.id,
            message: memberRequests.message,
            status: memberRequests.status,
            createdAt: memberRequests.createdAt,
          })
          .from(memberRequests)
          .where(eq(memberRequests.userId, user.id))
          .orderBy(desc(memberRequests.createdAt))
          .limit(25),
      });
    if (path === "/requests" && request.method === "POST") {
      const p = await acceptedProfile(user);
      const body = z
        .object({
          id: z.uuid(),
          message: z.string().trim().max(1500),
          telegramConsent: z.literal(true),
        })
        .strict()
        .parse(await readJson(request));
      if (!p.birth)
        throw new ApiError(
          400,
          "Заполните анкету рождения перед отправкой заявки.",
        );
      if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID)
        throw new ApiError(
          503,
          "Отправка заявок временно недоступна. Свяжитесь с экспертом через раздел консультаций.",
        );
      const existing = (
        await db
          .select()
          .from(memberRequests)
          .where(
            and(
              eq(memberRequests.id, body.id),
              eq(memberRequests.userId, user.id),
            ),
          )
      )[0];
      if (existing) return json({ id: existing.id, status: existing.status });
      const row = await db.transaction(async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${user.id}))`,
        );
        const [recent] = await tx
          .select({ id: memberRequests.id })
          .from(memberRequests)
          .where(
            and(
              eq(memberRequests.userId, user.id),
              gte(memberRequests.createdAt, new Date(Date.now() - 60000)),
            ),
          )
          .limit(1);
        if (recent)
          throw new ApiError(
            429,
            "Заявка уже принята. Подождите минуту перед повторной отправкой.",
          );
        return (
          await tx
            .insert(memberRequests)
            .values({
              id: body.id,
              userId: user.id,
              message: body.message,
              snapshot: { ...p, telegramConsent: true, consentVersion },
            })
            .returning()
        )[0];
      });
      try {
        const sent = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: telegramText(p, body.message, row.id),
            }),
            signal: AbortSignal.timeout(12000),
          },
        );
        const result = await sent.json();
        if (!sent.ok || !result.ok) throw new Error();
        await db
          .update(memberRequests)
          .set({ status: "sent", sentAt: new Date() })
          .where(eq(memberRequests.id, row.id));
        return json({ id: row.id, status: "sent" });
      } catch {
        await db
          .update(memberRequests)
          .set({ status: "delivery_unknown" })
          .where(eq(memberRequests.id, row.id));
        return json(
          {
            id: row.id,
            status: "delivery_unknown",
            message:
              "Заявка сохранена, но доставка в Telegram не подтверждена. Эксперт увидит её в кабинете.",
          },
          202,
        );
      }
    }
    if (path.startsWith("/admin/")) {
      requireStaff(user);
      if (request.method !== "GET")
        throw new ApiError(405, "Метод не поддерживается.");
      if (path === "/admin/stats") {
        const now = DateTime.now().setZone("Asia/Almaty");
        const [counts, genders, calculators] = await Promise.all([
          db
            .select({
              today: sql<number>`count(*) filter (where ${memberProfiles.createdAt} >= ${now.startOf("day").toJSDate()})::int`,
              month: sql<number>`count(*) filter (where ${memberProfiles.createdAt} >= ${now.startOf("month").toJSDate()})::int`,
              year: sql<number>`count(*) filter (where ${memberProfiles.createdAt} >= ${now.startOf("year").toJSDate()})::int`,
              total: sql<number>`count(*)::int`,
            })
            .from(memberProfiles),
          db
            .select({
              gender: sql<string>`coalesce(${memberProfiles.birth}->>'gender', 'unknown')`,
              count: sql<number>`count(*)::int`,
            })
            .from(memberProfiles)
            .groupBy(
              sql`coalesce(${memberProfiles.birth}->>'gender', 'unknown')`,
            ),
          db
            .select({
              kind: calculationEvents.kind,
              count: sql<number>`count(*)::int`,
            })
            .from(calculationEvents)
            .groupBy(calculationEvents.kind),
        ]);
        return json({
          counts: counts[0],
          genders,
          calculators,
          timezone: "Asia/Almaty",
        });
      }
      if (path === "/admin/profiles") {
        const page = Math.max(
          0,
          Math.min(
            10000,
            Number(new URL(request.url).searchParams.get("page")) || 0,
          ),
        );
        return json({
          profiles: await db
            .select()
            .from(memberProfiles)
            .orderBy(desc(memberProfiles.createdAt))
            .limit(25)
            .offset(Math.floor(page) * 25),
        });
      }
      if (path === "/admin/requests")
        return json({
          requests: await db
            .select()
            .from(memberRequests)
            .orderBy(desc(memberRequests.createdAt))
            .limit(100),
        });
    }
    throw new ApiError(404, "Раздел не найден.");
  } catch (e) {
    if (e instanceof ApiError) return json({ error: e.message }, e.status);
    if (e instanceof z.ZodError)
      return json({ error: e.issues[0]?.message || "Проверьте данные." }, 400);
    console.error("Account API request failed", { path });
    return json(
      { error: "Не удалось выполнить запрос. Повторите позже." },
      503,
    );
  }
}
export default { fetch: accountHandler };
