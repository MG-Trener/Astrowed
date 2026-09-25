import Link from "next/link";
import { DiscoveryVisuals } from "@/scenes/discovery-visuals";
import { HeroArtwork } from "@/scenes/hero-artwork";
import { ElementGallery } from "@/components/element-gallery";
import { Arrow } from "@/components/icons";
import { Intro } from "@/components/intro";
import { PlatformDirections } from "@/components/expansion-pages";
export default function Home() {
  return (
    <>
      <Intro />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> ОБСЕРВАТОРИЯ ВРЕМЕНИ И ЭЛЕМЕНТОВ
          </div>
          <h1>
            У каждого
            <br />
            момента есть
            <br />
            <em>своя природа.</em>
          </h1>
          <p className="hero-description">
            Ба Цзы. Фэн Шуй. Ци Мэнь Дунь Цзя.
            <br />
            Исследуйте человека, пространство
            <br className="desktop-break" /> и тонкую архитектуру времени.
          </p>
          <div className="hero-buttons">
            <Link href="/calculator" className="button primary">
              Рассчитать карту <Arrow />
            </Link>
            <Link href="/chart/current" className="text-button">
              Открыть мою карту <span>↗</span>
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="tiny-orbit">◎</span>
            <span>
              На пересечении древнего знания
              <br />и современного взгляда на данные
            </span>
          </div>
        </div>
        <HeroArtwork />
        <div className="vertical-note">PERSON · SPACE · TIME</div>
      </section>
      <div className="coordinate-strip">
        <span>
          <i /> ТРИ НАПРАВЛЕНИЯ · ОДНА ПЛАТФОРМА
        </span>
        <span>
          天 НЕБО <b>·</b> 地 ЗЕМЛЯ <b>·</b> 人 ЧЕЛОВЕК
        </span>
        <a href="#discover">ПРОДОЛЖИТЬ ИССЛЕДОВАНИЕ ↓</a>
      </div>
      <PlatformDirections />
      <ElementGallery />
      <section id="discover" className="discovery-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / ПРОСТРАНСТВО ИССЛЕДОВАНИЯ</div>
            <h2>
              Увидеть больше.
              <br />
              <span className="muted">Понять глубже.</span>
            </h2>
          </div>
          <p>
            Не набор предсказаний, а язык взаимосвязей.
            <br />
            Перейдите от отдельных символов
            <br />к целостной картине.
          </p>
        </div>
        <DiscoveryVisuals />
      </section>
      <section className="closing-note">
        <span className="chinese">知</span>
        <div>
          <div className="eyebrow">ЗНАНИЕ НАЧИНАЕТСЯ С ЛЮБОПЫТСТВА</div>
          <h2>
            Сначала — исследовать.
            <br />
            Потом — интерпретировать.
          </h2>
        </div>
        <Link className="text-button" href="/knowledge">
          Открыть академию <Arrow diagonal />
        </Link>
      </section>
    </>
  );
}
