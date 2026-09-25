"use client";
import { useState } from "react";
import Image from "next/image";
import { elements, type ElementId } from "@/domain/bazi/catalog";
import { elementArtwork, observatoryArtwork } from "@/assets/artwork";

export function HeroArtwork() {
  const [active, setActive] = useState<ElementId | null>(null);
  const art = active ? elementArtwork[active] : observatoryArtwork;
  const element = elements.find((e) => e.id === active);
  return (
    <div className="hero-scene hero-scene--illustrated">
      <div className="hero-art-stage">
        <Image
          key={active ?? "observatory"}
          src={art.image}
          alt={art.alt}
          unoptimized
          loading="eager"
          fetchPriority={active ? "auto" : "high"}
          className="hero-art-image"
        />
      </div>
      <div className="scene-tag art-heading">
        <i /> ОБСЕРВАТОРИЯ ПЯТИ ЭЛЕМЕНТОВ
      </div>
      <div className="art-caption" aria-live="polite">
        <span className="mono">
          {element ? element.en : "FIVE ELEMENTS / ONE SYSTEM"}
        </span>
        <span>
          {element ? element.quality : "У каждой силы — своя природа."}
        </span>
      </div>
      <div className="art-selector" aria-label="Образы пяти элементов">
        <button
          aria-label="Обсерватория"
          aria-pressed={!active}
          onClick={() => setActive(null)}
        >
          ◎
        </button>
        {elements.map((e) => (
          <button
            key={e.id}
            aria-label={e.name}
            aria-pressed={active === e.id}
            onClick={() => setActive(e.id)}
            style={{ "--element": e.color } as React.CSSProperties}
          >
            {e.symbol}
          </button>
        ))}
      </div>
    </div>
  );
}
