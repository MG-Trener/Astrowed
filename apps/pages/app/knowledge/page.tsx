"use client";
import { useState } from "react";
import Link from "next/link";
import {
  KnowledgeHero,
  KnowledgeCardArt,
} from "@/components/knowledge-artwork";
import { articles } from "../../content";
export default function Page() {
  const [query, setQuery] = useState("");
  const all = articles.filter((a) =>
    `${a.title} ${a.body}`
      .toLocaleLowerCase("ru")
      .includes(query.toLocaleLowerCase("ru")),
  );
  return (
    <div className="page-wrap">
      <KnowledgeHero />
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <input
          className="search-input"
          aria-label="Поиск по академии"
          placeholder="Найти элемент, символ или понятие…"
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div className="knowledge-grid">
        {all.map((a) => (
          <Link
            key={a.id}
            href={`/knowledge/${a.slug}`}
            className="knowledge-item"
          >
            <KnowledgeCardArt symbol={a.symbol} slug={a.slug} />
            <div className="symbol">{a.symbol}</div>
            <div className="eyebrow">
              {a.categoryId === "elements" ? "ПЯТЬ ЭЛЕМЕНТОВ" : "ОСНОВЫ БА ЦЗЫ"}
            </div>
            <h2>{a.title}</h2>
            <p>{a.summary}</p>
            <span className="text-button">Исследовать ↗</span>
          </Link>
        ))}
      </div>
      {!all.length && (
        <div className="empty-state">
          <h2>Ничего не найдено.</h2>
          <p>Попробуйте другое слово или китайский символ.</p>
        </div>
      )}
    </div>
  );
}
