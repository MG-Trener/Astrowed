import Image from "next/image";
import Link from "next/link";
import { elements } from "@/domain/bazi/catalog";
import { elementArtwork } from "@/assets/artwork";

export function ElementGallery() {
  return (
    <section
      className="element-gallery-section"
      aria-labelledby="element-gallery-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow">МАТЕРИЯ / ДВИЖЕНИЕ / ХАРАКТЕР</div>
          <h2 id="element-gallery-title">
            Пять сил. <span className="muted">Один мир.</span>
          </h2>
        </div>
        <p>
          От живого роста до текучести воды.
          <br />
          Выберите образ и исследуйте его связи.
        </p>
      </div>
      <div className="element-art-grid">
        {elements.map((e, index) => (
          <Link
            href={`/explore#${e.id}`}
            className="element-art-card"
            key={e.id}
          >
            <span className="element-art-index">
              0{index + 1} / {e.en}
            </span>
            <Image
              src={elementArtwork[e.id].image}
              alt={elementArtwork[e.id].alt}
              unoptimized
              className="element-card-image"
            />
            <div className="element-art-label">
              <span style={{ color: e.color }}>{e.symbol}</span>
              <h3>{e.name}</h3>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
