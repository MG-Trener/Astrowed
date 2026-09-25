import Link from "next/link";
import {
  KnowledgeHero,
  KnowledgeCardArt,
} from "@/components/knowledge-artwork";
import { and, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
import { mergeLibrary } from "@/data/library";
export const dynamic = "force-dynamic";
export const metadata = { title: "Академия Ба Цзы" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  let all: (typeof articles.$inferSelect)[] = [];
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
    // The bundled introductory library remains available without the CMS.
  }
  const visible = mergeLibrary(all).filter((a) =>
    `${a.title} ${a.body} ${a.symbol}`
      .toLocaleLowerCase("ru")
      .includes(q.toLocaleLowerCase("ru")),
  );
  return (
    <div className="page-wrap">
      <KnowledgeHero />
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
      {visible.length ? (
        <div className="knowledge-grid">
          {visible.map((a) => (
            <Link
              key={a.id}
              href={`/knowledge/${a.slug}`}
              className="knowledge-item"
            >
              <KnowledgeCardArt symbol={a.symbol} slug={a.slug} />
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
