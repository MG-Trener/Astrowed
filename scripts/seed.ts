import "dotenv/config";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { LunarUtil } from "lunar-typescript";
import {
  elements,
  stems,
  branches,
  animals,
  stemElement,
  tenGodNames,
} from "../src/domain/bazi/catalog";
import * as s from "../src/data/schema";
if (process.env.ALLOW_DB_MIGRATION !== "true")
  throw new Error(
    "Seeding requires ALLOW_DB_MIGRATION=true for the verified development database.",
  );
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  max: 1,
});
const db = drizzle(pool);
try {
  await db.transaction(async (tx) => {
    await tx
      .insert(s.categories)
      .values([
        { id: "elements", name: "Пять элементов", position: 0 },
        { id: "foundations", name: "Основы Ба Цзы", position: 1 },
      ])
      .onConflictDoNothing();
    for (const [i, e] of elements.entries()) {
      await tx
        .insert(s.elementRecords)
        .values({
          id: e.id,
          name: e.name,
          symbol: e.symbol,
          color: e.color,
          position: i,
        })
        .onConflictDoNothing();
      await tx
        .insert(s.articles)
        .values({
          slug: e.id,
          title: `${e.name} · ${e.symbol}`,
          symbol: e.symbol,
          categoryId: "elements",
          summary: e.quality,
          body: `${e.description}\n\nНебесные стволы: ${e.stems}. Земные ветви: ${e.branches}.\n\nВ цикле порождения ${e.name} порождает ${elements[(i + 1) % 5].name.toLowerCase()}. В цикле контроля воздействует на ${elements[(i + 2) % 5].name.toLowerCase()}.\n\nЭти соответствия описывают традиционную модель У Син. Для интерпретации индивидуальной карты необходимо учитывать сезон, корни, связи и принятую школу анализа. Изолированный элемент не определяет личность и не предсказывает события.`,
          references: "https://6tail.cn/calendar/api.html",
          published: true,
          requiresExpertReview: true,
        })
        .onConflictDoNothing();
    }
    for (const [i, stem] of stems.entries())
      await tx
        .insert(s.heavenlyStems)
        .values({
          symbol: stem,
          elementId: stemElement(stem),
          polarity: i % 2 === 0 ? "yang" : "yin",
          position: i,
        })
        .onConflictDoNothing();
    for (const [i, branch] of branches.entries()) {
      await tx
        .insert(s.earthlyBranches)
        .values({ symbol: branch, animal: animals[i], position: i })
        .onConflictDoNothing();
      for (const [j, stem] of (LunarUtil.ZHI_HIDE_GAN[branch] ?? []).entries())
        await tx
          .insert(s.hiddenStems)
          .values({ branch, stem, position: j })
          .onConflictDoNothing();
    }
    for (const [symbol, name] of Object.entries(tenGodNames))
      if (symbol !== "日主")
        await tx
          .insert(s.tenGods)
          .values({ symbol, name })
          .onConflictDoNothing();
    await tx
      .insert(s.articles)
      .values({
        slug: "four-pillars",
        title: "Четыре столпа: как читать карту",
        symbol: "四柱",
        categoryId: "foundations",
        summary: "Год, месяц, день и час — четыре координаты момента рождения.",
        body: "Каждый столп состоит из небесного ствола и земной ветви. Вместе четыре пары образуют восемь знаков — Ба Цзы.\n\nСтвол дня называют Господином дня (日主). Относительно него определяются десять богов — традиционные категории отношений между элементами и полярностями.\n\nВ этой реализации граница года — точный момент Ли Чунь, границы месяцев — солнечные термины цзе. Граница дня задаётся в настройках. Часовой пояс учитывается по дате рождения, а не по текущему смещению браузера.\n\nИзучая карту, различайте вычисляемые календарные факты и их интерпретацию. Школы Ба Цзы могут использовать разные правила.",
        references:
          "https://github.com/6tail/lunar-typescript\nhttps://6tail.cn/calendar/api.html",
        published: true,
        requiresExpertReview: true,
      })
      .onConflictDoNothing();
    const all = await tx.select().from(s.articles);
    for (const [i, e] of elements.entries()) {
      const from = all.find((a) => a.slug === e.id)!,
        to = all.find((a) => a.slug === elements[(i + 1) % 5].id)!;
      await tx
        .insert(s.knowledgeLinks)
        .values({ sourceId: from.id, targetId: to.id, relation: "generation" })
        .onConflictDoNothing();
    }
  });
  console.log(
    "Seed complete: 5 elements, 10 stems, 12 branches, hidden stems, 10 gods, 6 articles, 5 graph edges.",
  );
} catch {
  console.error("Seeding failed. Check database migrations first.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
