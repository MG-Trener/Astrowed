import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { clients, birthData, charts, auditLogs } from "@/data/schema";
import { calculate } from "@/domain/bazi/engine";
import { requireAuth } from "./auth";
export async function saveChart(raw: unknown, existingClientId?: string) {
  await requireAuth();
  const result = calculate(raw);
  return getDb().transaction(async (tx) => {
    let clientId = existingClientId;
    if (clientId) {
      const [existing] = await tx
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.id, clientId));
      if (!existing) throw new Error("Клиент не найден.");
    } else {
      const [client] = await tx
        .insert(clients)
        .values({ name: result.input.name })
        .returning();
      clientId = client.id;
      await tx
        .insert(auditLogs)
        .values({ action: "client.created", entityId: clientId });
    }
    const i = result.input;
    const [birth] = await tx
      .insert(birthData)
      .values({
        clientId,
        birthDate: i.date,
        birthTime: i.unknownTime ? null : i.time,
        unknownTime: i.unknownTime,
        gender: i.gender,
        city: i.city,
        timezone: i.timezone,
        longitude: i.longitude,
        latitude: i.latitude,
      })
      .returning();
    const [chart] = await tx
      .insert(charts)
      .values({
        clientId,
        birthDataId: birth.id,
        title: i.name,
        input: i,
        result,
        engineVersion: result.method.engineVersion,
        methodId: result.method.id,
        methodVersion: result.method.version,
        timezoneVersion: result.method.timezoneVersion,
      })
      .returning({ id: charts.id });
    await tx
      .insert(auditLogs)
      .values({ action: "chart.created", entityId: chart.id });
    return chart;
  });
}
