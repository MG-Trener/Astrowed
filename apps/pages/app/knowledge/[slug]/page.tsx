import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "../../../content";
export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();
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
        <p className="method-note">
          Редакционный статус: материал требует экспертной проверки. Используйте
          как вводный справочник.
        </p>
        <p className="method-note">
          Источник календарного адаптера:{" "}
          <a
            href="https://6tail.cn/calendar/api.html"
            target="_blank"
            rel="noreferrer"
          >
            документация lunar
          </a>
          .
        </p>
        <Link href="/explore" className="button">
          Исследовать связи элементов ↗
        </Link>
      </article>
    </div>
  );
}
