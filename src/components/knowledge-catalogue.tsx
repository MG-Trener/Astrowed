import Link from "next/link";
import { KnowledgeCardArt } from "./knowledge-artwork";
import {
  libraryCategoryLabel,
  librarySection,
} from "@/data/library-categories";

type Card = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  categoryId: string | null;
  symbol: string | null;
};

const sections = [
  {
    id: "bazi",
    title: "Ба Цзы",
    description:
      "От устройства карты рождения к стихиям, отношениям и периодам.",
  },
  {
    id: "feng-shui",
    title: "Фэншуй",
    description: "Личное Гуа, компас и ориентиры в пространстве.",
  },
  {
    id: "qimen",
    title: "Ци Мэнь",
    description: "Девять дворцов, восемь дверей и язык символов карты.",
  },
];

export function KnowledgeCatalogue({ articles }: { articles: Card[] }) {
  return (
    <div className="library-catalogue" id="articles">
      {sections.map((section) => {
        const entries = articles.filter(
          (a) => librarySection(a.categoryId) === section.id,
        );
        if (!entries.length) return null;
        return (
          <section
            className="library-section"
            key={section.id}
            aria-labelledby={`library-${section.id}`}
          >
            <header className="library-section-heading">
              <div>
                <div className="eyebrow">
                  НАПРАВЛЕНИЕ /{" "}
                  {String(sections.indexOf(section) + 1).padStart(2, "0")}
                </div>
                <h2 id={`library-${section.id}`}>{section.title}</h2>
                <p>{section.description}</p>
              </div>
              <span className="library-section-count">
                {String(entries.length).padStart(2, "0")}{" "}
                <span>в разделе</span>
              </span>
            </header>
            <div className="knowledge-grid">
              {entries.map((a) => (
                <Link
                  key={a.id}
                  href={`/knowledge/${a.slug}`}
                  className="knowledge-item"
                >
                  <KnowledgeCardArt symbol={a.symbol} slug={a.slug} />
                  <div className="symbol">{a.symbol}</div>
                  <div className="eyebrow">
                    {libraryCategoryLabel(a.categoryId)}
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.summary}</p>
                  <span className="text-button">Читать статью ↗</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
