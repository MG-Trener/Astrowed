"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { elementArtwork } from "@/assets/artwork";
import { ElementsReactor } from "@/scenes/elements-reactor";
import { elements, type ElementId } from "@/domain/bazi/catalog";
export function ExploreView() {
  const [selected, setSelected] = useState<ElementId>("wood");
  useEffect(() => {
    const syncHash = () => {
      const id = window.location.hash.slice(1);
      if (elements.some((e) => e.id === id)) {
        setSelected(id as ElementId);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  const index = elements.findIndex((e) => e.id === selected),
    element = elements[index];
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">EXPLORE / ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ</div>
          <h1>Всё связано.</h1>
          <p>
            Пять фаз одного движения. Выберите элемент, чтобы увидеть его место
            в системе.
          </p>
        </div>
        <span className="badge">五行 · У СИН</span>
      </div>
      <div className="explore-layout">
        <ElementsReactor selected={selected} onSelect={setSelected} />
        <section className="explore-detail">
          <div className="tabs" aria-label="Элементы">
            {elements.map((e) => (
              <button
                key={e.id}
                aria-pressed={e.id === selected}
                onClick={() => setSelected(e.id)}
              >
                {e.symbol} {e.name}
              </button>
            ))}
          </div>
          <figure className="element-portrait">
            <Image
              key={selected}
              src={elementArtwork[selected].image}
              alt={elementArtwork[selected].alt}
              unoptimized
              className="element-portrait-image"
            />
            <figcaption style={{ color: element.color }}>
              {element.symbol}
            </figcaption>
          </figure>
          <div className="eyebrow">
            {element.en} / {String(index + 1).padStart(2, "0")}
          </div>
          <h2 style={{ marginTop: 10 }}>{element.quality}</h2>
          <p>{element.description}</p>
          <dl className="fact-grid">
            <div>
              <dt>СЕЗОН</dt>
              <dd>{element.season}</dd>
            </div>
            <div>
              <dt>НЕБЕСНЫЕ СТВОЛЫ</dt>
              <dd>{element.stems}</dd>
            </div>
            <div>
              <dt>ЗЕМНЫЕ ВЕТВИ</dt>
              <dd>{element.branches}</dd>
            </div>
            <div>
              <dt>ПОЛЯРНОСТЬ</dt>
              <dd>Инь и Ян</dd>
            </div>
          </dl>
          <div className="explore-relations">
            Порождает →{" "}
            <button
              onClick={() => setSelected(elements[(index + 1) % 5].id)}
              style={{ color: elements[(index + 1) % 5].color }}
            >
              {elements[(index + 1) % 5].name}
            </button>
            <br />
            Контролирует →{" "}
            <button
              onClick={() => setSelected(elements[(index + 2) % 5].id)}
              style={{ color: elements[(index + 2) % 5].color }}
            >
              {elements[(index + 2) % 5].name}
            </button>
            <br />
            Получает поддержку ←{" "}
            <button
              onClick={() => setSelected(elements[(index + 4) % 5].id)}
              style={{ color: elements[(index + 4) % 5].color }}
            >
              {elements[(index + 4) % 5].name}
            </button>
          </div>
          <Link href={`/knowledge/${element.id}`} className="text-button">
            Статья в библиотеке ↗
          </Link>
        </section>
      </div>
      <p className="legal-note">
        Исследовательская модель традиционных соответствий. Описание элемента не
        является персональной характеристикой или прогнозом.
      </p>
    </div>
  );
}
