"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { articleArtwork } from "@/assets/library-artwork";
import {
  learningPaths,
  neighborsOf,
  resolveKnowledgeEdges,
  type KnowledgeNode,
  type StoredKnowledgeEdge,
} from "@/data/knowledge-map";

export function KnowledgeGraph({
  nodes,
  edges = [],
}: {
  nodes: KnowledgeNode[];
  edges?: StoredKnowledgeEdge[];
}) {
  const first =
    nodes.find((n) => n.slug === "four-pillars")?.slug ?? nodes[0]?.slug ?? "";
  const [selected, setSelected] = useState(first);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [pathId, setPathId] = useState("");
  const currentHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const sync = () => {
      const slug = window.location.hash.slice(1);
      if (nodes.some((n) => n.slug === slug)) {
        setSelected(slug);
        setHistory([]);
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [nodes]);
  function choose(slug: string, remember = true, reveal = false) {
    if (!nodes.some((n) => n.slug === slug) || slug === selected) return;
    if (remember) setHistory((prev) => [...prev, selected].slice(-30));
    setSelected(slug);
    window.history.replaceState(window.history.state, "", `#${slug}`);
    if (reveal)
      requestAnimationFrame(() => {
        currentHeading.current?.focus({ preventScroll: true });
        currentHeading.current?.scrollIntoView({
          block: "center",
          behavior: "instant",
        });
      });
  }
  const current = nodes.find((n) => n.slug === selected) ?? nodes[0];
  const visible = nodes.filter((n) =>
    `${n.title} ${n.symbol ?? ""} ${n.summary}`
      .toLocaleLowerCase("ru")
      .includes(query.trim().toLocaleLowerCase("ru")),
  );
  const related = current
    ? neighborsOf(current.slug, nodes, resolveKnowledgeEdges(nodes, edges))
    : [];
  const path = learningPaths.find((p) => p.id === pathId);
  const steps =
    path?.slugs
      .map((slug) => nodes.find((n) => n.slug === slug))
      .filter((n): n is KnowledgeNode => !!n) ?? [];
  const step = steps.findIndex((n) => n.slug === selected);
  if (!current)
    return (
      <p className="empty-state">
        Материалы появятся после публикации.{" "}
        <Link href="/knowledge">В библиотеку →</Link>
      </p>
    );
  const art = articleArtwork(current.slug, current.symbol);
  return (
    <div className="knowledge-atlas">
      <section className="atlas-paths" aria-label="Маршруты изучения">
        {learningPaths.map((p) => (
          <button
            type="button"
            key={p.id}
            aria-pressed={pathId === p.id}
            onClick={() => {
              setPathId(p.id);
              setQuery("");
              choose(
                p.slugs.find((s) => nodes.some((n) => n.slug === s)) ?? first,
              );
            }}
          >
            <span>{p.title} ↗</span>
            <small>{p.description}</small>
          </button>
        ))}
      </section>
      <div className="atlas-layout">
        <aside className="atlas-index" aria-label="Темы библиотеки">
          <label htmlFor="atlas-search">
            Найти понятие{" "}
            <span>
              {visible.length} / {nodes.length}
            </span>
          </label>
          <input
            id="atlas-search"
            type="search"
            placeholder="Например, время или стихия"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="atlas-clear"
              onClick={() => setQuery("")}
            >
              Сбросить поиск ×
            </button>
          )}
          {visible.length === 0 ? (
            <p role="status">
              Ничего не найдено. Попробуйте «час», «столпы» или «вода».
            </p>
          ) : (
            <>
              <select
                className="atlas-mobile-select"
                aria-label="Выберите понятие"
                value={visible.some((n) => n.slug === selected) ? selected : ""}
                onChange={(e) => choose(e.target.value, true, true)}
              >
                <option value="" disabled>
                  Выберите понятие
                </option>
                {visible.map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.title}
                  </option>
                ))}
              </select>
              <div className="atlas-topic-list">
                {visible.map((n) => (
                  <button
                    type="button"
                    key={n.slug}
                    aria-pressed={selected === n.slug}
                    onClick={() => choose(n.slug)}
                  >
                    <span aria-hidden="true">{n.symbol ?? "◇"}</span>
                    {n.title}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
        <div className="atlas-content">
          <div className="atlas-toolbar">
            <button
              type="button"
              disabled={!history.length}
              onClick={() => {
                const previous = history.at(-1);
                if (previous) {
                  setHistory((h) => h.slice(0, -1));
                  choose(previous, false);
                }
              }}
            >
              ← Предыдущая тема
            </button>
            <Link href="/knowledge">Все статьи ↗</Link>
          </div>
          {path && (
            <section className="atlas-steps" aria-label={path.title}>
              <div>
                <strong>{path.title}</strong>
                <button type="button" onClick={() => setPathId("")}>
                  Закрыть маршрут ×
                </button>
              </div>
              <ol>
                {steps.map((n, i) => (
                  <li key={n.slug}>
                    <button
                      type="button"
                      aria-current={selected === n.slug ? "step" : undefined}
                      onClick={() => choose(n.slug)}
                    >
                      <b>{i + 1}</b>
                      {n.title}
                    </button>
                  </li>
                ))}
              </ol>
              <div className="atlas-step-actions">
                <span>
                  {step >= 0
                    ? `Шаг ${step + 1} из ${steps.length}`
                    : "Вы исследуете соседнюю тему. Вернитесь к любому шагу выше."}
                </span>
                {step >= 0 && step < steps.length - 1 && (
                  <button
                    type="button"
                    onClick={() => choose(steps[step + 1].slug)}
                  >
                    Следующая тема →
                  </button>
                )}
                {step === steps.length - 1 && (
                  <span>Последняя тема маршрута</span>
                )}
              </div>
            </section>
          )}
          <section
            className="atlas-current"
            aria-labelledby="atlas-current-title"
          >
            <Image
              src={art.image}
              alt={art.alt}
              sizes="(max-width: 600px) 90px, 160px"
            />
            <div>
              <div className="eyebrow">ВЫБРАННОЕ ПОНЯТИЕ</div>
              <h2 ref={currentHeading} tabIndex={-1} id="atlas-current-title">
                {current.title}
              </h2>
              <p>{current.summary}</p>
              <Link className="text-button" href={`/knowledge/${current.slug}`}>
                Читать статью ↗
              </Link>
            </div>
          </section>
          <p className="atlas-announcement" role="status">
            Выбрано: {current.title}. Связанных тем: {related.length}.
          </p>
          <section className="atlas-connections" aria-label="Связанные понятия">
            <h3>С чем связано · {related.length}</h3>
            <p className="atlas-key">
              Стрелка показывает направление связи. «Помогает понять» — связь
              между темами для изучения; порождение и контроль — отношения
              стихий.
            </p>
            {related.length ? (
              <div className="atlas-neighbors">
                {related.map(({ node, links }) => (
                  <article className="atlas-neighbor" key={node.slug}>
                    <button
                      type="button"
                      className="atlas-node"
                      onClick={() => choose(node.slug, true, true)}
                    >
                      <span aria-hidden="true">{node.symbol ?? "◇"}</span>
                      <strong>{node.title}</strong>
                      <span aria-hidden="true">↗</span>
                    </button>
                    {links.map((link) => (
                      <div
                        className="atlas-relation"
                        data-kind={link.kind}
                        key={`${link.source}-${link.target}-${link.kind}`}
                      >
                        <span>
                          {link.label} ·{" "}
                          {link.source === selected
                            ? "от выбранной темы →"
                            : "к выбранной теме ←"}
                        </span>
                        <p>{link.explanation}</p>
                      </div>
                    ))}
                  </article>
                ))}
              </div>
            ) : (
              <p>
                Для этой статьи связи пока не описаны. Выберите другую тему или
                откройте материал.
              </p>
            )}
          </section>
          <p className="method-note">
            Атлас помогает освоить библиотеку. Связи здесь не являются
            персональной интерпретацией вашей карты.
          </p>
        </div>
      </div>
    </div>
  );
}
