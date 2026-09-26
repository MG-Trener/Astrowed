"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAuth, checkOrigin } from "@/services/auth";
import { getDb } from "@/data/db";
import { articles, auditLogs } from "@/data/schema";
export async function saveArticle(
  _prev: { error: string; success: boolean },
  form: FormData,
) {
  try {
    await requireAuth();
    await checkOrigin();
    const raw = Object.fromEntries(form);
    const value = z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(100),
        title: z.string().trim().min(1).max(200),
        symbol: z.string().max(10),
        summary: z.string().max(500),
        body: z.string().min(1).max(50000),
        references: z.string().max(3000),
        categoryId: z.enum(["elements", "foundations"]),
      })
      .parse(raw);
    const values = {
      ...value,
      published: raw.published === "on",
      requiresExpertReview: raw.requiresExpertReview === "on",
      updatedAt: new Date(),
    };
    await getDb().transaction(async (tx) => {
      let result;
      if (raw.id) {
        const id = z.uuid().parse(raw.id);
        [result] = await tx
          .update(articles)
          .set(values)
          .where(eq(articles.id, id))
          .returning();
      } else {
        [result] = await tx.insert(articles).values(values).returning();
      }
      if (!result) throw new Error("Not found");
      await tx
        .insert(auditLogs)
        .values({ action: "knowledge.saved", entityId: result.id });
    });
    revalidatePath("/knowledge");
    revalidatePath(`/knowledge/${value.slug}`);
    revalidatePath("/admin/knowledge");
    return { error: "", success: true };
  } catch {
    return {
      error:
        "Не удалось сохранить. Проверьте уникальность адреса и заполнение полей.",
      success: false,
    };
  }
}
