import Image from "next/image";
import Link from "next/link";
import { libraryArtwork } from "@/assets/artwork";
import { articleArtwork } from "@/assets/library-artwork";

export function KnowledgeHero() {
  return (
    <section className="knowledge-hero">
      <div className="knowledge-hero-copy">
        <div className="eyebrow">ACADEMY / БАЗА ЗНАНИЙ</div>
        <h1>
          Язык, на котором <em>говорит карта.</em>
        </h1>
        <p>
          От первого символа до системы взаимосвязей. Материалы для
          внимательного исследования Ба Цзы.
        </p>
        <Link className="button" href="/knowledge/graph">
          Атлас знаний · с чего начать ↗
        </Link>
      </div>
      <div className="celestial-art knowledge-hero-art">
        <Image
          src={libraryArtwork.image}
          alt={libraryArtwork.alt}
          priority
          sizes="(max-width: 800px) 100vw, 50vw"
        />
        <span className="art-spark art-spark-one" />
        <span className="art-spark art-spark-two" />
      </div>
    </section>
  );
}

export function KnowledgeCardArt({
  symbol,
  slug = "",
}: {
  symbol: string | null;
  slug?: string;
}) {
  const art = articleArtwork(slug, symbol);
  return (
    <div className="knowledge-card-art" aria-hidden="true">
      <Image src={art.image} alt="" sizes="(max-width: 600px) 85vw, 30vw" />
    </div>
  );
}
