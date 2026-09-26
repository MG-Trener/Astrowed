"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth, checkOrigin } from "@/services/auth";
import { getDb } from "@/data/db";
import { clients, consultations, auditLogs } from "@/data/schema";
import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
export async function addConsultation(
  _prev: { error: string; success: boolean },
  form: FormData,
) {
  try {
    await requireAuth();
    await checkOrigin();
    const data = z
      .object({
        clientId: z.uuid(),
        date: z
          .string()
          .refine(
            (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && DateTime.fromISO(v).isValid,
          ),
        topic: z.string().trim().min(1).max(200),
        notes: z.string().max(20000),
        recommendations: z.string().max(10000),
      })
      .parse(Object.fromEntries(form));
    await getDb().transaction(async (tx) => {
      const [client] = await tx
        .select({ id: clients.id })
        .from(clients)
        .where(eq(clients.id, data.clientId));
      if (!client) throw new Error("Клиент не найден.");
      const [row] = await tx.insert(consultations).values(data).returning();
      await tx
        .insert(auditLogs)
        .values({ action: "consultation.created", entityId: row.id });
    });
    revalidatePath(`/clients/${data.clientId}`);
    return { success: true, error: "" };
  } catch {
    return {
      success: false,
      error:
        "Не удалось сохранить консультацию. Проверьте дату, тему и соединение с БД.",
    };
  }
}
