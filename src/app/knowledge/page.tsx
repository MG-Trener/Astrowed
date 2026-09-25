import Link from "next/link";
import { and, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
export const dynamic = "force-dynamic";
export const metadata = { title: "Академия Ба Цзы" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  let all: (typeof articles.$inferSelect)[] = [];
  let unavailable = false;
  try {
    const pattern = `%${q.slice(0, 100).replace(/[\\%_]/g, "\\$&")}%`;
    all = await getDb()
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.published, true),
          q
            ? or(
                ilike(articles.title, pattern),
                ilike(articles.body, pattern),
                ilike(articles.symbol, pattern),
              )
            : undefined,
        ),
      );
  } catch {
    unavailable = true;
  }
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">ACADEMY / БАЗА ЗНАНИЙ</div>
          <h1>Язык, на котором говорит карта.</h1>
          <p>
            От первого символа до системы взаимосвязей. Материалы для
            внимательного исследования Ба Цзы.
          </p>
        </div>
        <Link className="button" href="/knowledge/graph">
          Граф знаний ↗
        </Link>
      </div>
      <form role="search">
        <input
          className="search-input"
          name="q"
          aria-label="Поиск по академии"
          placeholder="Найти элемент, символ или понятие…"
          defaultValue={q}
          maxLength={100}
        />
        <button className="text-button">Найти →</button>
      </form>
      {unavailable ? (
        <div className="empty-state">
          <h2>Библиотека временно недоступна.</h2>
          <p>
            Не удалось прочитать материалы из базы. Попробуйте обновить страницу
            позже.
          </p>
        </div>
      ) : all.length ? (
        <div className="knowledge-grid">
          {all.map((a) => (
            <Link
              key={a.id}
              href={`/knowledge/${a.slug}`}
              className="knowledge-item"
            >
              <div className="symbol">{a.symbol}</div>
              <div className="eyebrow">
                {a.categoryId === "elements"
                  ? "ПЯТЬ ЭЛЕМЕНТОВ"
                  : "ОСНОВЫ БА ЦЗЫ"}
              </div>
              <h2>{a.title}</h2>
              <p>{a.summary}</p>
              <span className="text-button">Исследовать ↗</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>{q ? "Ничего не найдено." : "Академия готовится к открытию."}</h2>
          <p>
            {q
              ? "Попробуйте другое слово или китайский символ."
              : "Опубликованные материалы появятся здесь."}
          </p>
        </div>
      )}
    </div>
  );
}
