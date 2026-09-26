import { eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { charts, auditLogs } from "@/data/schema";
import { isAuthenticated, checkOrigin } from "@/services/auth";
import { generatePdf } from "@/services/pdf";
import { z } from "zod";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated()))
    return Response.json({ error: "Войдите в кабинет." }, { status: 401 });
  try {
    await checkOrigin();
    const raw = await request.text();
    let payload: unknown = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      return Response.json(
        { error: "Неверный формат параметров отчёта." },
        { status: 400 },
      );
    }
    const parsed = z
      .object({
        level: z.enum(["brief", "full", "professional"]).default("full"),
        comment: z.string().max(5000).optional(),
      })
      .safeParse(payload);
    if (!parsed.success)
      return Response.json(
        { error: "Проверьте формат отчёта и длину комментария." },
        { status: 400 },
      );
    const { id } = await params;
    if (!/^[0-9a-f-]{36}$/i.test(id))
      return Response.json({ error: "Карта не найдена." }, { status: 404 });
    const db = getDb();
    const [chart] = await db.select().from(charts).where(eq(charts.id, id));
    if (!chart)
      return Response.json({ error: "Карта не найдена." }, { status: 404 });
    const pdf = await generatePdf(chart.result, parsed.data);
    await db
      .insert(auditLogs)
      .values({ action: "report.created", entityId: chart.id });
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="astrowed-${id.slice(0, 8)}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "Не удалось сформировать PDF. Проверьте доступность Chromium на сервере.",
      },
      { status: 503 },
    );
  }
}
