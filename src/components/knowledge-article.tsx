import Image from "next/image";
import Link from "next/link";
import { articleArtwork } from "@/assets/library-artwork";
import { libraryArticles, type KnowledgeEntry } from "@/data/library";
import {
  libraryCategoryLabel,
  librarySection,
  referenceLabel,
} from "@/data/library-categories";
export function KnowledgeArticle({ article }: { article: KnowledgeEntry }) {
  const art = articleArtwork(article.slug, article.symbol);
  const section = librarySection(article.categoryId);
  const destination =
    section === "qimen"
      ? { href: "/qimen", label: "Рассчитать карту Ци Мэнь" }
      : section === "feng-shui"
        ? article.slug === "feng-shui-compass"
          ? { href: "/feng-shui/compass", label: "Открыть Компас Фэн Шуй" }
          : { href: "/feng-shui/gua", label: "Рассчитать личное Гуа" }
        : { href: "/calculator", label: "Перейти к своей карте" };
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
            {libraryCategoryLabel(article.categoryId)} ·{" "}
            {Math.max(1, Math.ceil(article.body.split(/\s+/).length / 150))} МИН
            ЧТЕНИЯ
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
            {references.map((url) => (
              <p key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {referenceLabel(url)} ↗
                </a>
              </p>
            ))}
          </details>
        )}
        <Link href={destination.href} className="button primary">
          {destination.label} ↗
        </Link>
        <nav className="related-reading" aria-label="Читать дальше">
          <h2>Продолжить знакомство</h2>
          {libraryArticles
            .filter(
              (a) =>
                a.slug !== article.slug &&
                librarySection(a.categoryId) === section,
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
