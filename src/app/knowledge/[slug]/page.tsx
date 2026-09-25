import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/data/db";
import { articles } from "@/data/schema";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article] = await getDb()
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)));
  if (!article) notFound();
  const refs = article.references
    .split("\n")
    .filter((ref) => /^https?:\/\//.test(ref));
  return (
    <div className="page-wrap">
      <article className="article">
        <Link href="/knowledge" className="back-link">
          ← АКАДЕМИЯ БА ЦЗЫ
        </Link>
        <div className="eyebrow" style={{ marginTop: 45 }}>
          {article.categoryId === "elements"
            ? "ПЯТЬ ЭЛЕМЕНТОВ"
            : "ОСНОВЫ БА ЦЗЫ"}
        </div>
        <h1>{article.title}</h1>
        <p className="muted">{article.summary}</p>
        <div className="article-body">{article.body}</div>
        {article.requiresExpertReview && (
          <p className="method-note">
            Редакционный статус: материал требует экспертной проверки.
            Используйте как вводный справочник.
          </p>
        )}
        <p className="method-note">
          Источники:{" "}
          {refs.map((r, i) => (
            <a key={r} href={r} target="_blank" rel="noreferrer">
              [{i + 1}]{" "}
            </a>
          ))}
        </p>
        <Link href="/explore" className="button">
          Исследовать связи элементов ↗
        </Link>
      </article>
    </div>
  );
}
