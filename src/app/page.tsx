import Link from "next/link";
import { HeroArtwork } from "@/scenes/hero-artwork";
import { ElementGallery } from "@/components/element-gallery";
import { Arrow } from "@/components/icons";
import { Intro } from "@/components/intro";
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
            Четыре столпа. Пять элементов. Бесконечность связей.
            <br />
            Откройте свою карту Ба Цзы и исследуйте
            <br className="desktop-break" /> тонкую архитектуру времени.
          </p>
          <div className="hero-buttons">
            <Link href="/calculator" className="button primary">
              Рассчитать карту <Arrow />
            </Link>
            <Link href="/chart/demo" className="text-button">
              Исследовать демо <span>↗</span>
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
        <div className="vertical-note">
          FOUR PILLARS · FIVE ELEMENTS · ONE YOU
        </div>
      </section>
      <div className="coordinate-strip">
        <span>
          <i /> СИСТЕМА БА ЦЗЫ
        </span>
        <span>
          天 НЕБО <b>·</b> 地 ЗЕМЛЯ <b>·</b> 人 ЧЕЛОВЕК
        </span>
        <a href="#discover">ПРОДОЛЖИТЬ ИССЛЕДОВАНИЕ ↓</a>
      </div>
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
        <div className="discovery-grid">
          {[
            {
              n: "01",
              href: "/chart/demo",
              title: "Ваша матрица",
              sub: "ЧЕТЫРЕ СТОЛПА",
              text: "Восемь знаков, из которых начинается личная история.",
              art: (
                <div className="mini-pillars">
                  {["甲寅", "丙午", "戊辰", "壬子"].map((s, i) => (
                    <span key={s} style={{ height: `${88 - i * 9}px` }}>
                      {s[0]}
                      <i>{s[1]}</i>
                    </span>
                  ))}
                </div>
              ),
            },
            {
              n: "02",
              href: "/explore",
              title: "Всё во взаимодействии",
              sub: "ПЯТЬ ЭЛЕМЕНТОВ",
              text: "Исследуйте циклы порождения и контроля в живой системе.",
              art: (
                <div className="mini-reactor">
                  <span>木</span>
                  <span>火</span>
                  <span>土</span>
                  <span>金</span>
                  <span>水</span>
                </div>
              ),
            },
            {
              n: "03",
              href: "/chart/demo#timeline",
              title: "Ритмы времени",
              sub: "ЦИКЛЫ ДА ЮНЬ",
              text: "Увидьте, как десятилетия и годы дополняют натальную карту.",
              art: (
                <div className="mini-timeline">
                  {[
                    28, 46, 38, 65, 54, 80, 60, 92, 70, 51, 39, 64, 48, 32, 45,
                  ].map((h, i) => (
                    <i key={i} style={{ height: h }} />
                  ))}
                </div>
              ),
            },
          ].map((item) => (
            <Link className="discovery-item" href={item.href} key={item.n}>
              <div className="item-top">
                <span className="mono">
                  {item.n} / {item.sub}
                </span>
                <Arrow diagonal />
              </div>
              <div className="item-art">{item.art}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          ))}
        </div>
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
