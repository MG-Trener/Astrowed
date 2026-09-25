import Image from "next/image";
import Link from "next/link";
import { articleArtwork } from "@/assets/library-artwork";
import { libraryArticles, type KnowledgeEntry } from "@/data/library";
export function KnowledgeArticle({ article }: { article: KnowledgeEntry }) {
  const art = articleArtwork(article.slug, article.symbol);
  const sections = article.body.split(/\n\s*\n/);
  const references = article.references
    .split("\n")
    .filter((r) => /^https?:\/\//.test(r));
  return (
    <div className="page-wrap article-page">
      <article className="article">
        <Link href="/knowledge" className="back-link">
          ← БИБЛИОТЕКА
        </Link>
        <header className="article-heading">
          <div className="eyebrow">
            {article.categoryId === "elements"
              ? "ПЯТЬ ЭЛЕМЕНТОВ"
              : "ОСНОВЫ БА ЦЗЫ"}{" "}
            · {Math.max(1, Math.ceil(article.body.split(/\s+/).length / 150))}{" "}
            МИН ЧТЕНИЯ
          </div>
          <h1>{article.title}</h1>
          <p className="muted">{article.summary}</p>
        </header>
        <figure className="article-hero celestial-art">
          <Image
            src={art.image}
            alt={art.alt}
            priority
            sizes="(max-width: 800px) 100vw, 850px"
          />
          <figcaption>Художественный образ темы</figcaption>
        </figure>
        <div className="article-body article-sections">
          {sections.map((text, i) =>
            text.startsWith("## ") ? (
              <h2 key={i}>{text.slice(3)}</h2>
            ) : (
              <p key={i}>{text}</p>
            ),
          )}
        </div>
        {article.requiresExpertReview && (
          <p className="method-note">
            Вводный справочник по традиционной модели. Материал требует
            экспертной проверки; толкование зависит от контекста всей карты.
          </p>
        )}
        {references.length > 0 && (
          <details className="compact-tool-help">
            <summary>Источники и методика</summary>
            {references.map((url, i) => (
              <p key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url.includes("hko.gov")
                    ? "Hong Kong Observatory · календарные основы"
                    : "lunar · документация календарного расчёта"}{" "}
                  ↗
                </a>
              </p>
            ))}
          </details>
        )}
        <Link href="/calculator" className="button primary">
          Перейти к своей карте ↗
        </Link>
        <nav className="related-reading" aria-label="Читать дальше">
          <h2>Продолжить знакомство</h2>
          {libraryArticles
            .filter(
              (a) => a.slug !== article.slug && a.categoryId !== "elements",
            )
            .slice(0, 3)
            .map((a) => (
              <Link key={a.slug} href={`/knowledge/${a.slug}`}>
                {a.title} ↗
              </Link>
            ))}
        </nav>
      </article>
    </div>
  );
}
